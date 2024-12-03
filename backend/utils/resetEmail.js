const User = require('../models/User');
const { sendEmail } = require('./sendEmailVerification');
const connectBdd = require('../config/connectBdd');

async function resetEmail(req, res){
	try {
		await connectBdd();
		console.log(req.body);
		const username = req.body.username;
		const email = req.body.email;
        const user = await User.findOne( {username : username} );
        if (!user) {
            return res.status(404).json({ alert : { type : "warning", message: "User not match"} });
        }

		const emailExist = await User.findOne({ email : email });
		if (emailExist) {
			return res.status(400).json({ alert : { type : "warning", message: "Email already exist" }});
		}
		user.email = email;
		user.verified = false;
		await user.save();
		await sendEmail(user.email, user.refreshToken);
		res.status(200).json({ alert : { type : "success", message: "Email sent" }});
	}
	catch (error) {
		console.log("Error in reSendEmail", error);
		res.status(503).json({ message: error.message });
	}
}

module.exports = resetEmail;