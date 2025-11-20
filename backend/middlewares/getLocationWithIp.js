require('dotenv').config();
const connectBdd = require('../config/connectBdd');
const { IPinfoWrapper } = require("node-ipinfo");
const User = require('../models/User');

const ipinfo = new IPinfoWrapper(process.env.IPINFO_TOKEN);

const getLocationWithIp = async (req, res, next) => {
	if (!user.location.authorization){
		await connectBdd();
		const user = User.findOne({ username: req.username });
		ipinfo.lookupIp(req.ip).then((response) => {
			user.location.coordinates = [response.latitude, response.longitude];
			user.save();
		}).catch((error) => {
			// console.log("Error in getLocationWithIp", error);
		});
	}
	next();
}

module.exports = getLocationWithIp;
