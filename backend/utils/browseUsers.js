const pool = require("../config/connectBdd");

module.exports = async function browseUsers(req, res) {
  let { location, tags, ageGap, fameRatingGap, filterBy, sortBy } = req.query;

  console.log("BrowseUsers called with:", {
    location,
    tags,
    ageGap,
    fameRatingGap,
    filterBy,
    sortBy,
  });

  // Parse les paramètres si nécessaire
  if (typeof ageGap === "string") {
    ageGap = JSON.parse(ageGap);
    if (ageGap?.min !== undefined) ageGap.min = Number(ageGap.min);
    if (ageGap?.max !== undefined) ageGap.max = Number(ageGap.max);
  }
  if (typeof fameRatingGap === "string") {
    fameRatingGap = JSON.parse(fameRatingGap);
    if (fameRatingGap?.min !== undefined) fameRatingGap.min = Number(fameRatingGap.min);
    if (fameRatingGap?.max !== undefined) fameRatingGap.max = Number(fameRatingGap.max);
  }
  if (typeof tags === "string") tags = JSON.parse(tags);
  if (typeof filterBy === "string") filterBy = JSON.parse(filterBy);

  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userResult = await pool.query("SELECT * FROM users WHERE username = $1", [
      req.user.username,
    ]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    const userId = user.id;
    const userLocation = user.location.coordinates;

    // Genres à filtrer selon la préférence de l’utilisateur
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

    // Construction requête SQL
    let query = `
      SELECT *, array_length(
          array(
            SELECT unnest(interests)
            INTERSECT
            SELECT unnest($${4}::text[])
          ), 1
        ) AS shared_tags_count
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
    let paramIndex = 5; // déjà 4 params utilisés

    // Filtres supplémentaires
    if (ageGap?.min) {
      query += ` AND age >= $${paramIndex}`;
      queryParams.push(ageGap.min);
      paramIndex++;
    }
    if (ageGap?.max) {
      query += ` AND age <= $${paramIndex}`;
      queryParams.push(ageGap.max);
      paramIndex++;
    }
    if (fameRatingGap?.min) {
      query += ` AND famerating >= $${paramIndex}`;
      queryParams.push(fameRatingGap.min);
      paramIndex++;
    }
    if (fameRatingGap?.max) {
      query += ` AND famerating <= $${paramIndex}`;
      queryParams.push(fameRatingGap.max);
      paramIndex++;
    }
    if (tags) {
      // Retire le # des tags pour correspondre au format en base de données
      const normalizedTags = tags.map((tag) => (tag.startsWith("#") ? tag.substring(1) : tag));
      query += ` AND interests && $${paramIndex}`;
      queryParams.push(normalizedTags);
      paramIndex++;
    }

    if (location) {
      const [longitude, latitude] = location.split(",");
      query += ` AND ST_DWithin(
        ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(location[0], location[1]), 4326)::geography,
        10000
      )`;
      queryParams.push(longitude, latitude);
      paramIndex += 2;
    }

    if (filterBy) {
      if (filterBy.type === "age") {
        query += ` AND age = $${paramIndex}`;
        queryParams.push(filterBy.value);
        paramIndex++;
      } else if (filterBy.type === "fameRating") {
        query += ` AND famerating BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        queryParams.push(filterBy.value, parseInt(filterBy.value) + 50);
        paramIndex += 2;
      } else if (filterBy.type === "tags") {
        query += ` AND interests && $${paramIndex}`;
        queryParams.push(filterBy.value);
        paramIndex++;
      } else if (filterBy.type === "location") {
        query += ` AND ST_DWithin(ST_SetSRID(ST_MakePoint($${paramIndex}, $${
          paramIndex + 1
        }),4326)::geography, ST_SetSRID(ST_MakePoint(location[0], location[1]),4326)::geography, $${
          paramIndex + 2
        })`;
        queryParams.push(userLocation[0], userLocation[1], filterBy.value);
        paramIndex += 3;
      }
    }

    // Sorting
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
      case "locationIncreasing":
        orderBy = `ST_Distance(location, ST_SetSRID(ST_MakePoint($${paramIndex}, $${
          paramIndex + 1
        }),4326)) ASC`;
        queryParams.push(userLocation[0], userLocation[1]);
        paramIndex += 2;
        break;
      case "locationDecreasing":
        orderBy = `ST_Distance(location, ST_SetSRID(ST_MakePoint($${paramIndex}, $${
          paramIndex + 1
        }),4326)) DESC`;
        queryParams.push(userLocation[0], userLocation[1]);
        paramIndex += 2;
        break;
      case "tagsSharedDecreasing":
        orderBy = "shared_tags_count DESC";
        break;
      case "tagsSharedIncreasing":
        orderBy = "shared_tags_count ASC";
        break;
      default:
        orderBy = "shared_tags_count DESC";
    }

    query += ` ORDER BY ${orderBy}`;

    // console.log("SQL Query:", query);
    console.log("Query Params:", queryParams);

    const usersResult = await pool.query(query, queryParams);
    const users = usersResult.rows;

    console.log(`Found ${users.length} users matching criteria.`);

    if (!users.length) return res.status(404).json({ message: "No users found" });
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error in browseUsers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
