const WebSocket = require("ws");
const pool = require("../config/connectBdd");

async function reportUser(userId, message) {
  console.log("reportUser");
  const { clients } = require("./websockets");
  const username = message.user;
  const userReportedM = message.userReported;
  const ws = clients.get(userId);

  if (!ws) {
    return;
  }

  if (!message.user || !message.userReported || message.user === message.userReported) {
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

  let userReported = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [userReportedM]);
  userReported = userReported.rows[0];

  if (!userReported) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId,
        message: { title: "userReported not found" },
      })
    );
    return;
  }

  // Incrémenter le compteur de signalements
  const newReportedCount = (userReported.reported || 0) + 1;
  await pool.query("UPDATE users SET reported = $1 WHERE id = $2", [newReportedCount, userReported.id]);

  console.log(`User ${userReported.username} reported by ${user.username}. Total reports: ${newReportedCount}`);

  // Ajouter notification au user reporté
  await pool.query("UPDATE users SET notifications = array_append(notifications, $1) WHERE id = $2", [
    { title: "report", body: `You have been reported as fake account` },
    userReported.id,
  ]);

  // Envoyer notification via WebSocket à l'utilisateur reporté
  const ws2 = clients.get(userReported.id.toString());
  if (ws2 && ws2.readyState === WebSocket.OPEN) {
    ws2.send(
      JSON.stringify({
        type: "notification",
        message: { title: "report", user: user.username },
      })
    );
  }

  // Envoyer succès à l'utilisateur qui reporte
  ws.send(
    JSON.stringify({
      type: "success",
      userId,
      message: { title: "report", body: `User ${userReported.username} has been reported` },
    })
  );
}

module.exports = reportUser;
