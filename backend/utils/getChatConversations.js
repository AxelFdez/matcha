const Chat = require('../models/Chat');

async function getChatConversations(req, res) {
    try {
        const userId = req.userId; // From JWT middleware
        
        const conversations = await Chat.getUserConversations(userId);
        
        // Format conversations for frontend
        const formattedConversations = conversations.map(conv => ({
            id: conv.id,
            otherUser: {
                id: conv.user1_id === parseInt(userId) ? conv.user2_id : conv.user1_id,
                username: conv.user1_id === parseInt(userId) ? conv.user2_username : conv.user1_username
            },
            lastMessage: conv.last_message,
            lastMessageAt: conv.last_message_at,
            updatedAt: conv.updated_at
        }));

        res.status(200).json({
            success: true,
            conversations: formattedConversations
        });
    } catch (error) {
        console.error('Error getting chat conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = getChatConversations;