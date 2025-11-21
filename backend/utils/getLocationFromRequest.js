const { IPinfoWrapper } = require("node-ipinfo");

/**
 * Get location from request body or IP address
 * @param {Object} bodyLocation - Location object from request body (optional)
 * @param {Object} req - Express request object
 * @returns {Object|null} - Location object { latitude, longitude, city, country } or null
 */
async function getLocationFromRequest(bodyLocation, req) {
  let location = null;

  // Try to use location from request body first
  if (bodyLocation && typeof bodyLocation === "object") {
    const { latitude, longitude } = bodyLocation;
    if (typeof latitude === "number" && typeof longitude === "number") {
      // Return in GeoJSON format with coordinates array [longitude, latitude]
      location = {
        latitude,
        longitude,
        city: "Inconnue",
        country: "Inconnu",
        coordinates: [longitude, latitude], // GeoJSON format
      };

      // Reverse geocoding pour obtenir city et country à partir des coordonnées
      try {
        const axios = require('axios');
        const reverseGeoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
        const geoResponse = await axios.get(reverseGeoUrl, {
          headers: {
            'User-Agent': 'Matcha Dating App'
          }
        });
        const geoData = geoResponse.data;

        if (geoData && geoData.address) {
          location.city = geoData.address.city || geoData.address.town || geoData.address.village || "Inconnue";
          location.country = geoData.address.country || "Inconnu";
        }
      } catch (error) {
        // console.error('Reverse geocoding error:', error);
        // En cas d'erreur, garder les valeurs par défaut
      }

      // console.log('Location retrieved from request body (GeoJSON):', location);
      return location;
    }
  }

  try {
    let ipAddress = req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress;

    // Clean IP address
    if (ipAddress && ipAddress.startsWith("::ffff:")) {
      ipAddress = ipAddress.substring(7);
    }

    // Use test IP for localhost in development
    if (!ipAddress || ipAddress === "127.0.0.1" || ipAddress === "::1") {
      if (process.env.DEV_IP_FALLBACK) {
        ipAddress = process.env.DEV_IP_FALLBACK;
        // // console.log('Localhost detected, using test IP:', ipAddress);
      } else {
        // // console.log('Localhost IP detected, skipping geolocation');
        return {
          latitude: null,
          longitude: null,
          city: "Inconnue",
          country: "Inconnu",
          coordinates: [0, 0],
          authorization: false,
          manualMode: true,
        };
      }
    }

    const ipinfoToken = process.env.IPINFO_TOKEN || null;
    const ipinfo = new IPinfoWrapper(ipinfoToken);

    const ipData = await ipinfo.lookupIp(ipAddress);

    if (ipData && ipData.loc) {
      const [latitude, longitude] = ipData.loc.split(",").map(parseFloat);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        location = {
          latitude,
          longitude,
          city: ipData.city || "Inconnue",
          country: ipData.country || "Inconnu",
          coordinates: [longitude, latitude],
        };
        // console.log('Location retrieved from IP:', location);
      }
    }
  } catch (ipError) {
    // console.error('Error getting location from IP:', ipError);
  }

  return location;
}

module.exports = getLocationFromRequest;
