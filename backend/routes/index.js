var express = require('express');
var router = express.Router();
const multer = require('multer');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'photos/tmp/'); // Dossier où les fichiers seront enregistrés
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Initialiser Multer avec le stockage configuré
const upload = multer({ storage: storage });

const verifyToken = require('../middlewares/jwt');
const getLocationWithIp = require('../middlewares/getLocationWithIp');


router.get('/', (req, res) => {
  res.send("OK");
});
// OK
router.post('/login', require('../utils/loginUser'), (req, res) => {});
// KO
router.get('/logout', verifyToken, require('../utils/logoutUser'), (req, res) => {});
// OK
router.post('/register-form', require('../utils/createUser'), (req, res) => {});
// OK
router.post('/resetPasswordSendEmail', require('../utils/resetPasswordSendEmail'), (req, res) => {});
// OK
router.post('/resetPassword', require('../utils/resetPassword'), (req, res) => {});
// OK
router.post('/reSendEmail', verifyToken, require('../utils/reSendEmail'), (req, res) => {});
// OK
router.post('/resetEmail', verifyToken, require('../utils/resetEmail'), (req, res) => {});
// OK
router.post('/verifyEmail', require('../utils/verifyEmail'), (req, res) => {});
// OK
router.post('/updateUser', verifyToken, upload.array('photos', 5), require('../utils/updateUser'), (req, res) => {});
// OK
router.get('/profile/:username', verifyToken, require('../utils/getUser'), (req, res) => {});
// OK
router.get('/verifyToken', verifyToken, (req, res) => {
	res.status(200).json({ message: "Token is valid" });
});
// OK
router.get('/getPhotos/:username', verifyToken, require('../utils/getUserPhotos'), (req, res) => {});
// router.get('/browseUsers', verifyToken, require('../utils/browseUsers'), (req, res) => {});
// KO
router.get('/browseUsers', verifyToken, require('../utils/browseUsers'), (req, res) => {});
// OK
router.get('/getAllTags', verifyToken, require('../utils/getAllTags'), (req, res) => {});

// Notifications endpoints
router.get('/notifications', verifyToken, require('../utils/getNotifications'), (req, res) => {});
router.post('/notifications/mark-viewed', verifyToken, require('../utils/markNotificationsViewed'), (req, res) => {});
router.delete('/notifications/:id', verifyToken, require('../utils/deleteNotification'), (req, res) => {});

// Chat endpoints
router.get('/conversations', verifyToken, require('../utils/getConversations'), (req, res) => {});
router.get('/conversations/:conversationId/messages', verifyToken, require('../utils/getMessages'), (req, res) => {});

// Admin endpoint to create missing conversations for existing matches
router.post('/admin/create-missing-conversations', async (req, res) => {
    try {
        const { createMissingConversations } = require('../utils/createMissingConversations');
        const result = await createMissingConversations();
        res.status(200).json({ 
            message: 'Missing conversations created successfully',
            conversationsCreated: result.length,
            details: result
        });
    } catch (error) {
        console.error('Error creating missing conversations:', error);
        res.status(500).json({ message: 'Error creating missing conversations' });
    }
});

module.exports = router;
