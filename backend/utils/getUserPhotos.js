const User = require('../models/User');
const connectBdd = require('../config/connectBdd');


async function getUserPhoto(req, res){
	try {
		const index = req.query.index;
		await connectBdd();
		const user = await User.findOne({username: req.params.username});
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		const photo = user.photos[index];
		if (!photo) {
			return res.status(204).json({ message: "Photo not found" });
		}
		res.send(user.photos[index]);
	} catch (error) {
		console.log("error = ", error);
		return res.status(500).json({ message: "Internal server error" });
	}
}

module.exports = getUserPhoto;