const pool = require('../config/connectBdd');

async function verifyEmail(req, res) {

	const tokenEmail = req.body.token;
	if (!tokenEmail) {
		console.log('!tokenEmail');
		return res.status(400).json({ message: "Token de vérification manquant." });
	}

	const userResult = await pool.query('SELECT * FROM users WHERE refreshToken = $1', [tokenEmail]);
	if (userResult.rows.length === 0) {
		return res.status(404).json({ message: "Token invalide ou email déjà vérifié." });
	}

	await pool.query('UPDATE users SET verified = $1, refreshToken = $2 WHERE refreshToken = $3', [true, null, tokenEmail]);

	res.status(200).json({ message: "Email vérifié avec succès." });
}

module.exports = verifyEmail;
