const pool = require("../config/connectBdd");

module.exports = async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur connecté depuis le token JWT

    console.log("Fetching profile likes for user ID:", userId);

    // Récupérer les IDs des personnes qui ont liké le profil
    const likedByQuery = `
      SELECT likedby
      FROM users
      WHERE id = $1
    `;

    const likedByResult = await pool.query(likedByQuery, [userId]);

    if (likedByResult.rows.length === 0) {
      console.log("User not found with ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // likedby est un simple tableau d'entiers (IDs des personnes qui ont liké)
    const likedByIds = likedByResult.rows[0].likedby || [];
    console.log("LikedBy IDs:", likedByIds);

    if (likedByIds.length === 0) {
      return res.status(200).json({ likes: [] });
    }

    // Récupérer les informations des personnes qui ont liké
    const likersQuery = `
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
        lastconnection
      FROM users
      WHERE id = ANY($1::int[])
    `;

    const likersResult = await pool.query(likersQuery, [likedByIds]);
    console.log("Found likers:", likersResult.rows.length);

    // Construire la liste des personnes qui ont liké avec leurs informations
    const likes = likersResult.rows.map((liker) => {
      // Parser le JSON de location s'il existe
      let city = "Inconnue";
      let country = "Inconnu";
      let latitude = null;
      let longitude = null;

      if (liker.location) {
        try {
          const locationData = typeof liker.location === 'string'
            ? JSON.parse(liker.location)
            : liker.location;

          // Extraire city/country/coordinates si disponibles dans l'objet location
          city = locationData.city || "Inconnue";
          country = locationData.country || "Inconnu";
          latitude = locationData.latitude || locationData.coordinates?.[0] || null;
          longitude = locationData.longitude || locationData.coordinates?.[1] || null;
        } catch (e) {
          console.error("Error parsing location for user", liker.id, e);
        }
      }

      return {
        id: liker.id,
        username: liker.username,
        firstname: liker.firstname,
        lastname: liker.lastname,
        age: liker.age,
        gender: liker.gender,
        sexualpreferences: liker.sexualpreferences || "",
        biography: liker.biography || "",
        interests: liker.interests || [],
        photos: liker.photos || [],
        profilepicture: liker.profilepicture || 0,
        fameRating: liker.famerating || 0,
        city: city,
        country: country,
        latitude: latitude,
        longitude: longitude,
        likedAt: liker.lastconnection || new Date().toISOString(), // Utiliser lastconnection comme approximation
      };
    });

    // Trier par ordre inverse d'apparition dans likedby (dernier like en premier)
    likes.reverse();

    console.log("Returning likes:", likes.length);
    res.status(200).json({ likes });
  } catch (error) {
    console.error("Error in getProfileLikes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
