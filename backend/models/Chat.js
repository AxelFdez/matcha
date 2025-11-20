const pool = require("../config/connectBdd");

class Chat {
  // Helper function to normalize user IDs for conversation (always user1_id < user2_id)
  static normalizeUserIds(userId1, userId2) {
    const id1 = parseInt(userId1);
    const id2 = parseInt(userId2);
    return id1 < id2 ? { user1_id: id1, user2_id: id2 } : { user1_id: id2, user2_id: id1 };
  }

  // Find or create a conversation between two users
  static async findOrCreateConversation(userId1, userId2) {
    const { user1_id, user2_id } = this.normalizeUserIds(userId1, userId2);

    try {
      // Try to find existing conversation
      let result = await pool.query(
        "SELECT * FROM chat_conversations WHERE user1_id = $1 AND user2_id = $2",
        [user1_id, user2_id]
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      // Create new conversation if not found
      result = await pool.query(
        `INSERT INTO chat_conversations (user1_id, user2_id)
                 VALUES ($1, $2)
                 RETURNING *`,
        [user1_id, user2_id]
      );

      return result.rows[0];
    } catch (error) {
      // console.error('Error in findOrCreateConversation:', error);
      throw error;
    }
  }

  // Add a message to a conversation
  static async addMessage(conversationId, senderId, message) {
    try {
      const result = await pool.query(
        `INSERT INTO chat_messages (conversation_id, sender_id, message)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
        [conversationId, senderId, message]
      );

      // Update conversation's updated_at timestamp
      await pool.query(
        "UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [conversationId]
      );

      return result.rows[0];
    } catch (error) {
      // console.error('Error in addMessage:', error);
      throw error;
    }
  }

  // Get messages for a conversation
  static async getMessages(conversationId, limit = 50, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT cm.*, u.username as sender_username
                 FROM chat_messages cm
                 JOIN users u ON cm.sender_id = u.id
                 WHERE cm.conversation_id = $1
                 ORDER BY cm.sent_at DESC
                 LIMIT $2 OFFSET $3`,
        [conversationId, limit, offset]
      );

      return result.rows.reverse(); // Return messages in chronological order
    } catch (error) {
      // console.error('Error in getMessages:', error);
      throw error;
    }
  }

  // Get all conversations for a user
  static async getUserConversations(userId) {
    try {
      const result = await pool.query(
        `SELECT cc.*,
                        u1.username as user1_username,
                        u2.username as user2_username,
                        cm.message as last_message,
                        cm.sent_at as last_message_at
                 FROM chat_conversations cc
                 JOIN users u1 ON cc.user1_id = u1.id
                 JOIN users u2 ON cc.user2_id = u2.id
                 LEFT JOIN LATERAL (
                     SELECT message, sent_at
                     FROM chat_messages
                     WHERE conversation_id = cc.id
                     ORDER BY sent_at DESC
                     LIMIT 1
                 ) cm ON true
                 WHERE cc.user1_id = $1 OR cc.user2_id = $1
                 ORDER BY COALESCE(cm.sent_at, cc.updated_at) DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      // console.error('Error in getUserConversations:', error);
      throw error;
    }
  }

  // Find conversation between two specific users (for backward compatibility)
  static async findOne(query) {
    if (query.user1 && query.user2) {
      const { user1_id, user2_id } = this.normalizeUserIds(query.user1, query.user2);

      try {
        const result = await pool.query(
          "SELECT * FROM chat_conversations WHERE user1_id = $1 AND user2_id = $2",
          [user1_id, user2_id]
        );

        if (result.rows.length === 0) {
          return null;
        }

        const conversation = result.rows[0];

        // Get messages for this conversation
        const messages = await this.getMessages(conversation.id);

        // Format to match original MongoDB structure
        return {
          _id: conversation.id,
          user1: conversation.user1_id,
          user2: conversation.user2_id,
          messages: messages.map((msg) => ({
            sender: msg.sender_id,
            message: msg.message,
            date: msg.sent_at,
          })),
          save: async function () {
            // This method is called in the original code but not needed anymore
            // since we save messages individually
            return this;
          },
        };
      } catch (error) {
        // console.error('Error in findOne:', error);
        throw error;
      }
    }
    return null;
  }
}

module.exports = Chat;
