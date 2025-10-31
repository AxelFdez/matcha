require("dotenv").config({ path: "../../.env" });
const pool = require("../config/connectBdd");

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    console.log("Fetching notifications for userId:", userId);

    const result = await pool.query("SELECT notifications FROM users WHERE id = $1", [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const notifications = result.rows[0].notifications || [];
    console.log(`Found ${notifications.length} notifications for userId ${userId}`);
    console.log("Notifications:", notifications);

    // format notifications
    const formattedNotifications = notifications.map((notification, index) => ({
      id: notification.id || index,
      title: notification.title || notification.type || "Notification",
      message: notification.body,
      viewed: notification.viewed || false,
      createdAt: notification.createdAt || notification.date || new Date().toISOString(),
    }));

    // trie les notifications par date décroissante
    formattedNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(formattedNotifications);

    console.log(`Notifications sent for userId ${userId}`, formattedNotifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    res
      .status(500)
      .json({ message: "Erreur du serveur lors de la récupération des notifications" });
  }
}

module.exports = getNotifications;
