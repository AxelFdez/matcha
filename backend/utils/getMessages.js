const pool = require('../config/connectBdd');

const getMessages = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const conversationId = parseInt(req.params.conversationId);
    
    if (!userId || !conversationId) {
      return res.status(400).json({
        message: 'User ID and conversation ID are required'
      });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversationCheck = `
      SELECT id FROM chat_conversations 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `;
    const conversationResult = await pool.query(conversationCheck, [conversationId, userId]);
    
    if (conversationResult.rows.length === 0) {
      return res.status(403).json({
        message: 'Access denied to this conversation'
      });
    }

    // Recupérer les messages de la conversation
    const messagesQuery = `
      SELECT 
        cm.id,
        cm.sender_id,
        cm.message,
        cm.sent_at,
        u.username as sender_username
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.conversation_id = $1
      ORDER BY cm.sent_at ASC
    `;
    
    const result = await pool.query(messagesQuery, [conversationId]);
    
    const messages = result.rows.map(row => ({
      id: row.id,
      sender: row.sender_id.toString(),
      senderUsername: row.sender_username,
      message: row.message,
      date: row.sent_at
    }));

    res.status(200).json({
      messages: messages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

module.exports = getMessages;