const pool = require("../config/connectBdd");

module.exports = async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur connecté depuis le token JWT

    // console.log("Fetching profile visitors for user ID:", userId);

    // Récupérer les IDs des visiteurs du profil
    const viewedByQuery = `
      SELECT viewedby
      FROM users
      WHERE id = $1
    `;

    const viewedByResult = await pool.query(viewedByQuery, [userId]);

    // console.log("ViewedBy result:", viewedByResult.rows);

    if (viewedByResult.rows.length === 0) {
      console.log("User not found with ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // viewedby est un simple tableau d'entiers (IDs des visiteurs)
    const viewedByIds = viewedByResult.rows[0].viewedby || [];
    console.log("ViewedBy IDs:", viewedByIds);

    if (viewedByIds.length === 0) {
      return res.status(200).json({ visitors: [] });
    }

    // Récupérer les informations des visiteurs
    const visitorsQuery = `
      SELECT
        id,
        username,
        firstname,
        lastname,
        age,
        gender,
        sexualpreferences,
        biography,
        interests,
        photos,
        profilepicture,
        famerating,
        location,
        lastconnection,
        connected
      FROM users
      WHERE id = ANY($1::int[])
    `;

    const visitorsResult = await pool.query(visitorsQuery, [viewedByIds]);
    console.log("Found visitors:", visitorsResult.rows.length);

    // Construire la liste des visiteurs avec leurs informations
    const visitors = visitorsResult.rows.map((visitor) => {
      // Parser le JSON de location s'il existe
      let city = "Inconnue";
      let country = "Inconnu";
      let latitude = null;
      let longitude = null;

      if (visitor.location) {
        try {
          const locationData = typeof visitor.location === 'string'
            ? JSON.parse(visitor.location)
            : visitor.location;

          // Extraire city/country/coordinates si disponibles dans l'objet location
          city = locationData.city || "Inconnue";
          country = locationData.country || "Inconnu";
          latitude = locationData.latitude || locationData.coordinates?.[0] || null;
          longitude = locationData.longitude || locationData.coordinates?.[1] || null;
        } catch (e) {
          console.error("Error parsing location for user", visitor.id, e);
        }
      }

      return {
        id: visitor.id,
        username: visitor.username,
        firstname: visitor.firstname,
        lastname: visitor.lastname,
        age: visitor.age,
        gender: visitor.gender,
        sexualpreferences: visitor.sexualpreferences || "",
        biography: visitor.biography || "",
        interests: visitor.interests || [],
        photos: visitor.photos || [],
        profilepicture: visitor.profilepicture || 0,
        fameRating: visitor.famerating || 0,
        city: city,
        country: country,
        latitude: latitude,
        longitude: longitude,
        lastconnection: visitor.lastconnection,
        connected: visitor.connected || false,
      };
    });

    // Trier par ordre inverse d'apparition dans viewedby (dernier visiteur en premier)
    visitors.reverse();

    console.log("Returning visitors:", visitors.length);
    res.status(200).json({ visitors });
  } catch (error) {
    console.error("Error in getProfileVisitors:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
