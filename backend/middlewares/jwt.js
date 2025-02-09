require('dotenv').config();
const pool = require('../config/connectBdd');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; // Clé secrète pour le access token
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET; // Clé secrète pour le refresh token

const verifyToken = async (req, res, next) => {
  // console.log('req.cookies= ', req.cookies);
  const authHeader = req.headers.authorization;
  const refreshToken = req.cookies.refreshToken; // Supposons que le refresh token soit envoyé via cookies
  // console.log('authHeader= ', authHeader);
  // console.log('refreshToken= ', refreshToken);
// console.log('authHeader= ', authHeader);try {
  if (authHeader) {
      const token = authHeader.split(' ')[1]; // Bearer <token>
      // console.log('token=', token);
      jwt.verify(token, JWT_SECRET, async (err, user) => {
        if (err) {
          if (!refreshToken || refreshToken === "null"){
            return res.status(401).json({ message: "No refresh token provided" });
          }
          // console.log('err= ', err);
          if (err.name === "TokenExpiredError" && refreshToken) {
            // Vérifier le refresh token
            const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            if (!decoded) {
              return res.status(401).json({ message: "Refresh token not valid" }); // Refresh token invalide
            }
            // console.log('refreshToken=', refreshToken);
            const userResult = await pool.query('SELECT * FROM users WHERE refreshtoken = $1', [refreshToken]);
            // console.log('userResult= ', userResult.rows);
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
          // console.log('user= ', user);
          req.user = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);
          req.user = req.user.rows[0];
          // console.log('req.user= ', req.user);
          next();
        }
      });
    } else {
      res.sendStatus(401); // Aucun token fourni
    }
};

module.exports = verifyToken;

// require('dotenv').config();
// const connectBdd = require('../config/connectBdd');
//
// const jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET; // Clé secrète pour le access token
// const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET; // Clé secrète pour le refresh token
//
// const verifyToken = async (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   // console.log('authHeader= ', authHeader);
//   const refreshToken = req.headers.refreshtoken; // Supposons que le refresh token soit envoyé via cookies
//   // console.log("refreshToken= ", refreshToken);
//   if (authHeader) {
//     const token = authHeader.split(' ')[1]; // Bearer <token>
//     jwt.verify(token, JWT_SECRET, async (err, user) => {
//       if (err) {
//         // console.log("err= ", err.name);
//         if (err.name === "TokenExpiredError" && refreshToken) {
//           // Vérifier le refresh token
//           const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
//           // console.log("decoded= ", decoded);
//           if (!decoded) {
//             return res.sendStatus(401); // Refresh token invalide
//           }
//           const User = require('../models/User');
//           connectBdd();
//           const storedTokenData = await User.findById(decoded.userId);  // Récupérer le token stocké
//
//           if (!storedTokenData || storedTokenData.refreshToken !== refreshToken) {
//             return res.sendStatus(403); // Refresh token non valide ou non correspondant
//           }
//           // Générer un nouvel access token
//           const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '15m' });
//           req.user = decoded;
//           return res.status(200).json({message : "newAcessTokenDelivered", accessToken : newAccessToken});
//         } else {
//           return res.status(403).json({ message: err.name }); // Autres erreurs pour l'access token
//         }
//       } else {
//         req.user = user; // Access token toujours valide
//         next();
//       }
//     });
//   } else {
//     res.sendStatus(401); // Aucun token fourni
//   }
// };
//
// module.exports = verifyToken;
