const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { enqueueNotificationJob } = require('../queue/notificationQueue');

const getUserId = (user) => user?.sub || user?.id;


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

        await enqueueNotificationJob({
            userId: user.sub || user.id,
            type: 'system',
            title: 'Share Link Created',
            message: `A share link for ${folder.name} was created and will expire in 24 hours.`,
            metadata: {
                folderId: folder.id,
                shareId: share.id,
                expiresAt: share.expiresAt,
            },
        });

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

const getSharedView = async (req, res) => {
    try {
        const userId = getUserId(req.user);
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        const [sharedFolders, sharedFiles] = await Promise.all([
            prisma.folder.findMany({
                where: {
                    sharedWithUserIds: {
                        has: userId,
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            }),
            prisma.file.findMany({
                where: {
                    sharedWithUserIds: {
                        has: userId,
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            }),
        ]);

        const items = [
            ...sharedFolders.map((folder) => ({
                type: 'folder',
                id: folder.id,
                name: folder.name,
                parentId: folder.parentId,
                isStarred: folder.isStarred,
                owner: {
                    id: folder.user.id,
                    username: folder.user.username,
                    email: folder.user.email,
                },
                sharedAt: folder.updatedAt,
            })),
            ...sharedFiles.map((file) => ({
                type: 'file',
                id: file.id,
                uid: file.uid,
                name: file.name,
                size: file.size,
                folderId: file.folderId,
                url: file.url,
                isStarred: file.isStarred,
                owner: {
                    id: file.user.id,
                    username: file.user.username,
                    email: file.user.email,
                },
                sharedAt: file.updatedAt,
            })),
        ].sort((a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime());

        return res.status(200).json({
            items,
            folders: items.filter((item) => item.type === 'folder'),
            files: items.filter((item) => item.type === 'file'),
        });
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    GenerateShareLink,
    AccessShared,
    getSharedView
}