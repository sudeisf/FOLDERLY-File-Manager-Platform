const router = require('express').Router();
const authenticateUser = require('../middleware/authenticator');
const { getSharedView, shareFolderWithUsers } = require('../controller/shareController');

router.get('/', authenticateUser, getSharedView);
router.post('/folders/:id/share-with', authenticateUser, shareFolderWithUsers);

module.exports = router;
