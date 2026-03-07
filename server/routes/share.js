

const router = require('express').Router();
const {
    GenerateShareLink,
    AccessShared
} = require('../controller/shareController');


// Generate Share Link: POST /share/:folderId
// Access Shared Folder: GET /share/:uuid


router.get('/:uuid', AccessShared);
router.post('/:folderId',GenerateShareLink);



module.exports = router;