const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 10;
const { sendEmail } = require('./sendEmailVerification');
const pool = require('../config/connectBdd');

class DuplicationError extends Error {
    constructor(message) {
        super(message);
        this.name = "DuplicationError";
    }
}

async function createUser(req, res) {
    try {
        let ipAddress = req.ip;

        ipAddress = req.headers['x-forwarded-for'] || req.ip;
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
        const user = await pool.query('INSERT INTO users (username, email, password, firstname, lastname, refreshToken) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.body.userName, req.body.email, hash, req.body.firstName, req.body.lastName, crypto.randomUUID()]);
        res.status(201).json({ message: "User created" });
    } catch (error) {
        console.log("Error in createUser", error);
        if (error instanceof DuplicationError)
        {
            res.status(409).json({ message: error.message });
            return;
        }
        else
        {
            res.status(503).json({ message:  error.message });
            await pool.query('DELETE FROM users WHERE email = $1', [req.body.email]);
        }
    }
}

module.exports = createUser;