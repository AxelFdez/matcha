const IPinfoWrapper = require('node-ipinfo');

/**
 * Get location from request body or IP address
 * @param {Object} bodyLocation - Location object from request body (optional)
 * @param {Object} req - Express request object
 * @returns {Object|null} - Location object { latitude, longitude, city, country } or null
 */
async function getLocationFromRequest(bodyLocation, req) {
    let location = null;

    // Try to use location from request body first
    if (bodyLocation && typeof bodyLocation === 'object') {
        const { latitude, longitude } = bodyLocation;
        if (typeof latitude === 'number' && typeof longitude === 'number') {
            location = { latitude, longitude };
            console.log('Location retrieved from request body:', location);
            return location;
        }
    }

    try {
        let ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

        // Clean IP address
        if (ipAddress && ipAddress.startsWith('::ffff:')) {
            ipAddress = ipAddress.substring(7);
        }

        // Skip localhost
        if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1') {
            console.log('Localhost IP detected, skipping geolocation');
            return null;
        }

        const ipinfoToken = process.env.IPINFO_TOKEN || null;
        const ipinfo = new IPinfoWrapper(ipinfoToken);

        const ipData = await ipinfo.lookupIp(ipAddress);

        if (ipData && ipData.loc) {
            const [latitude, longitude] = ipData.loc.split(',').map(parseFloat);
            if (!isNaN(latitude) && !isNaN(longitude)) {
                location = {
                    latitude,
                    longitude,
                    city: ipData.city || 'Inconnue',
                    country: ipData.country || 'Inconnu'
                };
                console.log('Location retrieved from IP:', location);
            }
        }
    } catch (ipError) {
        console.error('Error getting location from IP:', ipError);
    }

    return location;
}

module.exports = getLocationFromRequest;
