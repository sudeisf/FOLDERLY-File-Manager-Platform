const router = require('express').Router();
const uploaderController = require('../controller/uploadController');
const authenticateUser = require('../middleware/authenticator');
const { handleUpload } = require('../utils/uploadUtils');

router.post(
    '/file',
        handleUpload,
    authenticateUser,
    uploaderController.uploadFile
);

router.get(
    '/download/:folderName/:fileUid',
    authenticateUser,
    uploaderController.downloadFile
);

router.get(
    '/view/:folderName/:fileUid',
    authenticateUser,
    uploaderController.viewFile
);

router.get(
    '/download-folder/:folderName',
    authenticateUser,
    uploaderController.downloadFolderZip
);


router.delete(
    '/delete/:folderName/:fileUid',
    authenticateUser,
    uploaderController.deleteFile
);


module.exports = router;
