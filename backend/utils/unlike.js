const WebSocket = require("ws");
const pool = require("../config/connectBdd");

async function unlike(userId, message) {
  console.log("unlikeUser");
  const { clients } = require("./websockets");
  const username = message.user;
  const userUnlikedM = message.userUnliked;
  const ws = clients.get(userId);

  if (!ws) {
    return;
  }

  if (!message.user || !message.userUnliked || message.user === message.userUnliked) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId,
        message: { title: "errors in data sent" },
      })
    );
    return;
  }

  let user = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [username]);
  user = user.rows[0];

  if (!user) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId,
        message: { title: "user not found" },
      })
    );
    return;
  }

  let userUnliked = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [userUnlikedM]);
  userUnliked = userUnliked.rows[0];

  if (!userUnliked) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId,
        message: { title: "userUnliked not found" },
      })
    );
    return;
  }

  if (!userUnliked.likedby || !userUnliked.likedby.includes(user.id.toString())) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId,
        message: { title: "user was not liked" },
      })
    );
    return;
  }

  // Check if it was a match before unliking
  let userMatcha = await pool.query("SELECT matcha FROM users WHERE id = $1", [user.id]);
  userMatcha = userMatcha.rows[0].matcha || [];
  const wasMatch = userMatcha.includes(userUnliked.id.toString());

  // Retirer le like
  await pool.query("UPDATE users SET likedby = array_remove(likedby, $1::text) WHERE id = $2", [
    user.id.toString(),
    userUnliked.id,
  ]);

  // Ajuster famerating (-10 pour le unlike)
  userUnliked.famerating = Math.max(0, (userUnliked.famerating || 0) - 10);
  await pool.query("UPDATE users SET famerating = $1 WHERE id = $2", [
    userUnliked.famerating,
    userUnliked.id,
  ]);

  // Ajouter notification d'unlike
  await pool.query(
    "UPDATE users SET notifications = array_append(notifications, $1) WHERE id = $2",
    [
      { title: "unlike", body: `${user.username} unliked you` },
      userUnliked.id,
    ]
  );

  // Envoyer notification via WebSocket
  const ws2 = clients.get(userUnliked.id.toString());
  if (ws2 && ws2.readyState === WebSocket.OPEN) {
    ws2.send(
      JSON.stringify({
        type: "notification",
        message: { title: "unlike", user: user.username },
      })
    );
  }

  // Si c'était un match, gérer le unmatch
  if (wasMatch) {
    // Retirer le match pour les deux utilisateurs et ajuster famerating (-50 pour unmatch)
    await pool.query(
      "UPDATE users SET matcha = array_remove(matcha, $1::text), famerating = GREATEST(famerating - 50, 0), notifications = array_append(notifications, $2) WHERE id = $3",
      [
        userUnliked.id.toString(),
        { title: "unmatch", body: `${userUnliked.username} unmatched with you` },
        user.id,
      ]
    );

    await pool.query(
      "UPDATE users SET matcha = array_remove(matcha, $1::text), famerating = GREATEST(famerating - 50, 0), notifications = array_append(notifications, $2) WHERE id = $3",
      [
        user.id.toString(),
        { title: "unmatch", body: `${user.username} unmatched with you` },
        userUnliked.id,
      ]
    );

    // Supprimer la conversation associée au match
    try {
      const sortedParticipants = [user.id, userUnliked.id].sort((a, b) => a - b);
      console.log(`Deleting conversation between ${user.username} and ${userUnliked.username}`);
      await pool.query(
        "DELETE FROM chat_conversations WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)",
        [sortedParticipants[0], sortedParticipants[1]]
      );
      console.log(`Conversation deleted between ${user.username} and ${userUnliked.username}`);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }

    // Envoyer notifications unmatch via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "notification",
          message: { title: "unmatch", user: userUnliked.username },
        })
      );
    }

    if (ws2 && ws2.readyState === WebSocket.OPEN) {
      ws2.send(
        JSON.stringify({
          type: "notification",
          message: { title: "unmatch", user: user.username },
        })
      );
    }

    console.log(`Unmatch detected! ${user.username} and ${userUnliked.username} are no longer matched`);
  }

  // Envoyer succès
  ws.send(
    JSON.stringify({
      type: "success",
      userId,
      message: { title: "unlike" },
    })
  );
}

module.exports = unlike;
