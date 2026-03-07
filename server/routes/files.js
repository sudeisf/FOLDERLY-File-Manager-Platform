const router = require('express').Router();
const multer = require('multer');
const passport = require('../config/passportConfig');
const uploaderController = require('../controller/uploadController');
const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Allowed: JPG, PNG, SVG, PDF, DOCX, PPTX'));
        }
        cb(null, true);
    },
});
const authenticateUser = require('../middleware/authenticator');

const handleUpload = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (!err) return next();

        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('File size must be less than or equal to 2MB');
        }

        return res.status(400).send(err.message || 'Upload failed');
    });
};

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


router.delete(
    '/delete/:folderName/:fileUid',
    authenticateUser,
    uploaderController.deleteFile
);


module.exports = router;
