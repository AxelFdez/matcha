const WebSocket = require('ws');
const url = require('url');
const pool = require('../config/connectBdd');
const likeUser = require('./like');
const chatUser = require('./chatUser');
const unlikeUser = require('./unlike');
const viewedUser = require('./viewed');
const pingLocation = require('./pingLocation');
const ignoreUser = require('./ignore');
const reportUser = require('./report');
const blockUser = require('./block');
const { deleteNotification, notificationViewed } = require('./notificationHandler');

let clients = new Map();


async function setupWebSocket(server) {
	const wss = new WebSocket.Server({ server });

	wss.on('connection', async function connection(ws, req) {
		// console.log('A new client Connected!');
		const location = url.parse(req.url, true);
		const userId = location.query.id;

		clients.set(userId, ws);

		// Marquer l'utilisateur comme connecté dès la connexion
		await pool.query('UPDATE users SET connected = $1, lastConnection = $2 WHERE id = $3', [true, new Date(), userId]);
		// console.log(`✅ User ${userId} marked as connected`);

		ws.send(JSON.stringify({type: 'connected', userId: userId, message: 'You are connected'}));

		const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
		const user = userResult.rows[0];

		// Parser le JSON location si nécessaire
		let locationData = user.location;
		if (typeof locationData === 'string') {
			locationData = JSON.parse(locationData);
		}

		// Ne pinger que si l'utilisateur a autorisé et n'a PAS défini sa position manuellement
		const shouldPingLocation = user && locationData && locationData.authorization && !locationData.manualMode;

		if (shouldPingLocation) {
			// console.log(`📍 Starting location ping for user ${userId} (manualMode: false)`);
			setInterval(() => {
				pingClientForCurrentLocation(userId);
			}, 100000);
		}
		// else if (locationData && locationData.manualMode) {
		// 	// console.log(`🔒 Skipping location ping for user ${userId} (manualMode: true)`);
		// }

		ws.on('message', async function incoming(message) {
			const parsedMessage = JSON.parse(message);
			console.log('received: %s', message, "\n");
			ws.send(JSON.stringify({type: 'receive', userId: userId, message: 'message recieved by server'}));
			if (parsedMessage.type === 'like') {
				likeUser(parsedMessage.userId, parsedMessage.message);
			} else if (parsedMessage.type === 'unlike') {
				unlikeUser(parsedMessage.userId, parsedMessage.message);
			} else if (parsedMessage.type === 'ignore') {
				ignoreUser(parsedMessage.userId, parsedMessage.message);
			} else if (parsedMessage.type === 'viewed') {
				viewedUser(parsedMessage.userId, parsedMessage.message);
			} else if (parsedMessage.type === 'report') {
				reportUser(parsedMessage.userId, parsedMessage.message);
			} else if (parsedMessage.type === 'block') {
				blockUser(parsedMessage.userId, parsedMessage.message);
			} else if (parsedMessage.type === 'notification') {
				notificationViewed(parsedMessage.userId);
			// } else if (parsedMessage.type === 'deleteNotification') {
			// 	deleteNotification(parsedMessage.userId, parsedMessage.message);
			} else if (parsedMessage.type === 'chat') {
				chatUser(parsedMessage.userId, parsedMessage.message);
			} else if (parsedMessage.type === 'newLocation') {
				// Récupérer l'utilisateur pour vérifier manualMode
				const userResult = await pool.query('SELECT location FROM users WHERE id = $1', [userId]);
				if (userResult.rows.length > 0) {
					let locationData = userResult.rows[0].location;

					// Parser le JSON si nécessaire
					if (typeof locationData === 'string') {
						locationData = JSON.parse(locationData);
					}

					// Ne mettre à jour que si manualMode est false ou n'existe pas
					if (!locationData.manualMode) {
						// Format GeoJSON standard: [longitude, latitude]
						locationData.coordinates = [parsedMessage.location.longitude, parsedMessage.location.latitude];
						locationData.latitude = parsedMessage.location.latitude;
						locationData.longitude = parsedMessage.location.longitude;

						await pool.query('UPDATE users SET location = $1 WHERE id = $2', [JSON.stringify(locationData), userId]);
						// console.log(`📍 Location updated for user ${userId} via WebSocket (manualMode: false)`);
					} else {
						// console.log(`🔒 Location update ignored for user ${userId} (manualMode: true)`);
					}
				}
			} else if (parsedMessage.type === 'test') {
				console.log('Test received:', parsedMessage.message);
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
		await pool.query('UPDATE users SET connected = $1, lastConnection = $2 WHERE id = $3', [false, new Date(), userId]);
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

// const WebSocket = require('ws');
// const url = require('url');
// const User = require('../models/User');
// const likeUser = require('./like');
// const chatUser = require('./chatUser');
// const unlikeUser = require('./unlike');
// const viewedUser = require('./viewed');
// const connectBdd = require('../config/connectBdd');
// const pingLocation = require('./pingLocation');
// const { deleteNotification, notificationViewed } = require('./notificationHandler');
//
// let clients = new Map();
//
// async function setupWebSocket(server) {
//     const wss = new WebSocket.Server({ server });
// 	// await connectBdd();
//     wss.on('connection', async function connection(ws, req) {
//         console.log('A new client Connected!');
// 		// console.log('req.url = ', req.url);
//         const location = url.parse(req.url, true);
//         const userId = location.query.id;
//         // console.log('userId = ', userId);
//
//         clients.set(userId, ws);
//         ws.send(JSON.stringify({type: 'connected', userId: userId, message: 'You are connected'}));
//
// 		await connectBdd();
// 		// console.log("req.params.username = ", req.params.username);
// 		const user = await User.findOne({_id: userId});
//
// 		if (user && user.location.authorization) {
// 			setInterval(() => {
// 				pingClientForCurrentLocation(userId);
// 			  }, 100000);
// 		}
//
//
//         ws.on('message', async function incoming(message) {
//             // console.log('received: %s', message, "\n");
// 			const parsedMessage = JSON.parse(message);
// 			if (parsedMessage.type === 'like')
// 			{
// 				likeUser(parsedMessage.userId, parsedMessage.message);
// 			}
// 			else if (parsedMessage.type === 'unlike')
// 			{
// 				unlikeUser(parsedMessage.userId, parsedMessage.message);
// 			}
// 			else if (parsedMessage.type === 'viewed')
// 			{
// 				viewedUser(parsedMessage.userId, parsedMessage.message);
// 			}
// 			else if (parsedMessage.type === 'notification')
// 			{
// 				notificationViewed(parsedMessage.userId);
// 			}
// 			else if (parsedMessage.type === 'deleteNotification')
// 			{
// 				deleteNotification(parsedMessage.userId, parsedMessage.message);
// 			}
// 			else if (parsedMessage.type === 'chat')
// 			{
// 				chatUser(parsedMessage.userId, parsedMessage.message);
// 			}
// 			else if (parsedMessage.type === 'newLocation')
// 			{
// 				user.location.coordinates = [parsedMessage.location.latitude, parsedMessage.location.longitude];
// 				await user.save();
// 			}
//         });
//
//         ws.on('close', () => {
//             console.log('The client has disconnected.');
//             disconnectUser(userId);
//             clients.delete(userId);
//         });
//
//         ws.on('error', (error) => {
//             console.error('WebSocket error:', error);
//         });
//     });
//
//     async function disconnectUser(userId) {
//         await connectBdd();
//         let user = await User.findById(userId);
// 		if (!user) {
// 			return;
// 		}
//         user.connected = false;
// 		user.lastConnection = new Date();
//         await user.save();
//     }
//
//     return wss;
// }
//
// async function pingClientForCurrentLocation(clientId) {
// 	for (let [userId, ws] of clients) {
// 		if (userId === clientId) {
// 			ws.send(JSON.stringify({type: 'pingLocation', userId: userId}));
// 		}
// 	}
// }
//
// module.exports = { setupWebSocket, clients };
