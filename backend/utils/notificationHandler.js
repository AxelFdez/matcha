const WebSocket = require('ws');
const connectBdd = require('../config/connectBdd');


async function notificationViewed(userId) {
	const { clients } = require('./websockets');
	let ws = clients.get(userId);
	if (!ws) {
		return;
	}

	const User = require('../models/User');
	connectBdd();
	user = await User.findOne({ _id: userId });
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

	for (let i = 0; i < user.notifications.length; i++) {
		user.notifications[i].viewed = true;
	}
	await user.save();
}

async function deleteNotification(userId, message) {
	const { clients } = require('./websockets');
	let ws = clients.get(userId);
	if (!ws) {
		return;
	}
	else if (!message.notification) {
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
	user = await User.findOne({ _id: userId });
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

	let index = user.notifications.findIndex(item => item === message.notification);
	if (index > -1) {
		user.notifications.splice(index, 1);
	}
	else
		console.log('notification not found');
	await user.save();
}

module.exports = { notificationViewed, deleteNotification };