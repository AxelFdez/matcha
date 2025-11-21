const WebSocket = require("ws");
const pool = require("../config/connectBdd");
const { addNotification } = require("./notifications");

async function unlike(userId, message) {
  const { clients } = require("./websockets");
  const username = message.user;
  const userUnlikedM = message.userUnliked;
  const ws = clients.get(userId);

  if (!ws) return;

  // Vérification des données
  if (!username || !userUnlikedM || username === userUnlikedM) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "errors in data sent" } }));
    return;
  }

  // Récupération de l'utilisateur qui unlike
  let user = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [username]);
  user = user.rows[0];
  if (!user) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "user not found" } }));
    return;
  }

  // Récupération de l'utilisateur unliked
  let userUnliked = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [
    userUnlikedM,
  ]);
  userUnliked = userUnliked.rows[0];
  if (!userUnliked) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "userUnliked not found" } }));
    return;
  }

  // Vérifier si l'utilisateur avait été liké
  if (!userUnliked.likedby || !userUnliked.likedby.includes(user.id.toString())) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "user was not liked" } }));
    return;
  }

  // Vérifier si c'était un match
  let userMatcha = await pool.query("SELECT matcha FROM users WHERE id = $1", [user.id]);
  userMatcha = userMatcha.rows[0].matcha || [];
  const wasMatch = userMatcha.includes(userUnliked.id.toString());

  // Retirer le like
  await pool.query("UPDATE users SET likedby = array_remove(likedby, $1::text) WHERE id = $2", [
    user.id.toString(),
    userUnliked.id,
  ]);

  // Ajuster famerating (-10)
  userUnliked.famerating = Math.max(0, (userUnliked.famerating || 0) - 10);
  await pool.query("UPDATE users SET famerating = $1 WHERE id = $2", [
    userUnliked.famerating,
    userUnliked.id,
  ]);

  // Notification d'unlike
  const notifUnlike = await addNotification(userUnliked.id, {
    type: "unlike",
    title: "Unlike",
    body: `${user.username} unliked you`,
    fromUser: user.username,
  });

  const ws2 = clients.get(userUnliked.id.toString());
  if (ws2 && ws2.readyState === WebSocket.OPEN) {
    ws2.send(JSON.stringify({ type: "notification", message: notifUnlike }));
  }

  // Si c'était un match, gérer l'unmatch
  if (wasMatch) {
    const notifUnmatch1 = await addNotification(user.id, {
      type: "unmatch",
      title: "Unmatch",
      body: `${userUnliked.username} unmatched with you`,
      fromUser: userUnliked.username,
    });

    const notifUnmatch2 = await addNotification(userUnliked.id, {
      type: "unmatch",
      title: "Unmatch",
      body: `${user.username} unmatched with you`,
      fromUser: user.username,
    });

    // Retirer le match et ajuster famerating (-50)
    await pool.query(
      "UPDATE users SET matcha = array_remove(matcha, $1::text), famerating = GREATEST(famerating - 50, 0) WHERE id = $2",
      [userUnliked.id.toString(), user.id]
    );
    await pool.query(
      "UPDATE users SET matcha = array_remove(matcha, $1::text), famerating = GREATEST(famerating - 50, 0) WHERE id = $2",
      [user.id.toString(), userUnliked.id]
    );

    // Supprimer la conversation associée
    try {
      const sortedIds = [user.id, userUnliked.id].sort((a, b) => a - b);
      await pool.query(
        "DELETE FROM chat_conversations WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)",
        [sortedIds[0], sortedIds[1]]
      );
    } catch (err) {
      // console.error("Error deleting conversation:", err);
    }

    // Notifications WebSocket unmatch
    if (ws && ws.readyState === WebSocket.OPEN)
      ws.send(JSON.stringify({ type: "notification", message: notifUnmatch1 }));
    if (ws2 && ws2.readyState === WebSocket.OPEN)
      ws2.send(JSON.stringify({ type: "notification", message: notifUnmatch2 }));
  }

  // Confirmation à l'utilisateur qui a unliked
  ws.send(JSON.stringify({ type: "success", userId, message: { title: "unlike" } }));
}

module.exports = unlike;
