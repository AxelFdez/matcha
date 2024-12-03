var express = require('express');
var router = express.Router();
const multer = require('multer');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'photos/tmp/'); // Dossier où les fichiers seront enregistrés
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Initialiser Multer avec le stockage configuré
const upload = multer({ storage: storage });

const verifyToken = require('../middlewares/jwt');
const getLocationWithIp = require('../middlewares/getLocationWithIp');


router.get('/', (req, res) => {
  res.send("OK");
});

router.post('/login', require('../utils/loginUser'), (req, res) => {});

router.post('/register-form', require('../utils/createUser'), (req, res) => {});

router.post('/resetPasswordSendEmail', require('../utils/resetPasswordSendEmail'), (req, res) => {});

router.post('/resetPassword', require('../utils/resetPassword'), (req, res) => {});

router.post('/reSendEmail', verifyToken, require('../utils/reSendEmail'), (req, res) => {});

router.post('/resetEmail', verifyToken, require('../utils/resetEmail'), (req, res) => {});

router.get('/verifyEmail', require('../utils/verifyEmail'), (req, res) => {});

router.post('/updateUser', verifyToken, upload.array('photos', 5), require('../utils/updateUser'), (req, res) => {});

router.get('/profile/:username', verifyToken, require('../utils/getUser'), (req, res) => {});

router.get('/verifyToken', verifyToken, (req, res) => {
	res.status(200).json({ message: "Token is valid" });
});

router.get('/getPhotos/:username', verifyToken, require('../utils/getUserPhotos'), (req, res) => {});

// router.get('/browseUsers', verifyToken, require('../utils/browseUsers'), (req, res) => {});
router.get('/browseUsers', require('../utils/browseUsers'), (req, res) => {});

module.exports = router;
