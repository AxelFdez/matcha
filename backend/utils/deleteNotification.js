require('dotenv').config({ path: '../../.env' });
const pool = require('../config/connectBdd');

async function deleteNotification(req, res) {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;
        
        // Get current notifications
        const result = await pool.query(
            'SELECT notifications FROM users WHERE id = $1',
            [userId]
        );

        console.log('Deleting notificationId:', notificationId, 'for userId:', userId);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        
        let notifications = result.rows[0].notifications || [];
        
        // Remove the notification with the specified ID
        const originalLength = notifications.length;
        const updatedNotifications = notifications.filter((notification, index) => {
            const notifId = notification.id || index;
            return notifId.toString() !== notificationId.toString();
        });
        
        if (updatedNotifications.length === originalLength) {
            return res.status(404).json({ message: "Notification not found" });
        }
        
        // Update notifications in database - PostgreSQL expects individual JSONB objects
        await pool.query(
            'UPDATE users SET notifications = $1 WHERE id = $2',
            [updatedNotifications, userId]
        );
        
        res.status(200).json({ message: "Notification deleted successfully" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la notification:", error);
        res.status(500).json({ message: "Erreur du serveur lors de la suppression de la notification" });
    }
}

module.exports = deleteNotification;