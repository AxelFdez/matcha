const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// const inputFile = path.join(__dirname, '../photos/IMG_5486.JPG');
// const outputFile = path.join(__dirname, '../photos/tmp/IMG_5486_resized.jpg');

async function compressImageToUnder1MB(inputPath, outputPath) {
  // const inputPathName = path.parse(inputPath).name;
  let quality = 90; // Démarrez avec une haute qualité.
  let sizeInMB = fs.statSync(inputPath).size / 1024 / 1024;
  if (sizeInMB < 1) {
    // console.log('Image déjà inférieure à 1 MB');
    fs.renameSync(inputPath, outputPath);
    return;
  }
  while (sizeInMB > 1 && quality > 10) {
    await sharp(inputPath)
      .jpeg({ quality: quality }) // Ajuster la qualité.
      .toFile(outputPath);
    sizeInMB = fs.statSync(outputPath).size / 1024 / 1024; // Convertir en mégaoctets.
    quality -= 10; // Réduisez la qualité pour la prochaine itération si nécessaire.
  }
  fs.rmSync(inputPath); // Supprimer l'image d'origine.
  fs.renameSync(inputPath, outputPath);
  // console.log(`Image compressée à ${sizeInMB.toFixed(2)} MB avec une qualité de ${quality + 10}`);
}

async function resizeImage(inputFile, outputFile, width, height) {
  await sharp(inputFile)
    .jpeg({ quality: 100 })
    .resize({
      width: width,
      height: height,
      fit: sharp.fit.cover,
      position: sharp.strategy.entropy, // Centre la partie la plus "intéressante" de l'image
    })
    .toFile(outputFile)
    .then(() => {
      // console.log('Image redimensionnée avec options spécifiques');
    })
    .catch((err) => {
      // console.error('Erreur lors du redimensionnement de l\'image:', err);
    });
  fs.rmSync(inputFile); // Supprimer l'image d'origine.
}

function imageToBase64(path) {
  return fs.promises
    .readFile(path)
    .then((data) => data.toString("base64"))
    .catch((err) => {
      // console.error('Erreur lors de la lecture du fichier:', err);
    });
}

module.exports = { resizeImage, compressImageToUnder1MB, imageToBase64 };
