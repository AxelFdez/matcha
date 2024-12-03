const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/User');
const { sendEmail } = require('./sendEmailVerification');
const twig = require('twig');
const { UUID } = require('mongodb');
const path = require('path');
const connectBdd = require('../config/connectBdd');
const pool = require('../config/connectBdd');

// COMMENTED OUT BECAUSE OF THE USE OF POSTGRESQL INSTEAD OF MONGODB

class DuplicationError extends Error {
    constructor(message) {
        super(message);
        this.name = "DuplicationError";
    }
}

async function createUser(req, res) {
    try {
        let ipAddress = req.ip;

        // Si derrière un reverse proxy comme Nginx ou un load balancer, utilise :
        ipAddress = req.headers['x-forwarded-for'] || req.ip;

        console.log('Adresse IP du client:', ipAddress);
        console.log("req.body = ", req.body);
        // await connectBdd();
        const hash = await bcrypt.hash(req.body.password, saltRounds);
        // const emailExist = await User.findOne({ email: req.body.email });
        // const usernameExist = await User.findOne({ username: req.body.userName });
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
        // const user = new User({
        //     username: req.body.userName,
        //     email: req.body.email,
        //     password: hash,
        //     firstname: req.body.firstName,
        //     lastname: req.body.lastName,
        //     refreshToken: new UUID().toString(),
        // });
        const user = await pool.query('INSERT INTO users (username, email, password, firstname, lastname, refreshToken) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.body.userName, req.body.email, hash, req.body.firstName, req.body.lastName, new UUID().toString()]);
        // await sendEmail(user.email, user.refreshToken);
        // await user.save();
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
            // await User.deleteOne({ email: req.body.email });
            await pool.query('DELETE FROM users WHERE email = $1', [req.body.email]);
        }
    }
}

module.exports = createUser;