const User = require('../models/User');
const { sendEmail } = require('./sendEmailVerification');
const connectBdd = require('../config/connectBdd');

async function reSendEmail(req, res){
	try {
		await connectBdd();
		const { username } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not match" });
        }

		if (user.verified) {
			return res.status(400).json({ message: "Email already verified" });
		}

		await sendEmail(user.email, user.refreshToken);
		res.status(200).json({ message: "Email sent" });
	}
	catch (error) {
		console.log("Error in reSendEmail", error);
		res.status(503).json({ message: error.message });
	}
}

module.exports = reSendEmail;