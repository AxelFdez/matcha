const { sendEmail } = require('./sendEmailVerification');
const pool = require('../config/connectBdd');

async function reSendEmail(req, res) {
	try {
		const { username } = req.body;
		const userResult = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);

		if (userResult.rows.length === 0) {
			return res.status(404).json({ message: "User not match" });
		}

		const user = userResult.rows[0];

		if (user.verified) {
			return res.status(400).json({ message: "Email already verified" });
		}

		await sendEmail(user.email, user.refreshtoken);
		res.status(200).json({ message: "Email sent" });
	} catch (error) {
		// console.log("Error in reSendEmail", error);
		res.status(503).json({ message: error.message });
	}
}

module.exports = reSendEmail;

// const { sendEmail } = require('./sendEmailVerification');
// const pool = require('../config/connectBdd');
//
// async function reSendEmail(req, res) {
// 	try {
// 		const { username } = req.body;
// 		const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
//
// 		if (userResult.rows.length === 0) {
// 			return res.status(404).json({ message: "User not match" });
// 		}
//
// 		const user = userResult.rows[0];
//
// 		if (user.verified) {
// 			return res.status(400).json({ message: "Email already verified" });
// 		}
//
// 		await sendEmail(user.email, user.refreshtoken);
// 		res.status(200).json({ message: "Email sent" });
// 	} catch (error) {
// 		// console.log("Error in reSendEmail", error);
// 		res.status(503).json({ message: error.message });
// 	}
// }
//
// module.exports = reSendEmail;
