const WebSocket = require('ws');
const url = require('url');
const User = require('../models/User');
const likeUser = require('./like');
const chatUser = require('./chatUser');
const unlikeUser = require('./unlike');
const viewedUser = require('./viewed');
const connectBdd = require('../config/connectBdd');
const pingLocation = require('./pingLocation');
const { deleteNotification, notificationViewed } = require('./notificationHandler');

let clients = new Map();

async function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });
	// await connectBdd();
    wss.on('connection', async function connection(ws, req) {
        console.log('A new client Connected!');
		// console.log('req.url = ', req.url);
        const location = url.parse(req.url, true);
        const userId = location.query.id;
        // console.log('userId = ', userId);

        clients.set(userId, ws);
        ws.send(JSON.stringify({type: 'connected', userId: userId, message: 'You are connected'}));

		await connectBdd();
		// console.log("req.params.username = ", req.params.username);
		const user = await User.findOne({_id: userId});

		if (user && user.location.authorization) {
			setInterval(() => {
				pingClientForCurrentLocation(userId);
			  }, 100000);
		}


        ws.on('message', async function incoming(message) {
            // console.log('received: %s', message, "\n");
			const parsedMessage = JSON.parse(message);
			if (parsedMessage.type === 'like')
			{
				likeUser(parsedMessage.userId, parsedMessage.message);
			}
			else if (parsedMessage.type === 'unlike')
			{
				unlikeUser(parsedMessage.userId, parsedMessage.message);
			}
			else if (parsedMessage.type === 'viewed')
			{
				viewedUser(parsedMessage.userId, parsedMessage.message);
			}
			else if (parsedMessage.type === 'notification')
			{
				notificationViewed(parsedMessage.userId);
			}
			else if (parsedMessage.type === 'deleteNotification')
			{
				deleteNotification(parsedMessage.userId, parsedMessage.message);
			}
			else if (parsedMessage.type === 'chat')
			{
				chatUser(parsedMessage.userId, parsedMessage.message);
			}
			else if (parsedMessage.type === 'newLocation')
			{
				user.location.coordinates = [parsedMessage.location.latitude, parsedMessage.location.longitude];
				await user.save();
			}
        });

        ws.on('close', () => {
            console.log('The client has disconnected.');
            disconnectUser(userId);
            clients.delete(userId);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    async function disconnectUser(userId) {
        await connectBdd();
        let user = await User.findById(userId);
		if (!user) {
			return;
		}
        user.connected = false;
		user.lastConnection = new Date();
        await user.save();
    }

    return wss;
}

async function pingClientForCurrentLocation(clientId) {
	for (let [userId, ws] of clients) {
		if (userId === clientId) {
			ws.send(JSON.stringify({type: 'pingLocation', userId: userId}));
		}
	}
}

module.exports = { setupWebSocket, clients };