const pool = require("../config/connectBdd");
const { addNotification } = require("./notifications"); 

async function notificationViewed(userId) {
  const { clients } = require("./websockets");
  const ws = clients.get(userId);
  if (!ws) return;

  try {
    const result = await pool.query("SELECT notifications FROM users WHERE id = $1", [userId]);
    if (!result.rows.length) return;

    const notifications = result.rows[0].notifications || [];
    const updatedNotifications = notifications.map((n) => ({ ...n, viewed: true }));

    await pool.query("UPDATE users SET notifications = $1 WHERE id = $2", [
      updatedNotifications,
      userId,
    ]);
  } catch (err) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "database error" } }));
  }
}

async function deleteNotification(userId, message) {
  const { clients } = require("./websockets");
  const ws = clients.get(userId);
  if (!ws) return;

  if (!message.notificationId) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "errors in data sent" } }));
    return;
  }

  try {
    const result = await pool.query("SELECT notifications FROM users WHERE id = $1", [userId]);
    if (!result.rows.length) return;

    const notifications = result.rows[0].notifications || [];
    const updatedNotifications = notifications.filter((n) => n.id !== message.notificationId);

    if (updatedNotifications.length === notifications.length) return; // non trouvé

    await pool.query("UPDATE users SET notifications = $1 WHERE id = $2", [
      updatedNotifications,
      userId,
    ]);
  } catch (err) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "database error" } }));
  }
}

module.exports = { notificationViewed, deleteNotification };
