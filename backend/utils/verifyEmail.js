const connectBdd = require('../config/connectBdd');
const {renderHTML} = require('./sendEmailVerification');
async function verifyEmail(req, res){
	console.log('verifyEmail function')

	await connectBdd();
	const User = require('../models/User');
	const tokenEmail = req.query.token;
	if (!tokenEmail) {
		console.log('!tokenEmail')
		let html = await renderHTML('emailVerified.twig', { success : false });
		res.status(400).send(html);
	}
	const user = await User.findOne({ refreshToken: tokenEmail });
	if (!user) {
		return res.status(404).json({ message: "token not match or already verified" });
	}
	user.verified = true;
	user.tokenRefresh = null;
	await user.save();
	let html = await renderHTML('emailVerified.twig', { success : true });
	res.status(200).send(html);
}

module.exports = verifyEmail;