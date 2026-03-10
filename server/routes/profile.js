const router = require('express').Router();

const authenticateUser = require('../middleware/authenticator');
const { handleImageUpload } = require('../utils/uploadUtils');
const { getMyProfile, updateMyProfile, uploadMyProfileImage, getMyRecentActivity } = require('../controller/profileController');

router.get('/me', authenticateUser, getMyProfile);
router.put('/me', authenticateUser, updateMyProfile);
router.post('/me/avatar', authenticateUser, handleImageUpload, uploadMyProfileImage);
router.get('/me/activity', authenticateUser, getMyRecentActivity);

module.exports = router;
