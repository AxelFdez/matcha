require("dotenv").config({ path: "../../.env" });
const pool = require("../config/connectBdd");

async function markNotificationsViewed(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query("SELECT notifications FROM users WHERE id = $1", [userId]);

    if (result.rows.length === 0) {
      console.warn("⚠️ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    let notifications = result.rows[0].notifications || [];

    // Marque toutes les notifications comme vues
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      viewed: true,
    }));

    await pool.query("UPDATE users SET notifications = $1 WHERE id = $2", [
      updatedNotifications,
      userId,
    ]);

    res.status(200).json({ message: "Notifications marked as viewed" });
  } catch (error) {
    console.error("❌ Erreur lors du marquage des notifications comme vues:", error);
    res.status(500).json({
      message: "Erreur du serveur lors du marquage des notifications",
    });
  }
}

module.exports = markNotificationsViewed;
