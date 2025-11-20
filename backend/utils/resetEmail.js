const { sendEmail } = require('./sendEmailVerification');
const pool = require('../config/connectBdd');

async function resetEmail(req, res) {
	try {
		const { username, email } = req.body;
		const userResult = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);

		if (userResult.rows.length === 0) {
			return res.status(404).json({ alert: { type: "warning", message: "User not match" } });
		}

		const emailExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
		if (emailExist.rows.length > 0) {
			return res.status(400).json({ alert: { type: "warning", message: "Email already exists" } });
		}

		await pool.query('UPDATE users SET email = $1, verified = $2 WHERE LOWER(username) = LOWER($3)', [email, false, username]);
		await sendEmail(email, userResult.rows[0].refreshtoken);

		res.status(200).json({ alert: { type: "success", message: "Email sent" } });
	} catch (error) {
		// console.log("Error in resetEmail", error);
		res.status(503).json({ message: error.message });
	}
}

module.exports = resetEmail;
