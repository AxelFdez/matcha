const pool = require('../config/connectBdd');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const path = require('path');

let interests = [];

async function updateUser(req, res) {
	try {
		// console.log("req.user = ", req.user);
		// const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
		// if (userResult.rows.length === 0) {
		// 	return res.status(404).json({ alert: { type: "warning", message: "User not found" } });
		// }

		const user = req.user;
		const updates = {};

		if (req.body.firstName) {
			updates.firstname = req.body.firstName;
		}
		if (req.body.lastName) {
			updates.lastname = req.body.lastName;
		}
		if (req.body.email) {
			const emailExist = await pool.query('SELECT * FROM users WHERE email = $1', [req.body.email]);
			if (emailExist.rows.length > 0 && emailExist.rows[0].id !== user.id) {
				return res.status(400).json({ alert: { type: "warning", message: "Email already used" } });
			}
			updates.email = req.body.email;
			updates.verified = false;
		}
		if (req.body.password) {
			const hash = await bcrypt.hash(req.body.password, saltRounds);
			updates.password = hash;
		}
		if (req.body.biography) {
			updates.biography = req.body.biography.slice(0, 15);
		}
		if (req.body.gender) {
			updates.gender = req.body.gender.toLowerCase();
		}
		if (req.body.sexualpreferences) {
			if ((req.body.sexualpreferences[0] && req.body.sexualpreferences[1]) || (!req.body.sexualpreferences[0] && !req.body.sexualpreferences[1])) {
				req.body.sexualpreferences = "both";
			} else if (req.body.sexualpreferences[0]) {
				req.body.sexualpreferences = req.body.sexualpreferences[0].toLowerCase();
			} else {
				req.body.sexualpreferences = req.body.sexualpreferences[1].toLowerCase();
			}
			updates.sexualpreferences = req.body.sexualpreferences;
		}
		if (req.body.age) {
			if (req.body.age < 18 || req.body.age > 100) {
				return res.status(400).json({ alert: { type: "warning", message: "Invalid age" } });
			}
			updates.age = req.body.age;
		}
		if (req.body.interests) {
			// console.log(req.body.interests);
			for (let i = 0; i < req.body.interests.length; i++) {
				if (!req.body.interests[i].startsWith("#")) {
					return res.status(400).json({ alert: { type: "warning", message: "Invalid interest" } });
				}
				if (!user.interests.includes(req.body.interests[i])) {
					user.interests.push(req.body.interests[i]);
					if (!interests.includes(req.body.interests[i])) {
						interests.push(req.body.interests[i]);
					}
				}
			}
			updates.interests = user.interests;
		}
		if (req.files) {
			const fs = require('fs');
			const { resizeImage, compressImageToUnder1MB } = require('./photosHandler');

			const photoUpload = req.files[0];
			const imageIndex = req.body.imageIndex;
			const photoPath = path.join(__dirname, "../photos/tmp/" + photoUpload.originalname);
			const extension = photoUpload.originalname.split('.').pop();

			// Resize the image
			const resizedImageFilename = photoPath.slice(0, -extension.length - 1) + "_resized." + extension;
			await resizeImage(photoPath, resizedImageFilename, 500, 500);

			// Compress the resized image
			const compressImageFilename = photoPath.slice(0, -extension.length - 1) + "_compress." + extension;
			await compressImageToUnder1MB(resizedImageFilename, compressImageFilename);

			// Move the compressed file to the final path
			const newPhotoPath = path.join(__dirname, "../photos/" + user.username + "_" + imageIndex + ".png");
			fs.renameSync(compressImageFilename, newPhotoPath);

			// Store the file path in the database
			user.photos[imageIndex] = newPhotoPath;
			updates.photos = user.photos;
		}
		if (req.body.profilePicture) {
			if (req.body.profilePicture < 1 || req.body.profilePicture > user.photos.length) {
				return res.status(400).json({ alert: { type: "warning", message: "Invalid profile picture index" } });
			}
			updates.profilePicture = req.body.profilePicture;
		}
		// console.log("user.ready = ", user.ready);
		// console.log("user.age = ", user.age);
		// console.log("user.gender", user.gender);
		// console.log("user.sexualpreferences = ", user.sexualpreferences);
		// console.log("user.interests.length = ", user.interests.length);
		// console.log("user.photos[0] = ", user.photos[0]);
		if (!user.ready) {
			if (user.age && user.gender && user.sexualpreferences && user.interests.length > 0 && user.photos[0]) {
				updates.ready = true;
			}
		}

		const updateQuery = 'UPDATE users SET ' + Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ') + ' WHERE id = $' + (Object.keys(updates).length + 1);
		const updateValues = [...Object.values(updates), user.id];
		await pool.query(updateQuery, updateValues);

		res.status(200).json({ imageIndex: req.body.imageIndex, alert: { type: "success", message: "User updated" } });
	} catch (error) {
		console.log("Error in updateUser", error);
		res.status(503).json({ alert: { type: "warning", message: "Error updating user" } });
	}
}

module.exports = updateUser;

// const User = require('../models/User');
// const connectBdd = require('../config/connectBdd');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
// const path = require('path');
//
// let interests = [];
//
// async function updateUser(req, res){
// 	// console.log("req.files = ", req.files);
// 	// if (!req.body || Object.keys(req.body).length === 0)
// 	// {
// 	// 	return res.status(400).json({ message: "No data" });
// 	// }
// 	try {
// 		await connectBdd();
// 		const user = await User.findOne({_id: req.user.userId});
// 		if (!user) {
// 			return res.status(404).json({ alert: {type: "warning", message: "Utilisateur non trouvé"}});
// 		}
// 		if (req.body.firstName) {
// 			user.firstname = req.body.firstName;
// 		}
// 		if (req.body.lastName) {
// 			user.lastname = req.body.lastName;
// 		}
// 		if (req.body.email) {
// 			emailAlreadyExists = await User.findOne({ email: req.body.email });
// 			if (emailAlreadyExists && emailAlreadyExists._id != user._id) {
// 				return res.status(200).json({ alert: {type: "warning", message: "Email déjà utilisé"}});
// 			}
// 			user.email = req.body.email;
// 			user.verified = false;
// 		}
// 		if (req.body.password) {
// 			const hash = await bcrypt.hash(req.body.password, saltRounds);
// 			user.password = hash;
// 		}
// 		if (req.body.biography) {
// 			user.biography = req.body.biography;
// 		}
// 		if (req.body.gender)
// 		{
// 			user.gender = req.body.gender;
// 		}
// 		if (req.body.sexualpreferences)
// 		{
// 			// console.log("req.body.sexualpreferences = ", req.body.sexualpreferences);
// 			if ((req.body.sexualpreferences[0] && req.body.sexualpreferences[1])
// 				|| (!req.body.sexualpreferences[0] && !req.body.sexualpreferences[1]))
// 				req.body.sexualpreferences = "Both";
// 			else if (req.body.sexualpreferences[0])
// 				req.body.sexualpreferences = req.body.sexualpreferences[0]
// 			else
// 				req.body.sexualpreferences = req.body.sexualpreferences[1]
// 			user.sexualpreferences = req.body.sexualpreferences;
// 		}
// 		if (req.body.age)
// 		{
// 			if (req.body.age < 18 || req.body.age > 100)
// 			{
// 				return res.status(400).json({ alert : {type: "warning", message: "Âge invalide"}});
// 			}
// 			user.age = req.body.age;
// 		}
// 		if (req.body.interests)
// 		{
// 			for (let i = 0; i < req.body.interests.length; i++)
// 			{
// 				if (!req.body.interests[i].startsWith("#"))
// 				{
// 					return res.status(400).json({ alert : {type: "warning", message: "Intérêt invalide"}});
// 				}
// 				if (!user.interests.includes(req.body.interests[i]))
// 				{
// 					user.interests.push(req.body.interests[i]);
// 					if (!interests.includes(req.body.interests[i]))
// 					{
// 						interests.push(req.body.interests[i]);
// 					}
// 				}
// 			}
// 		}
// 		if (req.files) {
// 			const fs = require('fs');
// 			const fsPromise = require('fs').promises;
// 			const { resizeImage, compressImageToUnder1MB } = require('./photosHandler');
//
// 			const photoUpload = req.files[0];
// 			const imageIndex = req.body.imageIndex;
// 			const photoPath = path.join(__dirname, "../" + photoUpload.path);
// 			const extension = photoUpload.originalname.split('.').pop();
//
// 			// Redimensionner l'image
// 			const resizedImageFilename =  photoPath.slice(0, - extension.length - 1) + "_resized." + extension;
// 			await resizeImage(photoPath, resizedImageFilename, 500, 500);
//
// 			// Compresser l'image redimensionnée
// 			const compressImageFilename = photoPath.slice(0, - extension.length - 1) + "_compress." + extension;
// 			await compressImageToUnder1MB(resizedImageFilename, compressImageFilename);
//
// 			// Définir le nouveau chemin pour l'image finale
// 			const newPhotoPath = path.join(__dirname, "../photos/tmp/" + user.username + "_" + imageIndex + ".png");
//
// 			// Renommer/déplacer le fichier compressé vers le nouveau chemin
// 			fs.renameSync(compressImageFilename, newPhotoPath);
//
// 			// Lire le fichier compressé en tant que Buffer
// 			const imageBuffer = await fsPromise.readFile(newPhotoPath);
//
// 			// Stocker l'image dans la base de données
// 			user.photos[imageIndex] = imageBuffer;
//
// 			// Supprimer les fichiers temporaires
// 			// fs.rmSync(resizedImageFilename);
// 		}
// 		if (req.body.profilePicture)
// 		{
// 			if (req.body.profilePicture < 1 || req.body.profilePicture > user.photos.length)
// 			{
// 				return res.status(400).json({ alert: {type: "warning", message: "Index de l'image de profil invalide"}});
// 			}
// 			user.profilePicture = req.body.profilePicture;
// 		}
// 		if (!user.ready)
// 		{
// 			if (user.age && user.gender && user.sexualpreferences && user.interests.length > 0 && user.photos[0])
// 			{
// 				user.ready = true;
// 			}
// 		}
// 		await user.save();
// 		res.status(200).json({imageIndex: req.body.imageIndex, alert: {type: "success", message: "Utilisateur mis à jour avec succès"}});
// 	} catch (error) {
// 		console.log("Error in updateUser", error);
// 		res.status(503).json({ alert: {type: "warning", message: "Erreur lors de la mise à jour de l'utilisateur"}});
// 	}
// }
//
// module.exports = updateUser;