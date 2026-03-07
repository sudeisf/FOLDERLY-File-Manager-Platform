const multer = require('multer');

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

    return cb(null, true);
  },
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send('File size must be less than or equal to 2MB');
    }

    return res.status(400).send(err.message || 'Upload failed');
  });
};

module.exports = {
  allowedMimeTypes,
  handleUpload,
};
