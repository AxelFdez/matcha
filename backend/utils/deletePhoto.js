const pool = require("../config/connectBdd");
const fs = require("fs");
const path = require("path");

async function deletePhoto(req, res) {
  try {
    const user = req.user;
    const { imageIndex } = req.body;

    // Validation de l'index
    if (imageIndex === undefined || imageIndex === null) {
      return res.status(400).json({
        alert: { type: "warning", message: "Image index is required" },
      });
    }

    if (imageIndex < 0 || imageIndex >= user.photos.length) {
      return res.status(400).json({
        alert: { type: "warning", message: "Invalid image index" },
      });
    }

    // Récupérer le chemin de la photo à supprimer
    const photoPath = user.photos[imageIndex];

    if (!photoPath) {
      return res.status(400).json({
        alert: { type: "warning", message: "No photo at this index" },
      });
    }

    // Supprimer le fichier physique si il existe
    try {
      const fullPath = path.join(__dirname, "..", photoPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Photo deleted: ${fullPath}`);
      }
    } catch (fileError) {
      console.error("Error deleting file:", fileError);
      // On continue même si la suppression du fichier échoue
    }

    // Mettre à jour le tableau des photos en retirant celle supprimée
    const updatedPhotos = [...user.photos];
    updatedPhotos[imageIndex] = null;

    // Mise à jour en base de données
    const updates = {
      photos: updatedPhotos,
    };

    // Si c'était la photo de profil, la remplacer par une autre photo existante
    if (user.profilepicture === imageIndex) {
      // Trouver la première photo existante (différente de celle supprimée)
      let newProfilePictureIndex = null;
      for (let i = 0; i < updatedPhotos.length; i++) {
        if (i !== imageIndex && updatedPhotos[i] !== null) {
          newProfilePictureIndex = i;
          break;
        }
      }
      updates.profilepicture = newProfilePictureIndex;
    }

    const updateQuery =
      "UPDATE users SET " +
      Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ") +
      " WHERE id = $" +
      (Object.keys(updates).length + 1);
    const updateValues = [...Object.values(updates), user.id];
    await pool.query(updateQuery, updateValues);

    // Vérifier si l'utilisateur a encore au moins une photo
    const hasPhotos = updatedPhotos.some(photo => photo !== null);

    // Si l'utilisateur n'a plus de photos et était ready, le marquer comme not ready
    if (!hasPhotos && user.ready) {
      await pool.query("UPDATE users SET ready = $1 WHERE id = $2", [false, user.id]);
    }

    res.status(200).json({
      alert: { type: "success", message: "Photo deleted successfully" },
    });
  } catch (error) {
    console.log("Error in deletePhoto", error);
    res.status(503).json({
      alert: { type: "warning", message: "Error deleting photo" },
    });
  }
}

module.exports = deletePhoto;
