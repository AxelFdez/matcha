const User = require('../models/User');
const { sendEmailResetPassword } = require('./sendEmailVerification');
const connectBdd = require('../config/connectBdd');
const { UUID } = require('mongodb');

async function resetPasswordSendEmail(req, res){
	try {
		await connectBdd();
		const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "email not match" });
        }

		newToken = new UUID().toString();
		user.refreshToken = newToken;
		await user.save();

		await sendEmailResetPassword(user.email, newToken);
		res.status(200).json({ message: "Email sent" });
	}
	catch (error) {
		console.log("Error in resetPasswordSendEmail", error);
		res.status(503).json({ message: error.message });
	}
}

module.exports = resetPasswordSendEmail;