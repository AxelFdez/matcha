const pool = require("../config/connectBdd");

module.exports = async function browseUsers(req, res) {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // Récupérer l'utilisateur dans la BDD
    const userResult = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [
      req.user.username,
    ]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    const userId = user.id;

    // Vérifier si l'utilisateur a une location valide
    let userLocation = null;
    if (
      user.location &&
      Array.isArray(user.location.coordinates) &&
      user.location.coordinates.length === 2
    ) {
      userLocation = user.location.coordinates; // [longitude, latitude]
    } else {
      console.warn(`⚠️ User ${user.username} has no valid location. Distance filters disabled.`);
    }

    // Préparer le filtre de genre selon les préférences sexuelles
    let genderFilterArray = [];
    switch (user.sexualpreferences) {
      case "male":
        genderFilterArray = ["male"];
        break;
      case "female":
        genderFilterArray = ["female"];
        break;
      case "both":
        genderFilterArray = ["male", "female"];
        break;
      default:
        genderFilterArray = ["male", "female"];
    }

    // Parser les paramètres query
    let { location, tags, ageGap, fameRatingGap, distanceRange, filterBy, sortBy } = req.query;

    if (typeof ageGap === "string") ageGap = JSON.parse(ageGap);
    if (typeof fameRatingGap === "string") fameRatingGap = JSON.parse(fameRatingGap);
    if (typeof tags === "string") tags = JSON.parse(tags);
    if (typeof filterBy === "string") filterBy = JSON.parse(filterBy);
    if (typeof distanceRange === "string") distanceRange = distanceRange.trim();

    // Définir orderBy avant de construire la requête
    let orderBy = "";
    switch (sortBy) {
      case "ageIncreasing":
        orderBy = "age ASC";
        break;
      case "ageDecreasing":
        orderBy = "age DESC";
        break;
      case "fameRatingIncreasing":
        orderBy = "famerating ASC";
        break;
      case "fameRatingDecreasing":
        orderBy = "famerating DESC";
        break;
      case "tagsIncreasing":
        orderBy = "shared_tags_count ASC";
        break;
      case "tagsDecreasing":
        orderBy = "shared_tags_count DESC";
        break;
      default:
        orderBy = userLocation
          ? `(COALESCE(shared_tags_count,0)*10 + COALESCE(famerating,0)*0.05 - distance/5) DESC`
          : `(COALESCE(shared_tags_count,0)*10 + COALESCE(famerating,0)*0.05) DESC`;
    }

    // Construction requête principale
    let queryBase = `
      SELECT *,
        array_length(
          array(
            SELECT unnest(interests)
            INTERSECT
            SELECT unnest($4::text[])
          ), 1
        ) AS shared_tags_count
        ${
          userLocation
            ? `,
        (6371 * acos(
          cos(radians($5::float)) *
          cos(radians((location->'coordinates'->1)::text::float)) *
          cos(radians((location->'coordinates'->0)::text::float) - radians($6::float)) +
          sin(radians($5::float)) *
          sin(radians((location->'coordinates'->1)::text::float))
        )) AS distance`
            : ""
        }
      FROM users
      WHERE ready = true
        AND id::text != $1::text
        AND NOT COALESCE($1::text = ANY(ignoredby), FALSE)
        AND NOT COALESCE($1::text = ANY(likedBy), FALSE)
        AND NOT COALESCE($1::text = ANY(matcha), FALSE)
        AND NOT COALESCE($1::text = ANY(blacklist), FALSE)
        AND gender = ANY($2)
        AND (sexualpreferences = 'both' OR sexualpreferences = $3)
    `;

    const queryParams = [userId, genderFilterArray, user.gender, user.interests];
    if (userLocation) queryParams.push(userLocation[1], userLocation[0]); // latitude, longitude

    // Filtres supplémentaires
    let paramIndex = queryParams.length + 1;

    if (ageGap?.min) {
      queryBase += ` AND age >= $${paramIndex}`;
      queryParams.push(Number(ageGap.min));
      paramIndex++;
    }
    if (ageGap?.max) {
      queryBase += ` AND age <= $${paramIndex}`;
      queryParams.push(Number(ageGap.max));
      paramIndex++;
    }

    if (fameRatingGap?.min) {
      queryBase += ` AND famerating >= $${paramIndex}`;
      queryParams.push(Number(fameRatingGap.min));
      paramIndex++;
    }
    if (fameRatingGap?.max) {
      queryBase += ` AND famerating <= $${paramIndex}`;
      queryParams.push(Number(fameRatingGap.max));
      paramIndex++;
    }

    if (tags && Array.isArray(tags)) {
      const normalizedTags = tags.map((tag) => (tag.startsWith("#") ? tag.slice(1) : tag));
      queryBase += ` AND interests && $${paramIndex}`;
      queryParams.push(normalizedTags);
      paramIndex++;
    }

    // Filtre de distance (doit être appliqué dans un subquery car distance est calculé)
    let distanceFilter = "";
    if (distanceRange && userLocation) {
      switch (distanceRange) {
        case "0-5":
          distanceFilter = " AND distance <= 5";
          break;
        case "5-50":
          distanceFilter = " AND distance > 5 AND distance <= 50";
          break;
        case "50-500":
          distanceFilter = " AND distance > 50 AND distance <= 500";
          break;
        case "500+":
          distanceFilter = " AND distance > 500";
          break;
      }
    }

    // Requête finale avec subquery si filtre de distance
    let query;
    if (distanceFilter) {
      query = `SELECT * FROM (${queryBase}) AS subquery WHERE 1=1${distanceFilter} ORDER BY ${orderBy}`;
    } else {
      query = `SELECT * FROM (${queryBase}) AS subquery ORDER BY ${orderBy}`;
    }

    // Exécution
    const usersResult = await pool.query(query, queryParams);
    const users = usersResult.rows;

    if (!users.length) return res.status(404).json({ message: "No users found" });
    return res.status(200).json({ users });
  } catch (error) {
    // console.error("🔥 BROWSE USERS ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
