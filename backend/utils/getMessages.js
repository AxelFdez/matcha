const pool = require("../config/connectBdd");

const getMessages = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const conversationId = parseInt(req.params.conversationId);

    if (!userId || !conversationId) {
      return res.status(400).json({
        message: "User ID and conversation ID are required",
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
        message: "Access denied to this conversation",
      });
    }

    // Marquer tous les messages non lus de l'autre utilisateur comme lus
    const markAsReadQuery = `
      UPDATE chat_messages
      SET read_at = NOW()
      WHERE conversation_id = $1
        AND sender_id != $2
        AND read_at IS NULL
    `;
    await pool.query(markAsReadQuery, [conversationId, userId]);

    // Récupérer les messages de la conversation
    const messagesQuery = `
      SELECT
        cm.id,
        cm.sender_id,
        cm.message,
        cm.sent_at,
        cm.read_at,
        u.username as sender_username
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.conversation_id = $1
      ORDER BY cm.sent_at ASC
    `;

    const result = await pool.query(messagesQuery, [conversationId]);

    const messages = result.rows.map((row) => ({
      conversationId: conversationId,
      id: row.id,
      sender: row.sender_id.toString(),
      senderUsername: row.sender_username,
      message: row.message,
      date: row.sent_at,
      readAt: row.read_at, // Optionnel : pour afficher les double checks
    }));

    res.status(200).json({
      messages: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

module.exports = getMessages;
