const pool = require("../config/connectBdd");

module.exports = async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur connecté

    console.log("Fetching profile unlikes for user ID:", userId);

    // Récupérer les IDs des personnes qui ont unliked le profil
    const unlikedByQuery = `
      SELECT ignoredby
      FROM users
      WHERE id = $1
    `;
    const result = await pool.query(unlikedByQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const unlikedByIds = result.rows[0].ignoredby || [];
    console.log("UnlikedBy IDs:", unlikedByIds);

    if (unlikedByIds.length === 0) {
      return res.status(200).json({ unlikes: [] });
    }

    // Récupérer les infos des personnes qui ont unliked
    const usersQuery = `
      SELECT id, username, firstname, lastname, age, gender, sexualpreferences,
             biography, interests, photos, profilepicture, famerating, location, lastconnection
      FROM users
      WHERE id = ANY($1::int[])
    `;
    const usersResult = await pool.query(usersQuery, [unlikedByIds]);

    const unlikes = usersResult.rows.map((user) => {
      let city = "Inconnue";
      let country = "Inconnu";
      let latitude = null;
      let longitude = null;

      if (user.location) {
        try {
          const loc = typeof user.location === "string" ? JSON.parse(user.location) : user.location;
          city = loc.city || "Inconnue";
          country = loc.country || "Inconnu";
          latitude = loc.latitude || loc.coordinates?.[0] || null;
          longitude = loc.longitude || loc.coordinates?.[1] || null;
        } catch (e) {
          console.error("Error parsing location for user", user.id, e);
        }
      }

      return {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        age: user.age,
        gender: user.gender,
        sexualpreferences: user.sexualpreferences || "",
        biography: user.biography || "",
        interests: user.interests || [],
        photos: user.photos || [],
        profilepicture: user.profilepicture || 0,
        fameRating: user.famerating || 0,
        city,
        country,
        latitude,
        longitude,
        unlikedAt: user.lastconnection || new Date().toISOString(),
      };
    });

    // Trier par date décroissante si nécessaire
    unlikes.reverse();

    res.status(200).json({ unlikes });
  } catch (error) {
    console.error("Error in getProfileUnlikes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
