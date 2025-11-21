const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const connectBdd = require("../config/connectBdd");
const pool = require("../config/connectBdd");
const getLocationFromIP = require("../middlewares/getLocationWithIp");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "15m";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRES_IN = "7d";

async function loginUser(req, res) {
  try {
    // // console.log(req.body);
    const { username, password } = req.body;
    // const user = await User.findOne({ username });
    const user = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [
      username,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong Password" });
    }

    const accessToken = jwt.sign(
      { userId: user.rows[0]._id, email: user.rows[0].email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign({ userId: user.rows[0]._id }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    user.rows[0].refreshToken = refreshToken;

    if (!user.rows[0].verified) {
      return res.status(401).json({
        message: "Email not verified",
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          verified: user.verified,
        },
      });
    }

    // Gérer la localisation en fonction de manualMode
    let locationData = user.rows[0].location || {};

    // Parser le JSON si c'est une string
    if (typeof locationData === "string") {
      locationData = JSON.parse(locationData);
    }

    // Vérifier si l'utilisateur a défini sa position manuellement ET a des coordonnées valides
    const hasValidCoordinates = locationData.coordinates &&
                                 Array.isArray(locationData.coordinates) &&
                                 locationData.coordinates.length === 2;
    const isManualMode = locationData && locationData.manualMode === true && hasValidCoordinates;

    // Ne mettre à jour la location que si manualMode est false ou n'existe pas, OU si pas de coordonnées valides
    if (!isManualMode && req.body.location) {
      // Priorité 1: Localisation navigateur
      const latitude = parseFloat(req.body.location.latitude);
      const longitude = parseFloat(req.body.location.longitude);
      locationData.coordinates = [longitude, latitude]; // GeoJSON format: [longitude, latitude]
      locationData.latitude = latitude;
      locationData.longitude = longitude;
      locationData.type = "Point";
      locationData.authorization = true;
      locationData.manualMode = false;

      //console.log(`📍 Updating location for user ${username} from browser`);
    } else if (!isManualMode) {
      // Priorité 2: Localisation via IP si pas de localisation navigateur ou pas de coordonnées valides
      //console.log(`📍 No browser location for user ${username}, fetching from IP...`);
      const ipLocation = await getLocationFromIP(req.ip);
      locationData = ipLocation;
      //console.log(`📍 Location retrieved from IP for user ${username}:`, ipLocation.city, ipLocation.country);
    } else {
      //console.log(`🔒 Skipping location update for user ${username} (manualMode: true with valid coordinates)`);
    }

    pool.query(
      "UPDATE users SET refreshToken = $1, location = $2, connected = $3 WHERE LOWER(username) = LOWER($4)",
      [refreshToken, JSON.stringify(locationData), true, username]
    );

    // Envoyer les tokens au client
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8082');  // Origine spécifique
    res.setHeader("Access-Control-Allow-Credentials", "true"); // Permet les cookies
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }); // 7 jours en millisecondes
    res.status(201).json({
      message: "Connexion réussie",
      accessToken: accessToken,
      // refreshToken: refreshToken,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email,
        verified: user.rows[0].verified,
        ready: user.rows[0].ready,
      },
    });
  } catch (error) {
    // console.error("Erreur de connexion:", error);
    res.status(500).json({ message: "Erreur du serveur lors de la tentative de connexion" });
  }
}

module.exports = loginUser;
