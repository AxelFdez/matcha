const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 10;
const { sendEmail } = require('./sendEmailVerification');
const pool = require('../config/connectBdd');
const IPinfoWrapper = require('node-ipinfo');

class DuplicationError extends Error {
    constructor(message) {
        super(message);
        this.name = "DuplicationError";
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

const COMMON_WORDS = [
    'password', 'welcome', 'monkey', 'dragon', 'master', 'sunshine', 'princess',
    'qwerty', 'football', 'baseball', 'basketball', 'letmein', 'trustno',
    'superman', 'batman', 'michael', 'shadow', 'mustang', 'summer', 'love',
    'hello', 'admin', 'user', 'test', 'login', 'access', 'secret', 'computer',
    'internet', 'service', 'flower', 'purple', 'orange', 'starwars', 'killer',
    'freedom', 'whatever', 'cookie', 'thomas', 'pepper', 'hunter', 'ranger',
    'jordan', 'jennifer', 'london', 'matthew', 'yankees', 'thunder', 'ginger',
    'buster', 'dakota', 'cowboy', 'silver', 'viking', 'falcon', 'warrior',
    'phoenix', 'champion', 'panther', 'knight', 'diamond', 'golden', 'pepper'
];

/**
 * Validates email format
 * Requirements:
 * - Valid email format
 * - No dangerous characters
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        throw new ValidationError('Email is required');
    }

    // Standard email regex
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
    }

    if (email.length > 255) {
        throw new ValidationError('Email is too long');
    }

    return true;
}

/**
 * Validates name (firstname or lastname)
 * Requirements:
 * - Between 2 and 50 characters
 * - Only letters, spaces, hyphens, and apostrophes
 * - No numbers or special characters
 */
function validateName(name, fieldName) {
    if (!name || typeof name !== 'string') {
        throw new ValidationError(`${fieldName} is required`);
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
        throw new ValidationError(`${fieldName} must be at least 2 characters long`);
    }

    if (trimmedName.length > 50) {
        throw new ValidationError(`${fieldName} must not exceed 50 characters`);
    }

    // Allow letters (including accented), spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;

    if (!nameRegex.test(trimmedName)) {
        throw new ValidationError(
            `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
        );
    }

    return true;
}

/**
 * Validates password complexity
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character (@$!%*?&)
 * - Must not contain common English words
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        throw new ValidationError('Password is required');
    }

    const minLength = 8;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (password.length < minLength) {
        throw new ValidationError(`Password must be at least ${minLength} characters long`);
    }

    if (!passwordRegex.test(password)) {
        throw new ValidationError(
            'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)'
        );
    }

    const passwordLower = password.toLowerCase();
    for (const word of COMMON_WORDS) {
        if (passwordLower.includes(word)) {
            throw new ValidationError(
                'Password must not contain common English words'
            );
        }
    }

    return true;
}


async function getLocationFromRequest(bodyLocation, req) {
    let location = null;

    // Try to use location from request body first
    if (bodyLocation && typeof bodyLocation === 'object') {
        const { latitude, longitude } = bodyLocation;
        if (typeof latitude === 'number' && typeof longitude === 'number') {
            location = { latitude, longitude };
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
                location = { latitude, longitude };
                console.log('Location retrieved from IP:', location);
            }
        }
    } catch (ipError) {
        console.error('Error getting location from IP:', ipError);
    }

    return location;
}

async function createUser(req, res) {
    try {
        validateEmail(req.body.email);
        validateName(req.body.firstName, 'First name');
        validateName(req.body.lastName, 'Last name');
        validatePassword(req.body.password);

        const hash = await bcrypt.hash(req.body.password, saltRounds);
        if (!hash) {
            throw new Error('Password hashing failed');
        }
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [req.body.email, req.body.userName]
        );

        if (result.rows.length > 0) {
            if (result.rows.some(row => row.email === req.body.email)) {
                throw new DuplicationError('Email already exists');
            }
            if (result.rows.some(row => row.username === req.body.userName)) {
                throw new DuplicationError('Username already exists');
            }
        }

        // Get user location (from body or IP fallback)
        const location = await getLocationFromRequest(req.body.location, req);

        const verificationToken = crypto.randomUUID();

        // Convert location to JSON string for storage
        const locationJson = location ? JSON.stringify(location) : null;

        const user = await pool.query(
            'INSERT INTO users (username, email, password, firstname, lastname, refreshToken, location) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [req.body.userName, req.body.email, hash, req.body.firstName, req.body.lastName, verificationToken, locationJson]
        );
        const userId = user.rows[0].id;

        try {
            const emailSent = await sendEmail(req.body.email, verificationToken);
            if (!emailSent) {
                throw new Error('Failed to send verification email');
            }
        } catch (emailError) {
            await pool.query('DELETE FROM users WHERE id = $1', [userId]);
            throw new Error('Failed to send verification email. User creation rolled back.');
        }

        res.status(201).json({ message: "User created" });
    } catch (error) {
        console.log("Error in createUser", error);

        if (error instanceof ValidationError) {
            res.status(400).json({ message: error.message });
            return;
        }

        if (error instanceof DuplicationError) {
            res.status(409).json({ message: error.message });
            return;
        }

        res.status(503).json({ message: error.message });
    }
}

module.exports = createUser;