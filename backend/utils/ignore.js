const WebSocket = require('ws');
const pool = require('../config/connectBdd');

async function ignoreUser(userId, message) {
	const { clients } = require('./websockets');
	const username = message.user;
	const userIgnoredM = message.userIgnored;
	ws = clients.get(userId);
	if (!ws) {
		return;
	}
	else if (!message.user || !message.userIgnored || message.user === message.userIgnored) {
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

	userIgnored = await pool.query('SELECT * FROM users WHERE username = $1', [userIgnoredM]);
	userIgnored = userIgnored["rows"][0];
	if (!userIgnored){
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'userIgnored not found',
			}
		}));
		return;
	}
	else if (userIgnored.ignoreby && userIgnored.ignoreby.includes(user.id.toString())) {
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'user already ignored',
			}
		}));
		return;
	}
	else {
		await pool.query('UPDATE users SET ignoredby = array_append(ignoredby, $1) WHERE id = $2', [user.id, userIgnored.id]);
		ws.send(JSON.stringify({
			type: 'success',
			userId: userId,
			message: {
				title: 'user ignored',
			}
		}));
	}
}

module.exports = ignoreUser;