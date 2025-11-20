require("dotenv").config({ path: "../../.env" });
const pool = require("../config/connectBdd");

async function notificationViewed(userId) {
  const { clients } = require("./websockets");
  let ws = clients.get(userId);
  if (!ws) {
    return;
  }

  try {
    const result = await pool.query("SELECT notifications FROM users WHERE id = $1", [userId]);

    if (result.rows.length === 0) {
      ws.send(
        JSON.stringify({
          type: "error",
          userId: userId,
          message: {
            title: "user not found",
          },
        })
      );
      return;
    }

    let notifications = result.rows[0].notifications || [];

    // marque toutes les notifications comme vues
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      viewed: true,
    }));

    await pool.query("UPDATE users SET notifications = $1 WHERE id = $2", [
      updatedNotifications,
      userId,
    ]);
  } catch (error) {
    // console.error('Error marking notifications as viewed:', error);
    ws.send(
      JSON.stringify({
        type: "error",
        userId: userId,
        message: {
          title: "database error",
        },
      })
    );
  }
}

async function deleteNotification(userId, message) {
  const { clients } = require("./websockets");
  let ws = clients.get(userId);
  if (!ws) {
    return;
  }

  if (!message.notificationId) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId: userId,
        message: {
          title: "errors in data sent",
        },
      })
    );
    return;
  }

  try {
    // Get current notifications
    const result = await pool.query("SELECT notifications FROM users WHERE id = $1", [userId]);

    if (result.rows.length === 0) {
      ws.send(
        JSON.stringify({
          type: "error",
          userId: userId,
          message: {
            title: "user not found",
          },
        })
      );
      return;
    }

    let notifications = result.rows[0].notifications || [];

    // efface la notification specifique
    const originalLength = notifications.length;
    const updatedNotifications = notifications.filter(
      (notification) => notification !== message.notification
    );

    if (updatedNotifications.length === originalLength) {
      // console.log('notification not found');
      return;
    }

    await pool.query("UPDATE users SET notifications = $1 WHERE id = $2", [
      updatedNotifications,
      userId,
    ]);
  } catch (error) {
    // console.error('Error deleting notification:', error);
    ws.send(
      JSON.stringify({
        type: "error",
        userId: userId,
        message: {
          title: "database error",
        },
      })
    );
  }
}

module.exports = { notificationViewed, deleteNotification };
