const WebSocket = require("ws");
const pool = require("../config/connectBdd");

async function blockUser(userId, message) {
  console.log("blockUser");
  const { clients } = require("./websockets");
  const username = message.user;
  const userBlockedM = message.userBlocked;
  const action = message.action; // 'block' or 'unblock'
  const ws = clients.get(userId);

  if (!ws) {
    return;
  }

  if (!message.user || !message.userBlocked || !message.action || message.user === message.userBlocked) {
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

  let userBlocked = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [userBlockedM]);
  userBlocked = userBlocked.rows[0];

  if (!userBlocked) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId,
        message: { title: "userBlocked not found" },
      })
    );
    return;
  }

  if (action === "block") {
    // Vérifier si déjà bloqué
    if (user.blacklist && user.blacklist.includes(userBlocked.id.toString())) {
      ws.send(
        JSON.stringify({
          type: "error",
          userId,
          message: { title: "user already blocked" },
        })
      );
      return;
    }

    // Ajouter à la blacklist
    await pool.query("UPDATE users SET blacklist = array_append(blacklist, $1) WHERE id = $2", [
      userBlocked.id.toString(),
      user.id,
    ]);

    console.log(`User ${user.username} blocked ${userBlocked.username}`);

    // Envoyer succès
    ws.send(
      JSON.stringify({
        type: "success",
        userId,
        message: { title: "block", body: `User ${userBlocked.username} has been blocked` },
      })
    );

    // Note: Pas de notification à l'utilisateur bloqué pour des raisons de discrétion
  } else if (action === "unblock") {
    // Vérifier si l'utilisateur est dans la blacklist
    if (!user.blacklist || !user.blacklist.includes(userBlocked.id.toString())) {
      ws.send(
        JSON.stringify({
          type: "error",
          userId,
          message: { title: "user was not blocked" },
        })
      );
      return;
    }

    // Retirer de la blacklist
    await pool.query("UPDATE users SET blacklist = array_remove(blacklist, $1::text) WHERE id = $2", [
      userBlocked.id.toString(),
      user.id,
    ]);

    console.log(`User ${user.username} unblocked ${userBlocked.username}`);

    // Envoyer succès
    ws.send(
      JSON.stringify({
        type: "success",
        userId,
        message: { title: "unblock", body: `User ${userBlocked.username} has been unblocked` },
      })
    );
  } else {
    ws.send(
      JSON.stringify({
        type: "error",
        userId,
        message: { title: "invalid action" },
      })
    );
  }
}

module.exports = blockUser;
