const pool = require('../config/connectBdd');

module.exports = async function browseUsers(req, res) {
	const { location, tags, ageGap, fameRatingGap, filterBy, sortBy } = req.query;

	try {
		const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [req.user.username]);
		const user = userResult.rows[0];

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const userTags = user.interests;
		const userLocation = user.location.coordinates;
		const userId = user.id; // Ensure this is a UUID

		let query = `
      SELECT * FROM users
      WHERE ready = true
      AND id::text != $1::text
--       AND $1::text != ANY(likedBy::text[])
--       AND $1::text != ANY(matcha::text[])
--       AND $1::text != ANY(viewedBy::text[])
--       AND $1::text != ANY(blacklist::text[])
    `;

		const queryParams = [userId];

		if (user.sexualPreference === 'Male' || user.sexualPreference === 'Female') {
			query += ' AND gender = $2';
			queryParams.push(user.sexualPreference);
		}

		if (ageGap && (ageGap.min || ageGap.max)) {
			if (ageGap.min) {
				query += ' AND age >= $3';
				queryParams.push(ageGap.min);
			}
			if (ageGap.max) {
				query += ' AND age <= $4';
				queryParams.push(ageGap.max);
			}
		}

		if (fameRatingGap && (fameRatingGap.min || fameRatingGap.max)) {
			if (fameRatingGap.min) {
				query += ' AND fameRating >= $5';
				queryParams.push(fameRatingGap.min);
			}
			if (fameRatingGap.max) {
				query += ' AND fameRating <= $6';
				queryParams.push(fameRatingGap.max);
			}
		}

		if (tags) {
			query += ' AND interests && $7';
			queryParams.push(tags);
		}

		if (location) {
			const [longitude, latitude] = location.split(',');
			query += `
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint($8, $9), 4326)::geography,
          ST_SetSRID(ST_MakePoint(location[0], location[1]), 4326)::geography,
          10000
        )
      `;
			queryParams.push(longitude, latitude);
		}

		if (filterBy) {
			if (filterBy.type === 'age') {
				query += ' AND age = $10';
				queryParams.push(filterBy.value);
			} else if (filterBy.type === 'fameRating') {
				query += ' AND fameRating BETWEEN $11 AND $12';
				queryParams.push(filterBy.value, parseInt(filterBy.value) + 50);
			} else if (filterBy.type === 'tags') {
				query += ' AND interests && $13';
				queryParams.push(filterBy.value);
			} else if (filterBy.type === 'location') {
				query += `
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint($14, $15), 4326)::geography,
            ST_SetSRID(ST_MakePoint(location[0], location[1]), 4326)::geography,
            $16
          )
        `;
				queryParams.push(userLocation[0], userLocation[1], filterBy.value);
			}
		}

		if (sortBy) {
			if (sortBy === 'ageIncreasing') {
				query += ' ORDER BY age ASC';
			} else if (sortBy === 'ageDecreasing') {
				query += ' ORDER BY age DESC';
			} else if (sortBy === 'fameRatingIncreasing') {
				query += ' ORDER BY fameRating ASC';
			} else if (sortBy === 'fameRatingDecreasing') {
				query += ' ORDER BY fameRating DESC';
			} else if (sortBy === 'locationIncreasing') {
				query += ' ORDER BY ST_Distance(location, ST_SetSRID(ST_MakePoint($17, $18), 4326)) ASC';
				queryParams.push(userLocation[0], userLocation[1]);
			} else if (sortBy === 'locationDecreasing') {
				query += ' ORDER BY ST_Distance(location, ST_SetSRID(ST_MakePoint($19, $20), 4326)) DESC';
				queryParams.push(userLocation[0], userLocation[1]);
			} else if (sortBy === 'tagsIncreasing') {
				query += ' ORDER BY array_length(interests, 1) ASC';
			} else if (sortBy === 'tagsDecreasing') {
				query += ' ORDER BY array_length(interests, 1) DESC';
			}
		}

		query += ' LIMIT 10';

		const usersResult = await pool.query(query, queryParams);
		// console.log(usersResult.rows);
		const users = usersResult.rows;

		if (!users.length) {
			return res.status(404).json({ message: "No users found" });
		}

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