require('dotenv').config();
const pool = require('../config/connectBdd');
const { IPinfoWrapper } = require("node-ipinfo");

const ipinfo = new IPinfoWrapper(process.env.IPINFO_TOKEN);

const getLocationFromIP = async (ip) => {
	try {
		const response = await ipinfo.lookupIp(ip);
		//console.log("🌍 IPinfo response:", response);
		// Extraire les coordonnées (IPinfo renvoie "lat,lon" dans response.loc)
		const [lat, lon] = response.loc.split(',').map(parseFloat);

		return {
			type: "Point",
			coordinates: [lon, lat], // Format GeoJSON: [longitude, latitude]
			city: response.city || "Unknown",
			country: response.country || "Unknown",
			manualMode: false,
			authorization: false, // Obtenu via IP, pas via navigateur
		};
	} catch (error) {
		//console.error("❌ Error getting location from IP:", error);
		// Retourner Paris par défaut en cas d'erreur
		return {
			type: "Point",
			coordinates: [2.3522, 48.8566], // Paris
			city: "Paris",
			country: "France",
			manualMode: false,
			authorization: false,
		};
	}
};

module.exports = getLocationFromIP;
