

const router = require('express').Router();
const authenticateUser = require('../middleware/authenticator');
const {
    GenerateShareLink,
    AccessShared
} = require('../controller/shareController');


// Generate Share Link: POST /share/:folderId
// Access Shared Folder: GET /share/:uuid


router.get('/:uuid', AccessShared);
router.post('/:folderId', authenticateUser, GenerateShareLink);



module.exports = router;