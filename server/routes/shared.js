const router = require('express').Router();
const authenticateUser = require('../middleware/authenticator');
const { getSharedView, shareFolderWithUsers, getItemActivity } = require('../controller/shareController');

router.get('/', authenticateUser, getSharedView);
router.post('/folders/:id/share-with', authenticateUser, shareFolderWithUsers);
router.get('/:type/:id/activity', authenticateUser, getItemActivity);

module.exports = router;
