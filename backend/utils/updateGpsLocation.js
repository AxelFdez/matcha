const pool = require("../config/connectBdd");

module.exports = async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur connecté depuis le token JWT
    const { latitude, longitude, city, country } = req.body;

    // console.log("Updating GPS location for user ID:", userId);
    // console.log("New location:", { latitude, longitude, city, country });

    // Validation des données
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude et longitude requises" });
    }

    // Validation des coordonnées
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: "Coordonnées GPS invalides" });
    }

    // Construire l'objet location
    // Format GeoJSON standard: [longitude, latitude]
    const locationData = {
      coordinates: [longitude, latitude],
      city: city || "Inconnue",
      country: country || "Inconnu",
      latitude: latitude,
      longitude: longitude,
      manualMode: true, // L'utilisateur a modifié manuellement sa position
    };

    // Mettre à jour la localisation dans la base de données
    const updateQuery = `
      UPDATE users
      SET location = $1
      WHERE id = $2
      RETURNING id, location
    `;

    const result = await pool.query(updateQuery, [JSON.stringify(locationData), userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // console.log("GPS location updated successfully for user", userId);

    res.status(200).json({
      message: "Localisation GPS mise à jour avec succès",
      location: locationData,
    });
  } catch (error) {
    // console.error("Error in updateGpsLocation:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
