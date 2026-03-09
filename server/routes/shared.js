const router = require('express').Router();
const authenticateUser = require('../middleware/authenticator');
const { getSharedView } = require('../controller/shareController');

router.get('/', authenticateUser, getSharedView);

module.exports = router;
