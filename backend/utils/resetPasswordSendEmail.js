const { sendEmailResetPassword } = require('./sendEmailVerification');
const pool = require('../config/connectBdd');
const { UUID } = require('mongodb');

async function resetPasswordSendEmail(req, res) {
	try {
		const { email } = req.body;
		const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

		if (userResult.rows.length === 0) {
			return res.status(404).json({ message: "email not match" });
		}

		const newToken = new UUID().toString();
		await pool.query('UPDATE users SET refreshToken = $1 WHERE email = $2', [newToken, email]);

		await sendEmailResetPassword(email, newToken);
		res.status(200).json({ message: "Email sent" });
	} catch (error) {
		console.log("Error in resetPasswordSendEmail", error);
		res.status(503).json({ message: error.message });
	}
}

module.exports = resetPasswordSendEmail;

// const { sendEmailResetPassword } = require('./sendEmailVerification');
// const pool = require('../config/connectBdd');
// const { UUID } = require('mongodb');
//
// async function resetPasswordSendEmail(req, res) {
// 	try {
// 		const { email } = req.body;
// 		const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//
// 		if (userResult.rows.length === 0) {
// 			return res.status(404).json({ message: "email not match" });
// 		}
//
// 		const newToken = new UUID().toString();
// 		await pool.query('UPDATE users SET refreshToken = $1 WHERE email = $2', [newToken, email]);
//
// 		await sendEmailResetPassword(email, newToken);
// 		res.status(200).json({ message: "Email sent" });
// 	} catch (error) {
// 		console.log("Error in resetPasswordSendEmail", error);
// 		res.status(503).json({ message: error.message });
// 	}
// }
//
// module.exports = resetPasswordSendEmail;