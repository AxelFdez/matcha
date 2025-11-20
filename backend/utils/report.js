const WebSocket = require("ws");
const pool = require("../config/connectBdd");
const { addNotification } = require("./notifications"); // CommonJS require

async function reportUser(userId, message) {
  const { clients } = require("./websockets");
  const username = message.user;
  const userReportedM = message.userReported;
  const ws = clients.get(userId);

  if (!ws) return;

  // Vérification des données
  if (!username || !userReportedM || username === userReportedM) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "errors in data sent" } }));
    return;
  }

  // Récupération de l'utilisateur qui reporte
  let user = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [username]);
  user = user.rows[0];
  if (!user) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "user not found" } }));
    return;
  }

  // Récupération de l'utilisateur reporté
  let userReported = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [
    userReportedM,
  ]);
  userReported = userReported.rows[0];
  if (!userReported) {
    ws.send(
      JSON.stringify({ type: "error", userId, message: { title: "userReported not found" } })
    );
    return;
  }

  // Incrémentation du compteur de signalements
  const newReportedCount = (userReported.reported || 0) + 1;
  await pool.query("UPDATE users SET reported = $1 WHERE id = $2", [
    newReportedCount,
    userReported.id,
  ]);

  // Notification pour l'utilisateur reporté
  const notification = { title: "report", body: `You have been reported as fake account` };
  await addNotification(userReported.id, notification, clients);

  // Confirmation à l'utilisateur qui reporte
  ws.send(
    JSON.stringify({
      type: "success",
      userId,
      message: { title: "report", body: `User ${userReported.username} has been reported` },
    })
  );
}

module.exports = reportUser;
