const User = require('../models/User');
const connectBdd = require('../config/connectBdd');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const path = require('path');

let interests = [];

async function updateUser(req, res){
	// console.log("req.files = ", req.files);
	// if (!req.body || Object.keys(req.body).length === 0)
	// {
	// 	return res.status(400).json({ message: "No data" });
	// }
	try {
		await connectBdd();
		const user = await User.findOne({_id: req.user.userId});
		if (!user) {
			return res.status(404).json({ alert: {type: "warning", message: "Utilisateur non trouvé"}});
		}
		if (req.body.firstName) {
			user.firstname = req.body.firstName;
		}
		if (req.body.lastName) {
			user.lastname = req.body.lastName;
		}
		if (req.body.email) {
			emailAlreadyExists = await User.findOne({ email: req.body.email });
			if (emailAlreadyExists && emailAlreadyExists._id != user._id) {
				return res.status(200).json({ alert: {type: "warning", message: "Email déjà utilisé"}});
			}
			user.email = req.body.email;
			user.verified = false;
		}
		if (req.body.password) {
			const hash = await bcrypt.hash(req.body.password, saltRounds);
			user.password = hash;
		}
		if (req.body.biography) {
			user.biography = req.body.biography;
		}
		if (req.body.gender)
		{
			user.gender = req.body.gender;
		}
		if (req.body.sexualPreferences)
		{
			// console.log("req.body.sexualPreferences = ", req.body.sexualPreferences);
			if ((req.body.sexualPreferences[0] && req.body.sexualPreferences[1])
				|| (!req.body.sexualPreferences[0] && !req.body.sexualPreferences[1]))
				req.body.sexualPreferences = "Both";
			else if (req.body.sexualPreferences[0])
				req.body.sexualPreferences = req.body.sexualPreferences[0]
			else
				req.body.sexualPreferences = req.body.sexualPreferences[1]
			user.sexualPreferences = req.body.sexualPreferences;
		}
		if (req.body.age)
		{
			if (req.body.age < 18 || req.body.age > 100)
			{
				return res.status(400).json({ alert : {type: "warning", message: "Âge invalide"}});
			}
			user.age = req.body.age;
		}
		if (req.body.interests)
		{
			for (let i = 0; i < req.body.interests.length; i++)
			{
				if (!req.body.interests[i].startsWith("#"))
				{
					return res.status(400).json({ alert : {type: "warning", message: "Intérêt invalide"}});
				}
				if (!user.interests.includes(req.body.interests[i]))
				{
					user.interests.push(req.body.interests[i]);
					if (!interests.includes(req.body.interests[i]))
					{
						interests.push(req.body.interests[i]);
					}
				}
			}
		}
		if (req.files) {
			const fs = require('fs');
			const fsPromise = require('fs').promises;
			const { resizeImage, compressImageToUnder1MB } = require('./photosHandler');

			const photoUpload = req.files[0];
			const imageIndex = req.body.imageIndex;
			const photoPath = path.join(__dirname, "../" + photoUpload.path);
			const extension = photoUpload.originalname.split('.').pop();

			// Redimensionner l'image
			const resizedImageFilename =  photoPath.slice(0, - extension.length - 1) + "_resized." + extension;
			await resizeImage(photoPath, resizedImageFilename, 500, 500);

			// Compresser l'image redimensionnée
			const compressImageFilename = photoPath.slice(0, - extension.length - 1) + "_compress." + extension;
			await compressImageToUnder1MB(resizedImageFilename, compressImageFilename);

			// Définir le nouveau chemin pour l'image finale
			const newPhotoPath = path.join(__dirname, "../photos/tmp/" + user.username + "_" + imageIndex + ".png");

			// Renommer/déplacer le fichier compressé vers le nouveau chemin
			fs.renameSync(compressImageFilename, newPhotoPath);

			// Lire le fichier compressé en tant que Buffer
			const imageBuffer = await fsPromise.readFile(newPhotoPath);

			// Stocker l'image dans la base de données
			user.photos[imageIndex] = imageBuffer;

			// Supprimer les fichiers temporaires
			// fs.rmSync(resizedImageFilename);
		}
		if (req.body.profilePicture)
		{
			if (req.body.profilePicture < 1 || req.body.profilePicture > user.photos.length)
			{
				return res.status(400).json({ alert: {type: "warning", message: "Index de l'image de profil invalide"}});
			}
			user.profilePicture = req.body.profilePicture;
		}
		if (!user.ready)
		{
			if (user.age && user.gender && user.sexualPreferences && user.interests.length > 0 && user.photos[0])
			{
				user.ready = true;
			}
		}
		await user.save();
		res.status(200).json({imageIndex: req.body.imageIndex, alert: {type: "success", message: "Utilisateur mis à jour avec succès"}});
	} catch (error) {
		console.log("Error in updateUser", error);
		res.status(503).json({ alert: {type: "warning", message: "Erreur lors de la mise à jour de l'utilisateur"}});
	}
}

module.exports = updateUser;