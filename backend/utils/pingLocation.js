const WebSocket = require('ws');
const connectBdd = require('../config/connectBdd');

async function pingLocation(userId, message){
	const { clients } = require('./websockets');
	let ws = clients.get(userId);
	if (!ws) {
		return;
	}
	if (!userId || !message.latitude || !message.longitude) {
		return ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'errors in data sent',
			}
		}));
	}

	await connectBdd();
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

	user.latitude = message.latitude;
	user.longitude = message.longitude;
	await user.save();
}

module.exports = pingLocation;
