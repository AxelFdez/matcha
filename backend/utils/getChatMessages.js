const pool = require('../config/connectBdd');
const Chat = require('../models/Chat');

async function getChatMessages(req, res) {
    try {
        const userId = req.userId;
        const { username } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        // Get the other user by username
        const userResult = await pool.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const otherUserId = userResult.rows[0].id;

        const currentUserResult = await pool.query('SELECT matcha FROM users WHERE id = $1', [userId]);
        const currentUser = currentUserResult.rows[0];
        const userMatcha = currentUser.matcha || [];

        if (!userMatcha.includes(otherUserId.toString())) {
            return res.status(403).json({
                success: false,
                message: 'You can only chat with matched users'
            });
        }

        const { user1_id, user2_id } = Chat.normalizeUserIds(userId, otherUserId);
        
        const conversationResult = await pool.query(
            'SELECT id FROM chat_conversations WHERE user1_id = $1 AND user2_id = $2',
            [user1_id, user2_id]
        );

        if (conversationResult.rows.length === 0) {
            return res.status(200).json({
                success: true,
                messages: [],
                hasMore: false
            });
        }

        const conversationId = conversationResult.rows[0].id;
        
        const messages = await Chat.getMessages(conversationId, parseInt(limit), parseInt(offset));
        
        res.status(200).json({
            success: true,
            messages: messages,
            hasMore: messages.length === parseInt(limit)
        });
    } catch (error) {
        console.error('Error getting chat messages:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = getChatMessages;