const WebSocket = require("ws");
const pool = require("../config/connectBdd");
const { addNotification } = require("./notifications"); // notre helper

async function ignoreUser(userId, message) {
  const { clients } = require("./websockets");
  const username = message.user;
  const userIgnoredM = message.userIgnored;
  const ws = clients.get(userId);

  if (!ws) return;

  if (!username || !userIgnoredM || username === userIgnoredM) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId,
        message: { title: "Invalid data sent" },
      })
    );
    return;
  }

  // Récupérer user
  let userRes = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [
    username,
  ]);
  const user = userRes.rows[0];
  if (!user) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId,
        message: { title: "User not found" },
      })
    );
    return;
  }

  // Récupérer userIgnored
  let ignoredRes = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [
    userIgnoredM,
  ]);
  const userIgnored = ignoredRes.rows[0];
  if (!userIgnored) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId,
        message: { title: "User to ignore not found" },
      })
    );
    return;
  }

  // Vérifier si déjà ignoré
  if (userIgnored.ignoredby && userIgnored.ignoredby.includes(user.id.toString())) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId,
        message: { title: "User already ignored" },
      })
    );
    return;
  }

  // Ajouter à ignoredby
  await pool.query("UPDATE users SET ignoredby = array_append(ignoredby, $1) WHERE id = $2", [
    user.id,
    userIgnored.id,
  ]);

  // Ajouter notification via helper centralisé
  const notification = await addNotification(userIgnored.id, {
    type: "unlike",
    title: "Unliked",
    body: `${user.username} unliked you`,
    fromUser: user.username,
  });

  // Envoyer notification en temps réel si l'autre utilisateur est en ligne
  const ws2 = clients.get(userIgnored.id.toString());
  if (ws2 && ws2.readyState === WebSocket.OPEN) {
    ws2.send(
      JSON.stringify({
        type: "notification",
        message: notification,
      })
    );
  }

  // Confirmer à l'utilisateur qui ignore
  ws.send(
    JSON.stringify({
      type: "success",
      userId,
      message: { title: "User ignored" },
    })
  );
}

module.exports = ignoreUser;
