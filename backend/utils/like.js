const WebSocket = require('ws');
const connectBdd = require('../config/connectBdd');

async function likeUser(userId, message) {
	const { clients } = require('./websockets');
	let ws = clients.get(userId);
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

	userliked = await User.findOne({ username: message.userLiked });
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
	else if (userliked.likedBy.includes(user._id)) {
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'already liked',
			}
		}));
		return;
	}

	userliked.likedBy.push(user);

	// Check if is a match
	const matcha = user.likedBy.includes(userliked._id);
	if (matcha) {
		user.matcha.push(userliked);
		userliked.matcha.push(user);
		user.notifications.push({
			title: 'match',
			body: userliked.username + ' matched with you',
		});
		userliked.notifications.push({
			title: 'match',
			body: user.username + ' matched with you',
		});
		user.fameRating += 50;
		userliked.fameRating += 50;
		await user.save();
		await userliked.save();

		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({
				type: 'notification',
				message: {
					title: 'matcha',
					user: userliked.username,
				}
			}));
		}
		const ws2 = clients.get(userliked._id.toString());
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
			type: 'success',
			userId: userId,
			message: {
				title: 'matcha',
			}
		}));
		return;
	}

	userliked.fameRating += 10;
    const ws2 = clients.get(userliked._id.toString());
    if (ws2 && ws2.readyState === WebSocket.OPEN) {
        ws2.send(JSON.stringify({
            type: 'notification',
            message: {
				title: 'like',
				user: user.username,
        }}));
    }

	userliked.notifications.push({
		title: 'like',
		body: user.username + ' liked you',
	});
	await userliked.save();
	ws.send(JSON.stringify({
		type: 'success',
		userId: userId,
		message: {
			title: 'like',
		}
	}));
}

module.exports = likeUser;