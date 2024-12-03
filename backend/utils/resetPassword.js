const User = require('../models/User');
const connectBdd = require('../config/connectBdd');
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function resetPassword(req, res){
	try {
		await connectBdd();
		const tokenEmail = req.body.token;
		const email = req.body.email;
		const password = req.body.password;
		const confirmPassword = req.body.confirmPassword;
		if (!tokenEmail || !email) {
			return res.status(400).json({ alert : { type : "warning",  message: "token and email are required" }});
		}
        const user = await User.findOne({email : email});
        if (!user) {
            return res.status(404).json({ alert : { type : "warning",  message: "email not match" }});
        }

		if (user.refreshToken !== tokenEmail) {
			return res.status(400).json({ alert : { type : "warning",  message: "token not match" }});
		}
		user.refreshToken = null;
		if (!req.body.password) {
			return res.status(400).json({ alert : { type : "warning",  message: "password is required" }});
		}
		if (password !== confirmPassword) {
			return res.status(400).json({ alert : { type : "warning",  message: "passwords do not match" }});
		}
		const hash = await bcrypt.hash(password, saltRounds);
		user.password = hash;
		await user.save();
		res.status(200).json({ alert : { type : "success",  message: "Password updated" }});
	}
	catch (error) {
		console.log("Error in forgotPassword", error);
		res.status(503).json({alert : { type : "warning",  message: error.message }});
	}
}

module.exports = resetPassword;