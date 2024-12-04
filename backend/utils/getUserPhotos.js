const pool = require('../config/connectBdd');
const path = require('path');
const fs = require('fs');

async function getUserPhoto(req, res) {
	try {
		const index = req.query.index;
		const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [req.params.username]);

		if (userResult.rows.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		const user = userResult.rows[0];
		const photoPath = user.photos[index];

		if (!photoPath) {
			return res.status(204).json({ message: "Photo not found" });
		}

		// const fullPath = path.join(__dirname, '..', photoPath);
		if (!fs.existsSync(photoPath)) {
			return res.status(404).json({ message: "Photo file not found on server" });
		}

		res.sendFile(photoPath);
	} catch (error) {
		console.log("Error in getUserPhoto:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
}

module.exports = getUserPhoto;

// const User = require('../models/User');
// const connectBdd = require('../config/connectBdd');
//
//
// async function getUserPhoto(req, res){
// 	try {
// 		const index = req.query.index;
// 		await connectBdd();
// 		const user = await User.findOne({username: req.params.username});
// 		if (!user) {
// 			return res.status(404).json({ message: "User not found" });
// 		}
// 		const photo = user.photos[index];
// 		if (!photo) {
// 			return res.status(204).json({ message: "Photo not found" });
// 		}
// 		res.send(user.photos[index]);
// 	} catch (error) {
// 		console.log("error = ", error);
// 		return res.status(500).json({ message: "Internal server error" });
// 	}
// }
//
// module.exports = getUserPhoto;