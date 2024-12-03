const WebSocket = require('ws');
const connectBdd = require('../config/connectBdd');

async function unlike(userId, message) {
	const { clients } = require('./websockets');
	let ws = clients.get(userId);
	if (!ws) {
		return;
	}
	else if (!message.user || !message.userUnliked || message.user === message.userUnliked) {
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'errors in data sent',
			}
		}));
		return;
	}

	const User = require('../models/User');
	connectBdd();
	user = await User.findOne({ username: message.user });
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

	userUnliked = await User.findOne({ username: message.userUnliked });
	if (!userUnliked) {
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'userUnliked not found',
			}
		}));
		return;
	}
	else if (!userUnliked.likedBy.includes(user._id)) {
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'user not liked',
			}
		}));
		return;
	}

	// let userUnlikedFilter = userUnliked.likedBy.filter((id) => id.toString() !== user._id.toString());
	let index = userUnliked.likedBy.findIndex(item => item === user.id);
	if (index > -1) {
		userUnliked.fameRating -= 10;
		userUnliked.likedBy.splice(index, 1);
		const ws2 = clients.get(userliked._id.toString());
		if (ws2 && ws2.readyState === WebSocket.OPEN) {
			ws2.send(JSON.stringify({
				type: 'notification',
				message: {
					title: 'unlike',
					user: user.username,
				}
			}));
		}
	}

	index = userUnliked.matchs.findIndex(item => item === user._id);
	if (index > -1) {
		userUnliked.fameRating -= 50;
		userUnliked.matchs.splice(index, 1);
		const ws2 = clients.get(userliked._id.toString());
		if (ws2 && ws2.readyState === WebSocket.OPEN) {
			ws2.send(JSON.stringify({
				type: 'notification',
				message: {
					title: 'unmatcha',
					user: user.username,
				}
			}));
		}
	}
	index = user.matchs.findIndex(item => item === userUnliked._id);
	if (index > -1) {
		user.fameRating -= 50;
		user.matchs.splice(index, 1);
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({
				type: 'notification',
				message: {
					title: 'unmatcha',
					user: userliked.username,
				}
			}));
		}
	}

	ws.send(JSON.stringify({
		type: 'success',
		userId: userId,
		message: {
			title: 'unlike',
		}
	}));

	userUnliked.notifications.push({
		title: 'unlike',
		body: user.username + ' unliked you',
	});

	await userUnliked.save();
	await user.save();
}

module.exports = unlike;