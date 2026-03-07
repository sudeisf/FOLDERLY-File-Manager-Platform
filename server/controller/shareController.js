const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const GenerateShareLink = async (req, res) => {    
    try {
        const user = req.user;
        //check if user is authenticated
        if(!user){
            return res.status(401).send('Unauthorized');
        }    
        //find folder by id
        const folder = await prisma.folder.findUnique({
            where: {
                id: req.params.folderId,
            },
        });
        //check if folder exists
        if(!folder){    
            return res.status(404).send('Folder not found');
        }
        //create share link
        if (!folder || folder.userId !== user.sub) {
            return res.status(404).send('Folder not found');
        }

        const share = await prisma.share.create({
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
        const share = await prisma.share.findUnique({
            where: {
                id: req.params.uuid,
            },
        });

        if (!share) {
            return res.status(404).send('Shared link not found');
        }

        if (new Date(share.expiresAt) < new Date()) {
            return res.status(410).send('Shared link has expired');
        }

        const folder = await prisma.folder.findUnique({
            where: {
                id: share.folderId,
            },
        });

        if (!folder) {
            return res.status(404).send('Folder not found');
        }

        const files = await prisma.file.findMany({
            where: {
                folderId: folder.id,
            },
            select: {
                id: true,
                name: true,
                size: true,
                createdAt: true,
                url: true,
            },
        });

        return res.status(200).json({
            folder: {
                id: folder.id,
                name: folder.name,
            },
            files,
            expiresAt: share.expiresAt,
        });
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
}

module.exports = {
    GenerateShareLink,
    AccessShared
}