const router = require('express').Router();
const multer = require('multer');
const passport = require('../config/passportConfig');
const uploaderController = require('../controller/uploadController');
const upload = multer({ dest: 'uploads/' });
const authenticateUser = require('../middleware/authenticator');

router.post(
    '/file',
    upload.single('file'),
    authenticateUser,
    uploaderController.uploadFile
);

router.get(
    '/download/:folderName/:fileUid',
    authenticateUser,
    uploaderController.downloadFile
);


router.delete(
    '/delete/:folderName/:fileUid',
    authenticateUser,
    uploaderController.deleteFile
);


module.exports = router;
