const pool = require("../config/connectBdd");

module.exports = async function browseUsers(req, res) {
  let { location, tags, ageGap, fameRatingGap, filterBy, sortBy } = req.query;

  // console.log("BrowseUsers called with:", {
  //   location,
  //   tags,
  //   ageGap,
  //   fameRatingGap,
  //   filterBy,
  //   sortBy,
  // });

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

    const userResult = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [
      req.user.username,
    ]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    const userId = user.id;
    const userLocation = user.location.coordinates;

    // console.log('👤 Current user location:', {
    //   username: user.username,
    //   location: user.location,
    //   coordinates: userLocation
    // });

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

    // Construction requête SQL avec score intelligent
    let query = `
      SELECT *,
        array_length(
          array(
            SELECT unnest(interests)
            INTERSECT
            SELECT unnest($4::text[])
          ), 1
        ) AS shared_tags_count,
        (
          6371 * acos(
            cos(radians($5::float)) *
            cos(radians((location->'coordinates'->1)::text::float)) *
            cos(radians((location->'coordinates'->0)::text::float) - radians($6::float)) +
            sin(radians($5::float)) *
            sin(radians((location->'coordinates'->1)::text::float))
          )
        ) AS distance
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

    const queryParams = [userId, genderFilterArray, user.gender, user.interests, userLocation[1], userLocation[0]];
    let paramIndex = 7; // déjà 6 params utilisés

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

    // Sorting avec tris secondaires pour améliorer la pertinence
    let orderBy = "";
    switch (sortBy) {
      case "ageIncreasing":
        orderBy = "age ASC, distance ASC";  // Tri secondaire par proximité
        break;
      case "ageDecreasing":
        orderBy = "age DESC, distance ASC";  // Tri secondaire par proximité
        break;
      case "fameRatingIncreasing":
        orderBy = "famerating ASC, distance ASC";  // Tri secondaire par proximité
        break;
      case "fameRatingDecreasing":
        orderBy = "famerating DESC, distance ASC";  // Tri secondaire par proximité
        break;
      case "locationIncreasing":
        orderBy = "distance ASC, shared_tags_count DESC NULLS LAST, famerating DESC";  // Tris secondaires par tags puis fame
        break;
      case "locationDecreasing":
        orderBy = "distance DESC, shared_tags_count DESC NULLS LAST, famerating DESC";  // Tris secondaires par tags puis fame
        break;
      case "tagsDecreasing":
        orderBy = "shared_tags_count DESC NULLS LAST, distance ASC";  // Tri secondaire par proximité
        break;
      case "tagsIncreasing":
        orderBy = "shared_tags_count ASC NULLS FIRST, distance ASC";  // Tri secondaire par proximité
        break;
      default:
        // Score intelligent combinant les 3 critères :
        // - Proximité géographique (distance normalisée, inversée pour que proche = meilleur score)
        //   Divisé par 5 pour pondérer plus la distance proche
        //   Exemples: 10km = 0.5 pénalité, 50km = 2.5 pénalité, 100km = 5 pénalité
        // - Tags partagés (pondéré x10 pour avoir un impact significatif)
        // - Fame rating (pondéré x0.05 pour équilibrer avec les autres critères)
        // Plus le score est élevé, meilleur est le match
        orderBy = `(
          COALESCE(array_length(
            array(
              SELECT unnest(interests)
              INTERSECT
              SELECT unnest($4::text[])
            ), 1
          ), 0) * 10 +
          COALESCE(famerating, 0) * 0.05 -
          ((6371 * acos(
            cos(radians($5::float)) *
            cos(radians((location->'coordinates'->1)::text::float)) *
            cos(radians((location->'coordinates'->0)::text::float) - radians($6::float)) +
            sin(radians($5::float)) *
            sin(radians((location->'coordinates'->1)::text::float))
          )) / 5)
        ) DESC`;
    }

    query += ` ORDER BY ${orderBy}`;

    // console.log("SQL Query:", query);
    // console.log("Query Params:", queryParams);

    const usersResult = await pool.query(query, queryParams);
    const users = usersResult.rows;

    // console.log(`Found ${users.length} users matching criteria.`);

    // 🔍 Debug: Afficher les détails des 5 premiers utilisateurs pour vérifier le tri
    // if (users.length > 0) {
    //   console.log('\n📊 Top 5 users (intelligent matching):');
    //   users.slice(0, 5).forEach((user, index) => {
    //     const sharedTags = user.shared_tags_count || 0;
    //     const fameRating = user.famerating || 0;
    //     const distance = user.distance || 0;
    //     const score = (sharedTags * 10) + (fameRating * 0.1) - (distance / 20);

    //     console.log(`\n${index + 1}. ${user.username} (${user.firstname} ${user.lastname})`);
    //     console.log(`   📍 Distance: ${distance.toFixed(2)} km`);
    //     console.log(`   📌 Location data:`, user.location);
    //     console.log(`   🏷️  Shared tags: ${sharedTags}`);
    //     console.log(`   ⭐ Fame rating: ${fameRating}`);
    //     console.log(`   🎯 Total score: ${score.toFixed(2)}`);
    //   });
    //   console.log('\n');
    // }

    if (!users.length) return res.status(404).json({ message: "No users found" });
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error in browseUsers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
