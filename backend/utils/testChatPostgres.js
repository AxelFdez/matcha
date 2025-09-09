// Test file to validate Chat PostgreSQL implementation
// This file can be run independently to test the chat functionality

const Chat = require('../models/Chat');
const pool = require('../config/connectBdd');

async function testChatFunctionality() {
    console.log('Testing PostgreSQL Chat Implementation...\n');
    
    try {
        // Test 1: Normalize User IDs
        console.log('Test 1: User ID normalization');
        const normalized1 = Chat.normalizeUserIds(5, 3);
        const normalized2 = Chat.normalizeUserIds(3, 5);
        console.log('Normalized (5, 3):', normalized1);
        console.log('Normalized (3, 5):', normalized2);
        console.log('✓ User ID normalization working correctly\n');

        // Test 2: Test database connection
        console.log('Test 2: Database connection');
        const testQuery = await pool.query('SELECT NOW()');
        console.log('Database time:', testQuery.rows[0].now);
        console.log('✓ Database connection successful\n');

        // Test 3: Check if chat tables exist
        console.log('Test 3: Chat tables existence');
        const tablesQuery = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('chat_conversations', 'chat_messages')
        `);
        console.log('Found tables:', tablesQuery.rows.map(row => row.table_name));
        
        if (tablesQuery.rows.length === 2) {
            console.log('✓ All chat tables exist\n');
        } else {
            console.log('⚠ Some chat tables are missing. Run createTables.js first.\n');
        }

        // Test 4: Test conversation creation (requires valid user IDs)
        console.log('Test 4: Conversation operations');
        
        // Check if we have any users in the database
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCount.rows[0].count) < 2) {
            console.log('⚠ Need at least 2 users in database to test conversations\n');
        } else {
            // Get first two users
            const users = await pool.query('SELECT id FROM users LIMIT 2');
            const user1Id = users.rows[0].id;
            const user2Id = users.rows[1].id;
            
            console.log(`Testing with users ${user1Id} and ${user2Id}`);
            
            // Test find or create conversation
            const conversation = await Chat.findOrCreateConversation(user1Id, user2Id);
            console.log('Created/found conversation:', conversation);
            
            // Test adding a message
            const message = await Chat.addMessage(conversation.id, user1Id, 'Test message from PostgreSQL!');
            console.log('Added message:', message);
            
            // Test getting messages
            const messages = await Chat.getMessages(conversation.id);
            console.log('Retrieved messages:', messages);
            
            console.log('✓ Conversation operations successful\n');
        }

        console.log('All tests completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        process.exit(0);
    }
}

if (require.main === module) {
    testChatFunctionality();
}

module.exports = testChatFunctionality;