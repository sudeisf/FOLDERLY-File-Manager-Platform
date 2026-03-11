const router = require('express').Router();
const authenticateUser = require('../middleware/authenticator');
const { shareFolderWithUsers, getItemActivity, listSharedItems, getUserActivity } = require('../controller/shareController');


// List items shared with the current user
router.get('/', authenticateUser, listSharedItems);

// Get user's recent activities
router.get('/my-activity', authenticateUser, getUserActivity);

router.post('/folders/:id/share-with', authenticateUser, shareFolderWithUsers);
router.get('/:type/:id/activity', authenticateUser, getItemActivity);

module.exports = router;
