const connectbdd = require('../config/connectBdd');
const User = require('../models/User');
const Chat = require('../models/Chat');
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

	await connectbdd();
	const user = await User.findOne({_id: userId});
	if (!user) {
		return ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'user not found',
			}
		}));
	}
	const userRecipient = await User.findOne({username: message.UserRecipient});
	if (!userRecipient) {
		return ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'userRecipient not found',
			}
		}));
	}

	if (!user.matcha.includes(userRecipient._id) && !userRecpient.matcha.includes(user._id)) {
		return ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'userRecipient is not matched with user',
			}
		}));
	}

	usersChat = await Chat.findOne({user1: user._id, user2 : userRecipient._id});
	if (!usersChat) {
		usersChat = await Chat.findOne({user1: userRecipient._id, user2 : user._id});
		if (!usersChat) {
			usersChat = new Chat({
				user1: user._id,
				user2: userRecipient._id,
				messages: []
			});
		}
	}
	newMessage = {
		sender: user._id,
		message: message.message,
		date: new Date()
	};
	usersChat.messages.push(newMessage);
	await usersChat.save();

	const ws2 = clients.get(userRecipient._id.toString());
	if (ws2 && ws2.readyState === WebSocket.OPEN) {
		ws2.send(JSON.stringify({
			type: 'chat',
			message: newMessage
		}));
	}
	ws.send(JSON.stringify({
		type: 'success',
		userId: userId,
		message: {
			title: 'chat sent',
		}
	}));
}

module.exports = chatUser;