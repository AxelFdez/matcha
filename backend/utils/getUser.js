const pool = require('../config/connectBdd');
let UserProfile = require('../models/userProfile');

async function getUser(req, res) {
	try {
		const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [req.params.username]);

		if (userResult.rows.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		const user = userResult.rows[0];

		if (!user.verified) {
			return res.status(401).json({ message: "User not verified" });
		}

		const userProfile = new UserProfile(user);
		const profile = userProfile.getProfile();
		res.status(200).json({ user: profile });
	} catch (error) {
		console.error("Error in getUser:", error);
		res.status(500).json({ message: "Server error" });
	}
}

module.exports = getUser;

// const User = require('../models/User');
// const connectBdd = require('../config/connectBdd');
// let UserProfile = require('../models/userProfile');
//
// async function getUser(req, res){
// 	await connectBdd();
// 	// console.log("req.params.username = ", req.params.username);
// 	const user = await User.findOne({username: req.params.username});
// 	if (!user) {
// 		return res.status(404).json({ message: "User not found" });
// 	}
// 	else if (user.verified === false) {
// 		return res.status(401).json({ message: "User not verified" });
// 	}
// 	// console.log("user = ", user.username);
// 	userProfile = new UserProfile(user);
// 	// console.log("userProfile=", userProfile.getProfile());
// 	res.status(200).json({ user: userProfile.getProfile() });
// }
//
// module.exports = getUser;