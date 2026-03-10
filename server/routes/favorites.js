const router = require('express').Router();
const authenticateUser = require('../middleware/authenticator');
const { getFavorites } = require('../controller/favoritesController');

router.get('/', authenticateUser, getFavorites);

module.exports = router;
