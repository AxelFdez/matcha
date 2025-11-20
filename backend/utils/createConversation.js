require("dotenv").config({ path: "../../.env" });
const pool = require("../config/connectBdd");

/**
 * Creates a conversation between two users if it doesn't already exist
 * @param {number} user1Id - First user ID
 * @param {number} user2Id - Second user ID
 * @returns {Object} - The conversation object or existing conversation
 */
async function createConversation(user1Id, user2Id) {
  try {
    // Normalize user IDs (always store smaller ID as user1_id)
    const normalizedUser1Id = Math.min(user1Id, user2Id);
    const normalizedUser2Id = Math.max(user1Id, user2Id);

    // Check if conversation already exists
    const existingConversation = await pool.query(
      "SELECT * FROM chat_conversations WHERE user1_id = $1 AND user2_id = $2",
      [normalizedUser1Id, normalizedUser2Id]
    );

    if (existingConversation.rows.length > 0) {
      // console.log(`Conversation already exists between users ${user1Id} and ${user2Id}`);
      return existingConversation.rows[0];
    }

    // Create new conversation
    const newConversation = await pool.query(
      `INSERT INTO chat_conversations (user1_id, user2_id, created_at, updated_at)
             VALUES ($1, $2, NOW(), NOW())
             RETURNING *`,
      [normalizedUser1Id, normalizedUser2Id]
    );

    // console.log(`New conversation created between users ${user1Id} and ${user2Id} with ID ${newConversation.rows[0].id}`);
    return newConversation.rows[0];
  } catch (error) {
    // console.error('Error creating conversation:', error);
    throw error;
  }
}

module.exports = { createConversation };
