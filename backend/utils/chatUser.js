const pool = require('../config/connectBdd');
const WebSocket = require('ws');

async function chatUser(userId, message){
	const { clients } = require('./websockets');
	let ws = clients.get(userId);
	if (!ws) {
		return;
	}
	if (!userId || !message.UserRecipient || !message.message) {
		return ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'errors in data sent',
			}
		}));
	}

	try {
		// Get sender user from PostgreSQL
		const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [parseInt(userId)]);
		if (userResult.rows.length === 0) {
			return ws.send(JSON.stringify({
				type: 'error',
				userId: userId,
				message: {
					title: 'user not found',
				}
			}));
		}
		const user = userResult.rows[0];

		// Get recipient user from PostgreSQL
		const userRecipientResult = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [message.UserRecipient]);
		if (userRecipientResult.rows.length === 0) {
			return ws.send(JSON.stringify({
				type: 'error',
				userId: userId,
				message: {
					title: 'userRecipient not found',
				}
			}));
		}
		const userRecipient = userRecipientResult.rows[0];

		// Check if either user has blocked the other
		const userBlacklist = user.blacklist || [];
		const recipientBlacklist = userRecipient.blacklist || [];

		if (userBlacklist.includes(userRecipient.id.toString()) || recipientBlacklist.includes(user.id.toString())) {
			return ws.send(JSON.stringify({
				type: 'error',
				userId: userId,
				message: {
					title: 'chat not allowed with blocked user',
				}
			}));
		}

		// Check if users are matched (fix the typo in original code: userRecpient -> userRecipient)
		const userMatcha = user.matcha || [];
		const recipientMatcha = userRecipient.matcha || [];
		
		if (!userMatcha.includes(userRecipient.id.toString()) && !recipientMatcha.includes(user.id.toString())) {
			return ws.send(JSON.stringify({
				type: 'error',
				userId: userId,
				message: {
					title: 'userRecipient is not matched with user',
				}
			}));
		}

		// Find or create conversation (ensuring consistent user ordering)
		const [smallerId, largerId] = [user.id, userRecipient.id].sort((a, b) => a - b);
		
		let conversationResult = await pool.query(`
			SELECT id FROM chat_conversations 
			WHERE user1_id = $1 AND user2_id = $2
		`, [smallerId, largerId]);
		
		let conversationId;
		if (conversationResult.rows.length === 0) {
			// Create new conversation
			const createConversationResult = await pool.query(`
				INSERT INTO chat_conversations (user1_id, user2_id)
				VALUES ($1, $2)
				RETURNING id
			`, [smallerId, largerId]);
			conversationId = createConversationResult.rows[0].id;
		} else {
			conversationId = conversationResult.rows[0].id;
		}

		// Insert the message
		const insertMessageResult = await pool.query(`
			INSERT INTO chat_messages (conversation_id, sender_id, message)
			VALUES ($1, $2, $3)
			RETURNING id, sent_at
		`, [conversationId, user.id, message.message]);

		const newMessage = insertMessageResult.rows[0];

		// Update conversation timestamp
		await pool.query(`
			UPDATE chat_conversations 
			SET updated_at = CURRENT_TIMESTAMP 
			WHERE id = $1
		`, [conversationId]);

		// Format message for WebSocket response
		const messageResponse = {
			id: newMessage.id,
			sender: user.id.toString(),
			message: message.message,
			date: newMessage.sent_at,
			sender_username: user.username
		};

		// Send message to recipient if they're connected
		const ws2 = clients.get(userRecipient.id.toString());
		if (ws2 && ws2.readyState === WebSocket.OPEN) {
			ws2.send(JSON.stringify({
				type: 'chat',
				message: messageResponse
			}));
		}

		// Send success response to sender
		ws.send(JSON.stringify({
			type: 'success',
			userId: userId,
			message: {
				title: 'chat sent',
			}
		}));

	} catch (error) {
		console.error('Error in chatUser:', error);
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'internal server error',
			}
		}));
	}
}

module.exports = chatUser;