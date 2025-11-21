require("dotenv").config({ path: "../../.env" });
const pool = require("../config/connectBdd");

/**
 * Supprime une notification pour l'utilisateur connecté.
 * Endpoint: DELETE /notifications/:id
 */
async function deleteNotification(req, res) {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    if (!notificationId) {
      return res.status(400).json({ message: "ID de notification manquant" });
    }

    // Récupérer les notifications de l'utilisateur
    const result = await pool.query("SELECT notifications FROM users WHERE id = $1", [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const notifications = result.rows[0].notifications || [];

    // Filtrer pour supprimer la notification correspondante
    const updatedNotifications = notifications.filter(
      (notif) => notif.id?.toString() !== notificationId.toString()
    );

    if (updatedNotifications.length === notifications.length) {
      return res.status(404).json({ message: "Notification introuvable" });
    }

    // Mettre à jour les notifications dans la BDD
    await pool.query("UPDATE users SET notifications = $1 WHERE id = $2", [
      updatedNotifications,
      userId,
    ]);

    return res.status(200).json({ message: "Notification supprimée avec succès" });
  } catch (error) {
    // console.error("Erreur lors de la suppression de la notification:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression de la notification",
    });
  }
}

module.exports = deleteNotification;
