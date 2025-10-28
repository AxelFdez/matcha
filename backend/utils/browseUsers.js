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
    if (fameRatingGap?.min !== undefined)
      fameRatingGap.min = Number(fameRatingGap.min);
    if (fameRatingGap?.max !== undefined)
      fameRatingGap.max = Number(fameRatingGap.max);
  }
  if (typeof tags === "string") tags = JSON.parse(tags);
  if (typeof filterBy === "string") filterBy = JSON.parse(filterBy);

  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [req.user.username]
    );
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
        AND NOT COALESCE($1::text = ANY(viewedBy), FALSE)
        AND NOT COALESCE($1::text = ANY(blacklist), FALSE)
        AND gender = ANY($2)
        AND (sexualpreferences = 'both' OR sexualpreferences = $3)
    `;

    const queryParams = [
      userId,
      genderFilterArray,
      user.gender,
      user.interests,
    ];
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
      query += ` AND fameRating >= $${paramIndex}`;
      queryParams.push(fameRatingGap.min);
      paramIndex++;
    }
    if (fameRatingGap?.max) {
      query += ` AND fameRating <= $${paramIndex}`;
      queryParams.push(fameRatingGap.max);
      paramIndex++;
    }
    if (tags) {
      query += ` AND interests && $${paramIndex}`;
      queryParams.push(tags);
      paramIndex++;
    }

    if (location) {
      const [longitude, latitude] = location.split(",");
      query += ` AND ST_DWithin(
        ST_SetSRID(ST_MakePoint($${paramIndex}, $${
        paramIndex + 1
      }), 4326)::geography,
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
        query += ` AND fameRating BETWEEN $${paramIndex} AND $${
          paramIndex + 1
        }`;
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
        orderBy = "fameRating ASC";
        break;
      case "fameRatingDecreasing":
        orderBy = "fameRating DESC";
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

    console.log("SQL Query:", query);
    console.log("Query Params:", queryParams);

    const usersResult = await pool.query(query, queryParams);
    const users = usersResult.rows;

    if (!users.length)
      return res.status(404).json({ message: "No users found" });
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error in browseUsers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// const User = require('../models/User');
// const connectBdd = require('../config/connectBdd');
// const { ObjectId } = require('mongodb');
//
// module.exports = async function browseUsers (req, res) {
//
// 	await connectBdd();
// 	/* formatage attendus :
// 		- location=longitude,latitude ou null
// 		- tags[tag1,tag2,tag3] ou null
// 		- ageGap{min: 18, max: 30} ou null
// 		- fameRatingGap{min: 0, max: 100} ou null
// 		- filterBy{type: "age", value: 25} ou null
// 		- sortBy: "ageIncreasing" ou null
// 	*/
// 	const { location, tags, ageGap, fameRatingGap, filterBy, sortBy } = req.query;
//
// 	const user = await User.findOne({username: req.username}); // a voir pour recuperation du user
// 	if (!user) {
// 		return res.status(404).json({ message: "User not found" });
// 	}
//
// 	const userTags = user.interests;
// 	const userLocation = user.location.coordinates;
// 	const id = new ObjectId(user._id)
//
// 	const pipeline = [];
//
// 	// Filtre sur le genre souhaité
// 	if (user.sexualPreferences === 'Male' || user.sexualPreferences === 'Female'){
// 		pipeline.push(
// 		{
// 			$matcha: {
// 				gender: user.sexualPreferences
// 			}
// 		});
// 	}
//
// 	/* Filtres de base :
// 		- Utilisateur prêt (qui a renseigner son profil)
// 		- Utilisateur non blacklisté
// 		- Utilisateur non vu
// 		- Utilisateur non liké
// 		- Utilisateur non matchaé
// 		- Utilisateur différent de l'utilisateur courant
// 		Ajout de champs calculés :
// 		- distance
// 		- commonTags
// 		- fameRatingGap
// 		Tri par :
// 		- commonTags
// 		- distance
// 		- fameRatingGap
// 	*/
// 	pipeline.push(
// 	{
// 		$matcha: {
// 			$and: [
// 				{ ready : true },
// 				{ _id: { $nin: [id] } },
// 				{ likedBy: { $nin: [id] } },
// 				{ matcha: { $nin: [id] } },
// 				{ viewedBy: { $nin: [id] } },
// 				{ blacklist: { $nin: [id] } },
// 				{ username : "Axou2"}
// 			],
// 		},
// 	},
// 	{
// 		$addFields: {
// 			fameRatingGap: {
// 				$abs: { $subtract: ["$fameRating", user.fameRating] }
// 			},
// 			distance: {
// 				$sqrt: {
// 					$add: [
// 						{ $pow: [{ $subtract: [{ $arrayElemAt: ["$location.coordinates", 0] }, userLocation[0]] }, 2] },
// 						{ $pow: [{ $subtract: [{ $arrayElemAt: ["$location.coordinates", 1] }, userLocation[1]] }, 2] }
// 					]
// 				}
// 			},
// 			commonTags: {
// 				$size: {
// 					$ifNull: [
// 						{ $setIntersection: [userTags, "$interests"] },
// 						[]
// 					]
// 				}
// 			}
// 		}
// 	},
// 	{
// 		$sort: {
// 			commonTags: -1,       // Premier critère : plus de tags communs
// 			distance: 1,          // Deuxième critère : distance plus proche
// 			fameRatingGap: 1      // Troisième critère : fameRatingGap plus faible
// 		}
// 	});
//
//
// 	// Application du filtre demandé
// 	if (filterBy && filterBy.type === "age") {
// 		pipeline.push(
// 			{
// 				$matcha: {
// 					age: {
// 						$eq: parseInt(filterBy.value)
// 					}
// 				}
// 			}
// 		);
// 	} else if (filterBy && filterBy.type === "fameRating") {
// 		pipeline.push(
// 			{
// 				$matcha: {
// 					fameRating: {
// 						$gte: parseInt(filterBy.value),
// 						$lte: parseInt(filterBy.value) + 50
// 					}
// 				}
// 			}
// 		);
// 	} else if (filterBy && filterBy.type === "tags") {
// 		pipeline.push(
// 			{
// 				$matcha: {
// 					interests: {
// 						$in: filterBy.value // envoyer un tableau, attention au # (%23)
// 					}
// 				}
// 			}
// 		);
// 	} else if (filterBy && filterBy.type === "location") {
// 		pipeline.unshift({
// 			$geoNear: {
// 				near: {
// 				  type: "Point",
// 				  coordinates: userLocation,
// 				},
// 				distanceField: "distance",
// 				maxDistance: parseInt(filterBy.value), // en mètres
// 				spherical: true
// 			  }
// 		}
// 		);
// 	}
//
// 	// Application des gaps
// 	if (ageGap && ageGap.min || ageGap && ageGap.max)
// 	{
// 		const ageRange = {};
// 		if (ageGap.min) ageRange.$gte = parseInt(ageGap.min);
// 		if (ageGap.max) ageRange.$lte = parseInt(ageGap.max);
// 		pipeline.push({
// 			$matcha: {
// 				age: ageRange
// 			}
// 		});
// 	}
// 	if (fameRatingGap && fameRatingGap.min || fameRatingGap && fameRatingGap.max)
// 	{
// 		const fameRatingRange = {};
// 		if (fameRatingGap.min) fameRatingRange.$gte = parseInt(fameRatingGap.min);
// 		if (fameRatingGap.max) fameRatingRange.$lte = parseInt(fameRatingGap.max);
// 		pipeline.push({
// 			$matcha: {
// 				fameRating: fameRatingRange
// 			}
// 		});
// 	}
// 	if (tags)
// 	{
// 		// const tagsArray = tags.split(",");
// 		pipeline.push({
// 			$matcha: {
// 				interests: {
// 					$in: tags // envoyer un tableau, attention au # (%23)
// 				}
// 			}
// 		});
// 	}
// 	if (location) // format : location=longitude,latitude
// 	{
// 		const locationArray = location.split(",");
// 		pipeline.unshift({
// 			$geoNear: {
// 				near: {
// 				  type: "Point",
// 				  coordinates: [parseFloat(locationArray[0]), parseFloat(locationArray[1])],
// 				},
// 				distanceField: "distance",
// 				maxDistance: 10000, // en mètres
// 				spherical: true
// 			  }
// 		}
// 		);
// 	}
//
// 	// tri final si demandé
// 	if (sortBy === "ageIncreasing") {
// 		pipeline.push({
// 			$sort: {
// 				age: 1
// 			}
// 		});
// 	} else if (sortBy === "ageDecreasing") {
// 		pipeline.push({
// 			$sort: {
// 				age: -1
// 			}
// 		});
// 	} else if (sortBy === "fameRatingIncreasing") {
// 		pipeline.push({
// 			$sort: {
// 				fameRating: 1
// 			}
// 		});
// 	} else if (sortBy === "fameRatingDecreasing") {
// 		pipeline.push({
// 			$sort: {
// 				fameRating: -1
// 			}
// 		});
// 	} else if (sortBy === "locationIncreasing") {
// 		pipeline.push({
// 			$sort: {
// 				location: 1
// 			}
// 		});
// 	} else if (sortBy === "locationDecreasing") {
// 		pipeline.push({
// 			$sort: {
// 				location: -1
// 			}
// 		});
// 	} else if (sortBy === "tagsIncreasing") { // a voir si c'est juste
// 		pipeline.push({
// 			$sort: {
// 				commonTags: 1
// 			}
// 		});
// 	} else if (sortBy === "tagsDecreasing") { // a voir si c'est juste
// 		pipeline.push({
// 			$sort: {
// 				commonTags: -1
// 			}
// 		});
// 	}
//
// 	// limiter le nombre de résultats
// 	pipeline.push({
// 		$limit: 10
// 	});
//
// 	// projection finale
// 	pipeline.push({
// 		$project: {
// 			_id: 0,
// 			password: 0,
// 			verified: 0,
// 			refreshToken: 0,
// 			reported: 0,
// 			blackList: 0,
// 			viewedBy: 0,
// 			likedBy: 0,
// 			matchaa: 0,
// 			notifications: 0,
// 			updateAt: 0,
// 			__v: 0,
// 			fameRatingGap: 0,
// 			commonTags: 0
// 		}
// 	});
//
// 	const getUsers = await User.aggregate(pipeline);
// 	if (!getUsers) {
// 		return res.status(404).json({ message: "No users found" });
// 	}
//
// 	return res.status(200).json({ users: getUsers });
// };
