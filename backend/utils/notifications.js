// utils/notifications.js
const pool = require("../config/connectBdd");

async function addNotification(userId, { type, title, body, fromUser }) {
  const notif = {
    id: Date.now().toString(),
    type,
    title,
    body,
    fromUser: fromUser || null,
    createdAt: new Date().toISOString(),
    viewed: false,
  };

  await pool.query(
    "UPDATE users SET notifications = array_append(notifications, $1) WHERE id = $2",
    [notif, userId]
  );

  return notif;
}

module.exports = { addNotification };
