const pool = require('../config/connectBdd');
const { renderHTML } = require('./sendEmailVerification');

async function verifyEmail(req, res) {
	console.log('verifyEmail function');

	const tokenEmail = req.query.token;
	if (!tokenEmail) {
		console.log('!tokenEmail');
		let html = await renderHTML('emailVerified.twig', { success: false });
		return res.status(400).send(html);
	}

	const userResult = await pool.query('SELECT * FROM users WHERE refreshToken = $1', [tokenEmail]);
	if (userResult.rows.length === 0) {
		return res.status(404).json({ message: "token not match or already verified" });
	}

	await pool.query('UPDATE users SET verified = $1, refreshToken = $2 WHERE refreshToken = $3', [true, null, tokenEmail]);

	let html = await renderHTML('emailVerified.twig', { success: true });
	res.status(200).send(html);
}

module.exports = verifyEmail;

// const connectBdd = require('../config/connectBdd');
// const {renderHTML} = require('./sendEmailVerification');
// async function verifyEmail(req, res){
// 	console.log('verifyEmail function')
//
// 	await connectBdd();
// 	const User = require('../models/User');
// 	const tokenEmail = req.query.token;
// 	if (!tokenEmail) {
// 		console.log('!tokenEmail')
// 		let html = await renderHTML('emailVerified.twig', { success : false });
// 		res.status(400).send(html);
// 	}
// 	const user = await User.findOne({ refreshToken: tokenEmail });
// 	if (!user) {
// 		return res.status(404).json({ message: "token not match or already verified" });
// 	}
// 	user.verified = true;
// 	user.tokenRefresh = null;
// 	await user.save();
// 	let html = await renderHTML('emailVerified.twig', { success : true });
// 	res.status(200).send(html);
// }
//
// module.exports = verifyEmail;