const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { enqueueNotificationJob } = require('../queue/notificationQueue');
const Sstorage = require('../config/supabaseConfig');

const STORAGE_BUCKET = 'Files-uploader';

const getPublicUrl = (path) => {
    if (!path) return null;
    const { data } = Sstorage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data?.publicUrl ?? null;
};

const getUserId = (user) => user?.sub || user?.id;

const uniqObjectIds = (values) => {
    return [...new Set(
        (values || [])
            .filter((value) => typeof value === 'string' && value.trim().length > 0)
            .map((value) => value.trim())
    )];
};


const GenerateShareLink = async (req, res) => {    
    try {
        const userId = getUserId(req.user);
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        const folder = await prisma.folder.findUnique({
            where: {
                id: req.params.folderId,
            },
        });

        if(!folder){    
            return res.status(404).send('Folder not found');
        }

        if (!folder || folder.userId !== userId) {
            return res.status(404).send('Folder not found');
        }

        const share = await prisma.share.create({
            data : {
                folderId : folder.id,
                expiresAt : new Date(Date.now() + 1000 * 60 * 60 * 24),// 24 hours
            }
        });

        const shareLink = `${req.protocol}://${req.get('host')}/share/${share.id}`;

        await enqueueNotificationJob({
            userId,
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

const shareFolderWithUsers = async (req, res) => {
    try {
        const ownerUserId = getUserId(req.user);
        if (!ownerUserId) {
            return res.status(401).send('Unauthorized');
        }

        const folderId = req.params.id;
        const rawEmails = Array.isArray(req.body?.emails) ? req.body.emails : [];
        const rawUserIds = Array.isArray(req.body?.userIds) ? req.body.userIds : [];

        const emails = uniqObjectIds(rawEmails.map((value) => String(value).toLowerCase()));
        const userIds = uniqObjectIds(rawUserIds.map((value) => String(value)));

        if (!emails.length && !userIds.length) {
            return res.status(400).send('Provide at least one recipient via emails or userIds');
        }

        const folder = await prisma.folder.findFirst({
            where: {
                id: folderId,
                userId: ownerUserId,
            },
            select: {
                id: true,
                name: true,
                sharedWithUserIds: true,
            },
        });

        if (!folder) {
            return res.status(404).send('Folder not found');
        }

        const userFilters = [];
        if (emails.length) {
            userFilters.push({ email: { in: emails } });
        }
        if (userIds.length) {
            userFilters.push({ id: { in: userIds } });
        }

        const recipients = await prisma.user.findMany({
            where: {
                OR: userFilters,
            },
            select: {
                id: true,
                username: true,
                email: true,
            },
        });

        const recipientIds = uniqObjectIds(recipients.map((recipient) => recipient.id))
            .filter((id) => id !== ownerUserId);

        if (!recipientIds.length) {
            return res.status(404).send('No valid recipients found');
        }

        const updatedFolderSharedWith = uniqObjectIds([...(folder.sharedWithUserIds || []), ...recipientIds]);

        await prisma.$transaction([
            prisma.folder.update({
                where: { id: folder.id },
                data: {
                    sharedWithUserIds: updatedFolderSharedWith,
                },
            }),
            prisma.file.updateMany({
                where: {
                    folderId: folder.id,
                    userId: ownerUserId,
                },
                data: {
                    sharedWithUserIds: updatedFolderSharedWith,
                },
            }),
        ]);

        const validRecipients = recipients.filter((recipient) => recipient.id !== ownerUserId);

        // look up owner username for activity messages
        const owner = await prisma.user.findUnique({
            where: { id: ownerUserId },
            select: { username: true },
        });
        const ownerName = owner?.username ?? 'Someone';
        const recipientNames = validRecipients.map((r) => r.username).join(', ');
        const shareMessage = `${ownerName} shared this folder with ${recipientNames}`;

        // log activity on the folder
        await logActivity({
            actorId: ownerUserId,
            actorName: ownerName,
            itemId: folder.id,
            itemType: 'folder',
            event: 'shared',
            message: shareMessage,
        });

        // log activity on each file inside the folder
        const folderFiles = await prisma.file.findMany({
            where: { folderId: folder.id, userId: ownerUserId },
            select: { id: true },
        });

        await Promise.all(
            folderFiles.map((file) =>
                logActivity({
                    actorId: ownerUserId,
                    actorName: ownerName,
                    itemId: file.id,
                    itemType: 'file',
                    event: 'shared',
                    message: `${ownerName} shared this file with ${recipientNames}`,
                })
            )
        );

        await Promise.all(
            validRecipients.map((recipient) =>
                enqueueNotificationJob({
                    userId: recipient.id,
                    type: 'share',
                    title: 'Folder Shared With You',
                    message: `${folder.name} was shared with you.`,
                    metadata: {
                        folderId: folder.id,
                        folderName: folder.name,
                        ownerUserId,
                    },
                })
            )
        );

        return res.status(200).json({
            success: true,
            message: 'Folder shared successfully',
            folderId: folder.id,
            sharedWithUserIds: updatedFolderSharedWith,
            recipients: validRecipients,
        });
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
};


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
                url: getPublicUrl(file.url),
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

// ─── log a share activity for all affected item IDs ───────────────────────────

const logActivity = async ({ actorId, actorName, itemId, itemType, event, message }) => {
    try {
        await prisma.activityLog.create({
            data: { actorId, actorName, itemId, itemType, event, message },
        });
    } catch (err) {
        // never let activity logging break the main flow
        console.warn('[ActivityLog] write failed:', err.message);
    }
};

// ─── get last 3 activity events for a file or folder ──────────────────────────

const getItemActivity = async (req, res) => {
    try {
        const userId = getUserId(req.user);
        if (!userId) return res.status(401).send('Unauthorized');

        const { type, id } = req.params;
        if (!['file', 'folder'].includes(type)) {
            return res.status(400).send('type must be file or folder');
        }

        // verify the requesting user has access to this item (either as owner OR as shared user)
        const item = type === 'folder'
            ? await prisma.folder.findFirst({
                where: {
                    id,
                    OR: [
                        { userId },                    // owner
                        { sharedWithUserIds: { has: userId } }, // shared with user
                    ],
                },
                select: { id: true, userId: true },
            })
            : await prisma.file.findFirst({
                where: {
                    id,
                    OR: [
                        { userId },                    // owner
                        { sharedWithUserIds: { has: userId } }, // shared with user
                    ],
                },
                select: { id: true, userId: true },
            });

        if (!item) {
            return res.status(403).send('Access denied');
        }

        const activities = await prisma.activityLog.findMany({
            where: { itemId: id, itemType: type },
            orderBy: { createdAt: 'desc' },
            take: 3,
        });

        return res.status(200).json({ activities });
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    GenerateShareLink,
    AccessShared,
    getSharedView,
    shareFolderWithUsers,
    getItemActivity,
    logActivity,
}