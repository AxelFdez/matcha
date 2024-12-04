const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const connectBdd = require('../config/connectBdd');
const pool = require('../config/connectBdd');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRES_IN = '7d';

async function loginUser(req, res) {
    try {
		// await connectBdd();
        // console.log(req.body);
        const { username, password } = req.body;
        // const user = await User.findOne({ username });
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.empty) {
            return res.status(404).json({ message: "User not found" });
        }
        // console.log(user.rows[0]);

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong Password" });
        }

        // Création du access token
        const accessToken = jwt.sign(
            { userId: user.rows[0]._id, email: user.rows[0].email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Création du refresh token
        const refreshToken = jwt.sign(
            { userId: user.rows[0]._id },
            REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
        );

        user.rows[0].refreshToken = refreshToken;

        // if (!user.verified) {

		// 	return res.status(401).json({ message: "Email not verified",
        //         accessToken : accessToken,
        //         refreshToken: refreshToken,
        //         user: {
        //         id: user._id,
        //         username: user.username,
        //         email: user.email,
        //         verified: user.verified
        //     }
        //      });
		// }

		//  Séparation de la chaîne en latitude et longitude
        if (req.body.location) {
            // console.log(req.body.location);
            const latitude = parseFloat(req.body.location.latitude);
            const longitude = parseFloat(req.body.location.longitude);
            user.rows[0].location.coordinates = [latitude, longitude];
            user.rows[0].location.authorization = true;
        }
        else {
            user.rows[0].location.authorization = false;
        }

		// user.connected = true;
        pool.query('UPDATE users SET refreshToken = $1, location = $2, connected = $3 WHERE username = $4',
            [refreshToken, JSON.stringify(user.rows[0].location), true, username]);
		// await user.save();

        // Envoyer les tokens au client
        // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8082');  // Origine spécifique
        // res.setHeader('Access-Control-Allow-Credentials', 'true');  // Permet les cookies
        // res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' }); // 7 jours en millisecondes
        res.status(201).json({
            message: "Connexion réussie",
            accessToken : accessToken,
            refreshToken: refreshToken,
            user: {
                id: user.rows[0]._id,
                username: user.rows[0].username,
                email: user.rows[0].email,
                verified: user.rows[0].verified,
            }
        });
    } catch (error) {
        console.error("Erreur de connexion:", error);
        res.status(500).json({ message: "Erreur du serveur lors de la tentative de connexion" });
    }
}

module.exports = loginUser;
