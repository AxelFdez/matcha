const pool = require('../config/connectBdd');
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function resetPassword(req, res) {
	try {
		const tokenEmail = req.body.token;
		const email = req.body.email;
		const password = req.body.password;
		const confirmPassword = req.body.confirmPassword;

		if (!tokenEmail || !email) {
			console.log("Missing token or email");
			return res.status(400).json({ alert: { type: "warning", message: "token and email are required" } });
		}

		const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

		if (userResult.rows.length === 0) {
			console.log("Email not found");
			return res.status(404).json({ alert: { type: "warning", message: "email not match" } });
		}

		const user = userResult.rows[0];

		if (user.refreshtoken !== tokenEmail) {
			console.log("Token does not match");
			return res.status(400).json({ alert: { type: "warning", message: "token not match" } });
		}

		if (!password) {
			console.log("Missing password");
			return res.status(400).json({ alert: { type: "warning", message: "password is required" } });
		}

		if (password !== confirmPassword) {
			console.log("Passwords do not match");
			return res.status(400).json({ alert: { type: "warning", message: "passwords do not match" } });
		}

		const hash = await bcrypt.hash(password, saltRounds);

		await pool.query('UPDATE users SET password = $1, refreshToken = NULL WHERE email = $2', [hash, email]);

		res.status(200).json({ alert: { type: "success", message: "Password updated" } });
	} catch (error) {
		console.log("Error in resetPassword", error);
		res.status(503).json({ alert: { type: "warning", message: error.message } });
	}
}

module.exports = resetPassword;

// const pool = require('../config/connectBdd');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
//
// async function resetPassword(req, res) {
// 	try {
// 		const tokenEmail = req.body.token;
// 		const email = req.body.email;
// 		const password = req.body.password;
// 		const confirmPassword = req.body.confirmPassword;
//
// 		if (!tokenEmail || !email) {
// 			return res.status(400).json({ alert: { type: "warning", message: "token and email are required" } });
// 		}
//
// 		const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//
// 		if (userResult.rows.length === 0) {
// 			return res.status(404).json({ alert: { type: "warning", message: "email not match" } });
// 		}
//
// 		const user = userResult.rows[0];
//
// 		if (user.refreshtoken !== tokenEmail) {
// 			return res.status(400).json({ alert: { type: "warning", message: "token not match" } });
// 		}
//
// 		if (!password) {
// 			return res.status(400).json({ alert: { type: "warning", message: "password is required" } });
// 		}
//
// 		if (password !== confirmPassword) {
// 			return res.status(400).json({ alert: { type: "warning", message: "passwords do not match" } });
// 		}
//
// 		const hash = await bcrypt.hash(password, saltRounds);
//
// 		await pool.query('UPDATE users SET password = $1, refreshToken = NULL WHERE email = $2', [hash, email]);
//
// 		res.status(200).json({ alert: { type: "success", message: "Password updated" } });
// 	} catch (error) {
// 		console.log("Error in resetPassword", error);
// 		res.status(503).json({ alert: { type: "warning", message: error.message } });
// 	}
// }
//
// module.exports = resetPassword;