const WebSocket = require('ws');
const pool = require('../config/connectBdd');
const { createConversation } = require('./createConversation');

async function likeUser(userId, message) {
	console.log('likeUser');
	const { clients } = require('./websockets');
	const username = message.user;
	const userLikedM = message.userLiked;
	ws = clients.get(userId);
	if (!ws) {
		return;
	}
	else if (!message.user || !message.userLiked || message.user === message.userLiked) {
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'errors in data sent',
			}
		}));
		return;
	}

	let user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
	user = user["rows"][0];

	if (!user) {
		ws.send(JSON.stringify({
					type: 'error',
					userId: userId,
					message: {
						title: 'user not found',
					}
				}));
		return;
	}

	userliked = await pool.query('SELECT * FROM users WHERE username = $1', [userLikedM]);
	userliked = userliked["rows"][0];

	if (!userliked) {
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'userliked not found',
			}
		}));
		return;
	}

	// Check if either user has blocked the other
	const userBlacklist = user.blacklist || [];
	const userlikedBlacklist = userliked.blacklist || [];

	if (userBlacklist.includes(userliked.id.toString()) || userlikedBlacklist.includes(user.id.toString())) {
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'cannot like blocked user',
			}
		}));
		return;
	}

	if (userliked.likedby && userliked.likedby.includes(user.id.toString())) {
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'already liked',
			}
		}));
		return;
	}

	await pool.query('UPDATE users SET likedby = array_append(likedby, $1) WHERE id = $2', [user.id, userliked.id]);

	userliked.famerating += 10;
    const ws2 = clients.get(userliked.id.toString());
    if (ws2 && ws2.readyState === WebSocket.OPEN) {
        ws2.send(JSON.stringify({
            type: 'notification',
            message: {
				title: 'like',
				user: user.username,
        }}));
    }

	await pool.query('UPDATE users SET notifications = array_append(notifications, $1) WHERE id = $2', [{title: 'like', body: user.username + ' liked you'}, userliked.id]);
	await pool.query('UPDATE users SET famerating = $1 WHERE id = $2', [userliked.famerating, userliked.id]);
	ws.send(JSON.stringify({
		type: 'success',
		userId: userId,
		message: {
			title: 'like',
		}
	}));

	// Check if is a match
	let userLikedby = await pool.query('SELECT likedby FROM users WHERE id = $1', [user.id]);
	userLikedby = userLikedby["rows"][0].likedby;
	if (!userLikedby) {
		return
	}
	const matcha = userLikedby.includes(userliked.id.toString());
	if (matcha) {
		await pool.query('UPDATE users SET matcha = array_append(matcha, $1) WHERE id = $2', [userliked.id, user.id]);
		await pool.query('UPDATE users SET matcha = array_append(matcha, $1) WHERE id = $2', [user.id, userliked.id]);
		await pool.query('UPDATE users SET notifications = array_append(notifications, $1) WHERE id = $2', [{title: 'match', body: userliked.username + ' matched with you'}, user.id]);
		await pool.query('UPDATE users SET notifications = array_append(notifications, $1) WHERE id = $2', [{title: 'match', body: user.username + ' matched with you'}, userliked.id]);
		user.famerating += 50;
		userliked.famerating += 50;
		await pool.query('UPDATE users SET famerating = $1 WHERE id = $2', [user.famerating, user.id]);
		await pool.query('UPDATE users SET famerating = $1 WHERE id = $2', [userliked.famerating, userliked.id]);

		// Cree la conversation si match
		try {
			const conversation = await createConversation(user.id, userliked.id);
			console.log(`Match detected! Conversation ${conversation.id} created between ${user.username} and ${userliked.username}`);
		} catch (error) {
			console.error('Failed to create conversation on match:', error);
		}

		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({
				type: 'notification',
				message: {
					title: 'matcha',
					user: userliked.username,
				}
			}));
		}
		const ws2 = clients.get(userliked.id.toString());
		if (ws2 && ws2.readyState === WebSocket.OPEN) {
			ws2.send(JSON.stringify({
				type: 'notification',
				message: {
					title: 'matcha',
					user: user.username,
				}
			}));
		}
		ws.send(JSON.stringify({
			type: 'matcha',
			userId: userId,
			message: {
				title: 'matcha',
			}
		}));
		return;
	}
}

module.exports = likeUser;