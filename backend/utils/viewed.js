const connectBdd = require('../config/connectBdd');

async function viewedUser(userId, message) {
	const { clients } = require('./websockets');
	let ws = clients.get(userId);
	if (!ws) {
		return;
	}
	else if (!message.user || !message.userviewed || message.user === message.userviewed) {
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
	userviewed = await User.findOne({ username: message.userviewed });
	if (!userviewed) {
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'userviewed not found',
			}
		}));
		return;
	}
	else if (userviewed.viewedBy.includes(user._id)) {
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'already viewed',
			}
		}));
		return;
	}
	userviewed.viewedBy.push(user);
	userviewed.fameRating += 2;

	const ws2 = clients.get(userviewed._id.toString());
    if (ws2 && ws2.readyState === WebSocket.OPEN) {
        ws2.send(JSON.stringify({
            type: 'notification',
            message: {
				title: 'viewed',
				user: user.username,
        }}));
    }

	userviewed.notifications.push({
		title: 'viewed',
		user: user.username,
	});
	await userviewed.save();
	ws.send(JSON.stringify({
		type: 'success',
		userId: userId,
		message: {
			title: 'viewed',
		}
	}));
}

module.exports = viewedUser;