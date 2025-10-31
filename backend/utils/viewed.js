const pool = require('../config/connectBdd');
const WebSocket = require('ws');

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

	try {
		// Récupérer l'utilisateur qui regarde
		const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [message.user]);
		if (userResult.rows.length === 0) {
			ws.send(JSON.stringify({
				type: 'error',
				userId: userId,
				message: {
					title: 'user not found',
				}
			}));
			return;
		}
		const user = userResult.rows[0];

		// Récupérer l'utilisateur regardé
		const userViewedResult = await pool.query('SELECT * FROM users WHERE username = $1', [message.userviewed]);
		if (userViewedResult.rows.length === 0) {
			ws.send(JSON.stringify({
				type: 'error',
				userId: userId,
				message: {
					title: 'userviewed not found',
				}
			}));
			return;
		}
		const userViewed = userViewedResult.rows[0];

		// Vérifier si l'utilisateur a déjà regardé ce profil
		const viewedBy = userViewed.viewedby || [];
		if (viewedBy.includes(user.id.toString())) {
			ws.send(JSON.stringify({
				type: 'error',
				userId: userId,
				message: {
					title: 'already viewed',
				}
			}));
			return;
		}

		// Ajouter l'utilisateur à la liste viewedBy
		const updatedViewedBy = [...viewedBy, user.id.toString()];
		const newFameRating = (userViewed.famerating || 0) + 2;

		// Mettre à jour l'utilisateur regardé avec viewedBy et fameRating
		await pool.query(
			'UPDATE users SET viewedby = $1, famerating = $2 WHERE id = $3',
			[updatedViewedBy, newFameRating, userViewed.id]
		);

		// Ajouter la notification avec array_append (méthode PostgreSQL pour JSONB[])
		await pool.query(
			'UPDATE users SET notifications = array_append(notifications, $1) WHERE id = $2',
			[{title: 'viewed', user: user.username}, userViewed.id]
		);

		// Envoyer une notification en temps réel à l'utilisateur regardé
		const ws2 = clients.get(userViewed.id.toString());
		if (ws2 && ws2.readyState === WebSocket.OPEN) {
			ws2.send(JSON.stringify({
				type: 'notification',
				message: {
					title: 'viewed',
					user: user.username,
				}
			}));
		}

		// Confirmer le succès
		ws.send(JSON.stringify({
			type: 'success',
			userId: userId,
			message: {
				title: 'viewed',
			}
		}));
	} catch (error) {
		console.error('Error in viewedUser:', error);
		ws.send(JSON.stringify({
			type: 'error',
			userId: userId,
			message: {
				title: 'server error',
				error: error.message
			}
		}));
	}
}

module.exports = viewedUser;