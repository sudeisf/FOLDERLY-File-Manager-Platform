const router = require('express').Router();
const authenticateUser = require('../middleware/authenticator');

const {
    createFolder,
    getFolders,
    updateFolder,
    deleteFolder,
    getFoldersName
} = require('../controller/foldersController');
const { toggleFolderStar } = require('../controller/favoritesController');


router.post('/create-folder',
    authenticateUser,
    createFolder);

router.post('/create',
    authenticateUser,
    createFolder);

router.get('/get-folders-names',
    authenticateUser,
    getFoldersName
    );

router.get('/folder-list', 
    authenticateUser,
    getFolders);

router.put('/:id', 
    authenticateUser,
    updateFolder);

router.delete('/:id',
     authenticateUser,
     deleteFolder);

router.put('/:id/star',
    authenticateUser,
    toggleFolderStar);


module.exports = router;