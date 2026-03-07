const { PrismaClient } = require('@prisma/client');
const storage = require('../config/supabaseConfig');
const prisma = new PrismaClient();

const getUserId = (user) => user?.sub || user?.id;

const createFolder = async (req, res) => {
    try {
        const name = (req.body?.name || '').trim();
        const user = req.user;
        const userId = user?.sub || user?.id;

        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        if (!name) {
            return res.status(400).send('Folder name is required');
        }

        const existingFolder = await prisma.folder.findFirst({
            where: {
                name,
                userId,
            },
        });

        if (existingFolder) {
            return res.status(400).send('Folder already exists');
        }

        const folder = await prisma.folder.create({
            data: {
                userId,
                name,
            },
        });

        // Do not fail folder creation if storage sync is temporarily unavailable.
        let storageBucket = null;
        let storageWarning = null;

        try {
            const placeHolderFile = new Blob(['placeholder file'], { type: 'text/plain' });
            const { data, error } = await storage.from('Files-uploader').upload(
                `${userId}/${folder.name}/readme.txt`,
                placeHolderFile
            );

            if (error) {
                storageWarning = `Storage sync failed: ${error.message}`;
            } else {
                storageBucket = data;
            }
        } catch (storageError) {
            storageWarning = `Storage sync failed: ${storageError.message}`;
        }

        return res.status(200).json({
            success: true,
            message: storageWarning ? 'Folder created, but storage sync failed' : 'Folder created successfully',
            folderID: folder.id,
            storageBucket,
            storageWarning,
        });
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
};

const getFolders = async (req, res) => {
    try {
        const userId = getUserId(req.user);
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        const folders = await prisma.folder.findMany({
            where: {
                userId,
            }
        });

        if (!folders || folders.length === 0) {
            return res.status(200).json([]);
        }

        const folderDetails = await Promise.all(
            folders.map(async (folder) => {
                const foldername = folder.name;
                const folderPath = `${userId}/${foldername}`.replace(/\/$/, '');
                try {
                    const { data, error } = await storage
                        .from('Files-uploader')
                        .list(folderPath, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' }
                        }); 

                    if (error) {
                        console.error(`Error fetching files for folder ${foldername}:`, error.message);
                        return {
                            ...folder,
                            files: [],
                        };
                    }

                    if (!data || data.length === 0) {
                        return {
                            ...folder,
                            files: [],
                        };
                    }

                    const sortedFiles = data.sort((a, b) => a.name.localeCompare(b.name));

                    return {
                        ...folder,
                        files: sortedFiles,
                    };

                } catch (error) {
                    console.error(`Error processing folder ${foldername}:`, error.message);
                    return {
                        ...folder,
                        files: [],
                    };
                }
            })
        );

        return res.status(200).json(folderDetails);

    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
};

const getFoldersName = async (req, res) => {
    try {
        const userId = getUserId(req.user);
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        const folders = await prisma.folder.findMany({
            where: {
                userId,
            },
            select: {
                name: true,
            }
        });

        if (!folders || folders.length === 0) {
            return res.status(200).json([]);
        }

        const folderNames = folders.map(folder => folder.name);

        return res.status(200).json(folderNames);

    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
};




const updateFolder = async (req, res) => {
    try {
        const userId = getUserId(req.user);
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        const newName = (req.body?.name || '').trim();
        if (!newName) {
            return res.status(400).send('Folder name is required');
        }

        const existing = await prisma.folder.findFirst({
            where: {
                id: req.params.id,
                userId,
            },
        });

        if (!existing) {
            return res.status(404).send('Folder not found');
        }

        const duplicate = await prisma.folder.findFirst({
            where: {
                userId,
                name: newName,
                id: { not: req.params.id },
            },
        });

        if (duplicate) {
            return res.status(409).send('A folder with this name already exists');
        }

        const folder = await prisma.folder.update({
            where: {
                id: req.params.id,
            },
            data: {
                name: newName,
            },
        });

        return res.status(200).json(folder);
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
};



const deleteFolder = async (req, res) => {
    try {
        const userId = getUserId(req.user);
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        const folder = await prisma.folder.findFirst({
            where: {
                id: req.params.id,
                userId,
            },
        });

        if (!folder) {
            return res.status(404).send('Folder not found');
        }

        const files = await prisma.file.findMany({
            where: {
                folderId: folder.id,
                userId,
            },
            select: {
                id: true,
                url: true,
            },
        });

        if (files.length > 0) {
            const filePaths = files.map((file) => file.url);
            const { error: deleteFileError } = await storage.from('Files-uploader').remove(filePaths);
            if (deleteFileError) {
                console.error('Supabase delete file error:', deleteFileError.message);
                return res.status(400).send('Failed to delete folder files');
            }

            await prisma.file.deleteMany({
                where: {
                    folderId: folder.id,
                    userId,
                },
            });
        }

        await prisma.folder.delete({
            where: {
                id: req.params.id,
            },
        });

        return res.status(200).send('Folder deleted successfully');
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
};

module.exports = {
    createFolder, 
    getFolders, 
    deleteFolder, 
    updateFolder,
    getFoldersName
}; 