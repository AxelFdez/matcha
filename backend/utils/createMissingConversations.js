require("dotenv").config({ path: "../../.env" });
const pool = require("../config/connectBdd");
const { createConversation } = require("./createConversation");

/**
 * Creates conversations for all matched users who don't have conversations yet
 */
async function createMissingConversations() {
  try {
    // console.log('Checking for missing conversations between matched users...');

    // Get all users with their match lists
    const users = await pool.query(
      "SELECT id, username, matcha FROM users WHERE matcha IS NOT NULL"
    );

    const conversationsCreated = [];

    for (const user of users.rows) {
      if (!user.matcha || user.matcha.length === 0) continue;

      for (const matchedUserId of user.matcha) {
        // Check if conversation already exists
        const user1Id = Math.min(user.id, parseInt(matchedUserId));
        const user2Id = Math.max(user.id, parseInt(matchedUserId));

        const existingConversation = await pool.query(
          "SELECT id FROM chat_conversations WHERE user1_id = $1 AND user2_id = $2",
          [user1Id, user2Id]
        );

        if (existingConversation.rows.length === 0) {
          try {
            const conversation = await createConversation(user.id, parseInt(matchedUserId));
            conversationsCreated.push({
              conversationId: conversation.id,
              user1: user.id,
              user2: parseInt(matchedUserId),
            });
            // console.log(`Created missing conversation between user ${user.id} and ${matchedUserId}`);
          } catch (error) {
            // console.error(`Failed to create conversation between ${user.id} and ${matchedUserId}:`, error.message);
          }
        }
      }
    }

    // console.log(`Created ${conversationsCreated.length} missing conversations`);
    return conversationsCreated;
  } catch (error) {
    // console.error('Error creating missing conversations:', error);
    throw error;
  }
}

module.exports = { createMissingConversations };
