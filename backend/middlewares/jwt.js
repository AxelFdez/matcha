require('dotenv').config();
const pool = require('../config/connectBdd');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; // Clé secrète pour le access token
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET; // Clé secrète pour le refresh token

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const refreshToken = req.cookies.refreshToken; // Supposons que le refresh token soit envoyé via cookies
  if (authHeader) {
      const token = authHeader.split(' ')[1]; // Bearer <token>
      jwt.verify(token, JWT_SECRET, async (err, user) => {
        if (err) {
          if (!refreshToken || refreshToken === "null"){
            return res.status(401).json({ message: "No refresh token provided" });
          }
          if (err.name === "TokenExpiredError" && refreshToken) {
            // Vérifier le refresh token
            const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            if (!decoded) {
              return res.status(401).json({ message: "Refresh token not valid" }); // Refresh token invalide
            }
            const userResult = await pool.query('SELECT * FROM users WHERE refreshtoken = $1', [refreshToken]);
            if (userResult.rows.length === 0) {
              return res.status(401).json({ message: "Refresh token not valid" }); // Refresh token non valide ou non correspondant
            }
            // Générer un nouvel access token
            const newAccessToken = jwt.sign({ userId: decoded.userId, email: userResult.rows[0].email }, JWT_SECRET, { expiresIn: '15m' });
            req.user = decoded;
            return res.status(401).json({ message: "newAccessTokenDelivered", accessToken: newAccessToken });
          } else {
            return res.status(401).json({ message: err.name }); // Autres erreurs pour l'access token
          }
        } else {
          req.user = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);
          req.user = req.user.rows[0];
          next();
        }
      });
    } else {
      res.sendStatus(401); // Aucun token fourni
    }
};

module.exports = verifyToken;
