var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "photos/tmp/"); // Dossier où les fichiers seront enregistrés
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier sécurisé avec timestamp pour éviter les collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'upload-' + uniqueSuffix + ext);
  },
});

// Validation du type de fichier
const fileFilter = (req, file, cb) => {
  // Whitelist des MIME types autorisés
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seuls les formats JPEG, PNG et WebP sont acceptés.'), false);
  }
};

// Initialiser Multer avec le stockage configuré et les validations
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite à 10MB
    files: 5 // Maximum 5 fichiers
  }
});

const verifyToken = require("../middlewares/jwt");
const getLocationWithIp = require("../middlewares/getLocationWithIp");

router.get("/", (req, res) => {
  res.send("OK");
});
// OK
router.post("/login", require("../utils/loginUser"), (req, res) => {});
// KO
router.get("/logout", verifyToken, require("../utils/logoutUser"), (req, res) => {});
// OK
router.post("/register-form", require("../utils/createUser"), (req, res) => {});
// OK
router.post(
  "/resetPasswordSendEmail",
  require("../utils/resetPasswordSendEmail"),
  (req, res) => {}
);
// OK
router.post("/resetPassword", require("../utils/resetPassword"), (req, res) => {});
// OK
router.post("/reSendEmail", require("../utils/reSendEmail"), (req, res) => {});
// OK
router.post("/resetEmail", verifyToken, require("../utils/resetEmail"), (req, res) => {});
// OK
router.post("/verifyEmail", require("../utils/verifyEmail"), (req, res) => {});
// OK
router.post(
  "/updateUser",
  verifyToken,
  (req, res, next) => {
    upload.array("photos", 5)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Erreur multer (taille de fichier, nombre de fichiers, etc.)
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            alert: { type: "warning", message: "Fichier trop volumineux (max 10MB)" }
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            alert: { type: "warning", message: "Trop de fichiers (max 5)" }
          });
        }
        return res.status(400).json({
          alert: { type: "warning", message: "Erreur lors de l'upload: " + err.message }
        });
      } else if (err) {
        // Erreur de validation du type de fichier
        return res.status(400).json({
          alert: { type: "warning", message: err.message }
        });
      }
      next();
    });
  },
  require("../utils/updateUser"),
  (req, res) => {}
);
// Delete photo
router.post("/deletePhoto", verifyToken, require("../utils/deletePhoto"), (req, res) => {});
// Get profile visitors
router.get(
  "/profile/visitors",
  verifyToken,
  require("../utils/getProfileVisitors"),
  (req, res) => {}
);
// Get profile likes
router.get("/profile/likes", verifyToken, require("../utils/getProfileLikes"), (req, res) => {});

// Get profile unlikes
router.get("/profile/unlikes", verifyToken, require("../utils/getProfileUnlikes"));

// Update GPS location
router.post(
  "/update-gps-location",
  verifyToken,
  require("../utils/updateGpsLocation"),
  (req, res) => {}
);
// Reset to automatic location
router.post(
  "/reset-automatic-location",
  verifyToken,
  require("../utils/resetToAutomaticLocation"),
  (req, res) => {}
);
// OK
router.get("/profile/:username", verifyToken, require("../utils/getUser"), (req, res) => {});
// OK
router.get("/verifyToken", verifyToken, (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});
// OK
router.get(
  "/getPhotos/:username",
  verifyToken,
  require("../utils/getUserPhotos"),
  (req, res) => {}
);
// router.get('/browseUsers', verifyToken, require('../utils/browseUsers'), (req, res) => {});
// OK
router.get("/browseUsers", verifyToken, require("../utils/browseUsers"), (req, res) => {});
// OK
router.get("/getAllTags", verifyToken, require("../utils/getAllTags"), (req, res) => {});

// Notifications endpoints
router.get("/notifications", verifyToken, require("../utils/getNotifications"), (req, res) => {});
router.post(
  "/notifications/markViewed",
  verifyToken,
  (req, res, next) => {
    //console.log("🚀 POST /notifications/markViewed endpoint hit");
    next();
  },
  require("../utils/markNotificationsViewed")
);
router.delete(
  "/notifications/:id",
  verifyToken,
  require("../utils/deleteNotification"),
  (req, res) => {}
);

// Chat endpoints
router.get("/conversations", verifyToken, require("../utils/getConversations"), (req, res) => {});
router.get(
  "/conversations/:conversationId/messages",
  verifyToken,
  require("../utils/getMessages"),
  (req, res) => {}
);

// Admin endpoint to create missing conversations for existing matches
router.post("/admin/create-missing-conversations", async (req, res) => {
  try {
    const { createMissingConversations } = require("../utils/createMissingConversations");
    const result = await createMissingConversations();
    res.status(200).json({
      message: "Missing conversations created successfully",
      conversationsCreated: result.length,
      details: result,
    });
  } catch (error) {
    // console.error("Error creating missing conversations:", error);
    res.status(500).json({ message: "Error creating missing conversations" });
  }
});

module.exports = router;
