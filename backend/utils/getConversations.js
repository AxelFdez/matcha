const pool = require("../config/connectBdd");

const getConversations = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    // Récupérer les conversations de l'utilisateur avec dernier message et messages non lus
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
        END as other_user_avatar,
        (
          SELECT COUNT(*)
          FROM chat_messages cm
          WHERE cm.conversation_id = cc.id
            AND cm.sender_id != $1
            AND cm.read_at IS NULL
        ) as unread_count,
        lm.id as last_message_id,
        lm.sender_id as last_message_sender,
        lm.message as last_message_text,
        lm.sent_at as last_message_date
      FROM chat_conversations cc
      JOIN users u1 ON cc.user1_id = u1.id
      JOIN users u2 ON cc.user2_id = u2.id
      LEFT JOIN LATERAL (
        SELECT id, sender_id, message, sent_at
        FROM chat_messages
        WHERE conversation_id = cc.id
        ORDER BY sent_at DESC
        LIMIT 1
      ) lm ON true
      WHERE cc.user1_id = $1 OR cc.user2_id = $1
      ORDER BY COALESCE(lm.sent_at, cc.created_at) DESC
    `;

    const result = await pool.query(conversationsQuery, [userId]);

    const conversations = result.rows.map((row) => ({
      id: row.conversation_id,
      otherUser: {
        id: row.other_user_id,
        username: row.other_username,
        avatar: row.other_user_avatar,
      },
      lastMessage: row.last_message_id
        ? {
            id: row.last_message_id,
            sender: row.last_message_sender,
            message: row.last_message_text,
            date: row.last_message_date,
          }
        : null,
      unreadCount: parseInt(row.unread_count) || 0,
      hasUnreadMessages: parseInt(row.unread_count) > 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.status(200).json({
      conversations: conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      message: "Error fetching conversations",
      error: error.message,
    });
  }
};

module.exports = getConversations;
