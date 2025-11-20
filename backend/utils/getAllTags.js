const pool = require("../config/connectBdd");

module.exports = async function getAllTags(req, res) {
  try {
    // Récupérer tous les tags (interests) de tous les utilisateurs
    const result = await pool.query(
      "SELECT DISTINCT unnest(interests) as tag FROM users WHERE interests IS NOT NULL ORDER BY tag"
    );

    // Extraire les tags du résultat
    const tags = result.rows.map((row) => "#" + row.tag);

    res.status(200).json({ tags });
  } catch (error) {
    // console.error("Error in getAllTags:", error);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
};
