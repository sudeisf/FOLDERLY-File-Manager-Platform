
const {
    prismaClient
} = require('@prisma/client');


const GenerateShareLink = async (req, res) => {    
    try {
        const user = req.user;
        //check if user is authenticated
        if(!user){
            return res.status(401).send('Unauthorized');
        }    
        //find folder by id
        const folder = await prismaClient.folder.findUnique({
            where: {
                id: req.params.id,
            },
        });
        //check if folder exists
        if(!folder){    
            return res.status(404).send('Folder not found');
        }
        //create share link
        const share = await prismaClient.share.create({
            data : {
                folderId : folder.id,
                expiresAt : new Date(Date.now() + 1000 * 60 * 60 * 24),// 24 hours
            }
        });
        //generate share link
        const shareLink = `${req.protocol}://${req.get('host')}/share/${share.id}`;

        return res.status(200).json({
            message : 'Share link generated',
            link : shareLink
        });
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
}


const AccessShared = async (req, res) => {    
    try {
        const user = req.user;
        if(!user){
            return res.status(401).send('Unauthorized');
        }    
        const folder = await prismaClient.folder.findUnique({
            where: {
                id: req.params.id,
            },
        });
        return res.status(200).json(folder);
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
}

module.exports = {
    GenerateShareLink,
    AccessShared
}