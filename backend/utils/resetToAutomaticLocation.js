const pool = require("../config/connectBdd");
const getLocationFromRequest = require("./getLocationFromRequest");

module.exports = async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur connecté depuis le token JWT

    console.log("Resetting to automatic location for user ID:", userId);

    // Récupérer la localisation automatiquement (depuis le body ou l'IP)
    const location = await getLocationFromRequest(req.body.location, req);

    if (!location) {
      return res.status(400).json({
        message: "Impossible de récupérer votre localisation automatiquement. Veuillez vérifier vos paramètres de géolocalisation."
      });
    }

    // Construire l'objet location avec manualMode: false
    const locationData = {
      coordinates: [location.latitude, location.longitude],
      city: location.city || "Inconnue",
      country: location.country || "Inconnu",
      latitude: location.latitude,
      longitude: location.longitude,
      manualMode: false, // Repasser en mode automatique
      authorization: true
    };

    // Mettre à jour la localisation dans la base de données
    const updateQuery = `
      UPDATE users
      SET location = $1
      WHERE id = $2
      RETURNING id, location
    `;

    const result = await pool.query(updateQuery, [
      JSON.stringify(locationData),
      userId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log("✅ Location reset to automatic mode for user", userId);
    console.log("📍 New location:", locationData);

    res.status(200).json({
      message: "Localisation réinitialisée en mode automatique",
      location: locationData
    });
  } catch (error) {
    console.error("Error in resetToAutomaticLocation:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
