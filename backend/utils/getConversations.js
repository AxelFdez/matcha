const pool = require('../config/connectBdd');

const getConversations = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    
    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required'
      });
    }

    // Get all conversations for the user with the last message and unread count
    const conversationsQuery = `
      SELECT 
        cc.id as conversation_id,
        cc.created_at,
        cc.updated_at,
        CASE 
          WHEN cc.user1_id = $1 THEN u2.id
          ELSE u1.id
        END as other_user_id,
        CASE 
          WHEN cc.user1_id = $1 THEN u2.username
          ELSE u1.username
        END as other_username,
        CASE 
          WHEN cc.user1_id = $1 THEN (
            CASE 
              WHEN array_length(u2.photos, 1) > u2.profilePicture 
              THEN u2.photos[u2.profilePicture + 1]
              ELSE NULL
            END
          )
          ELSE (
            CASE 
              WHEN array_length(u1.photos, 1) > u1.profilePicture 
              THEN u1.photos[u1.profilePicture + 1]
              ELSE NULL
            END
          )
        END as other_user_avatar
      FROM chat_conversations cc
      JOIN users u1 ON cc.user1_id = u1.id
      JOIN users u2 ON cc.user2_id = u2.id
      WHERE cc.user1_id = $1 OR cc.user2_id = $1
      ORDER BY cc.updated_at DESC
    `;
    
    const result = await pool.query(conversationsQuery, [userId]);
    
    const conversations = result.rows.map(row => ({
      id: row.conversation_id,
      otherUser: {
        id: row.other_user_id,
        username: row.other_username,
        avatar: row.other_user_avatar
      },
      lastMessage: null, // Will be populated in a future enhancement
      unreadCount: 0, // Will be populated in a future enhancement
      hasUnreadMessages: false,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.status(200).json({
      conversations: conversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

module.exports = getConversations;