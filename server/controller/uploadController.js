const Sstorage = require('../config/supabaseConfig');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Readable } = require('stream');
const archiver = require('archiver');
const { enqueueNotificationJob } = require('../queue/notificationQueue');

const getUserId = (user) => user?.sub || user?.id;

const buildFolderPathSegments = async ({ folderId, userId }) => {
    const segments = [];
    const visited = new Set();
    let currentFolderId = folderId;

    while (currentFolderId) {
        if (visited.has(currentFolderId)) {
            throw new Error('Circular folder hierarchy detected');
        }

        visited.add(currentFolderId);

        const folder = await prisma.folder.findFirst({
            where: {
                id: currentFolderId,
                userId,
            },
            select: {
                id: true,
                name: true,
                parentId: true,
            },
        });

        if (!folder) {
            throw new Error('Folder not found');
        }

        segments.unshift(folder.name);
        currentFolderId = folder.parentId;
    }

    return segments;
};


const uploadFile = async (req, res) => {
    const { folder, folderId } = req.body;
    const user = req.user;
    const file = req.file;

    try {
     
        const userId = getUserId(user);
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

      
        if (!file) {
            return res.status(400).send('Please upload a file');
        }

       
        const normalizedFolderId = typeof folderId === 'string' ? folderId.trim() : '';
        const normalizedFolderName = typeof folder === 'string' ? folder.trim() : '';

        let folderRecord = null;
        let folderPath = 'public';

        if (normalizedFolderId) {
            folderRecord = await prisma.folder.findFirst({
                where: {
                    id: normalizedFolderId,
                    userId,
                },
                select: {
                    id: true,
                    name: true,
                    parentId: true,
                },
            });

            if (!folderRecord) {
                return res.status(404).send('Folder not found');
            }

            const pathSegments = await buildFolderPathSegments({
                folderId: folderRecord.id,
                userId,
            });
            folderPath = pathSegments.join('/');
        } else {
            const fallbackFolderName = normalizedFolderName || 'public';

            folderRecord = await prisma.folder.findFirst({
                where: {
                    name: fallbackFolderName,
                    userId,
                    parentId: null,
                },
                select: {
                    id: true,
                    name: true,
                    parentId: true,
                },
            });

            if (!folderRecord) {
                folderRecord = await prisma.folder.create({
                    data: {
                        name: fallbackFolderName,
                        userId,
                        parentId: null,
                    },
                    select: {
                        id: true,
                        name: true,
                        parentId: true,
                    },
                });
            }

            folderPath = folderRecord.name;
        }
       


        const fileContent = file.buffer;
        const { data, error } = await Sstorage.from("Files-uploader").upload(
            `${userId}/${folderPath}/${file.originalname}`,
            fileContent,
            {
                contentType: file.mimetype,
            }
        );

        if (error || !data) {
            const uploadMessage = error?.message || 'Upload failed: no response data from Supabase';
            console.error('Supabase upload error:', uploadMessage);
            return res.status(400).send(uploadMessage);
        }

        // Some storage responses may not include `id`; keep uid populated.
        const supabaseFileid = data.id || data.path;

        // const fileId = uuidv4();

        await prisma.file.create({
            data: {
                uid: supabaseFileid,
                folderId: folderRecord.id, // Store the ID of the folder
                name: file.originalname,
                url: data.path, // Supabase URL
                userId, // User ID
                size: parseInt(file.size, 10), // File size
            },
        });

        // Step 5: Return success response
        await enqueueNotificationJob({
            userId,
            type: 'system',
            title: 'Upload Complete',
            message: `${file.originalname} was uploaded successfully.`,
            metadata: {
                folderId: folderRecord.id,
                folderPath,
                fileName: file.originalname,
            },
        });

        return res.status(200).send({
            message: 'File uploaded successfully',
            folderPath,
            folderId: folderRecord.id,
        });
    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
};

const getFile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send('Unauthorized');
        }

             
        const { fileUid } = req.params;

        const file = await prisma.file.findUnique({
            where: {
                uid: fileUid,
                userId: user.id,  
            },
        });

        if (!file) {
            return res.status(404).send('File not found');
        }
         
      
        const { data: foldersData, error: folderError } = await Sstorage.from(file.folderId).list('', { limit: 100 });
        if (folderError) {
            console.error('Supabase folder list error:', folderError.message);
            return res.status(400).send('Failed to fetch folders');
        }

        const folder = foldersData.find(f => f.name === file.folderId); 
        
        if (!folder) {
            return res.status(404).send('Folder not found');
        }

        return res.status(200).json({
            file,
            folder,
        });

    } catch (error) {
        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
};



const deleteFile = async (req, res) => {
    try {
        const user = req.user;
        const userId = getUserId(user);
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        const { folderName, fileUid } = req.params;
        const uid = String(fileUid);
        
        const folder = await prisma.folder.findFirst({
            where: {
                name: folderName,
                userId,
            },
        });
        
        if (!folder) {
            return res.status(404).send('Folder not found');
        }

        const file = await prisma.file.findFirst({
            where: {
                uid: uid,
                folderId: folder.id,
                userId: folder.userId,
            },
        });
        if (!file) {
            return res.status(404).send('File not found');
        }
        
        const { data, error } = await Sstorage.from("Files-uploader").remove([file.url]);
        if (error) {
            console.error('Supabase delete error:', error.message);
            return res.status(400).send('Failed to delete file');
        }
        if(data){
            await prisma.file.delete({
                where: {
                    id: file.id,
                },
            });
        return res.status(200).send('File deleted successfully');   
        }

        
        
    } catch (error) {

        console.error('Internal server error:', error.message);
        return res.status(500).send('Internal server error');
    }
}

const downloadFile = async (req, res) => {
    try {
      const user = req.user;
            const userId = getUserId(user);
            if (!userId) {
        return res.status(401).send('Unauthorized');
      }
    
      const { folderName, fileUid } = req.params;
      const uid = String(fileUid);
      
      const folder = await prisma.folder.findFirst({
        where: {
          name: folderName,
                    userId,
        },
      });
      
      if (!folder) {
        return res.status(404).send('Folder not found');
      }
  
      const file = await prisma.file.findFirst({
        where: {
          uid: uid,
          folderId: folder.id,
          userId: folder.userId,
        },
      });
      if (!file) {
        return res.status(404).send('File not found');
      }
  
      const { data, error } = await Sstorage.from("Files-uploader").download(file.url);
      if (error) {
        console.error('Supabase download error:', error.message);
        return res.status(400).send('Failed to download file');
      }
      if (!data || data.size === 0) {
        return res.status(400).send('File is empty or invalid');
      }
  
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length === 0) {
        return res.status(400).send('File buffer is empty');
      }


        const fileStream = Readable.from(buffer);
        const originalName = decodeURIComponent(file.name.trim());
        // Keep original filename while preventing header injection / path separators.
        const safeName = originalName
            .replace(/[\r\n]/g, '')
            .replace(/[\\/]/g, '-')
            .replace(/"/g, "'");
        const encodedName = encodeURIComponent(safeName);
      
      res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${safeName}"; filename*=UTF-8''${encodedName}`);
      res.setHeader('Content-Length', file.size);
      fileStream.on('error', (streamError) => {
        console.error('Stream error:', streamError.message);
        if (!res.headersSent) {
          res.status(500).send('Failed to stream file');
        }
      });
  
      fileStream.pipe(res);
  
    } catch (error) {
      console.error('Internal server error:', error.message);
      if (!res.headersSent) {
        res.status(500).send('Internal server error');
      }
    }
  };

const viewFile = async (req, res) => {
        try {
            const user = req.user;
            const userId = getUserId(user);
            if (!userId) {
                return res.status(401).send('Unauthorized');
            }

            const { folderName, fileUid } = req.params;
            const uid = String(fileUid);

            const folder = await prisma.folder.findFirst({
                where: {
                    name: folderName,
                    userId,
                },
            });

            if (!folder) {
                return res.status(404).send('Folder not found');
            }

            const file = await prisma.file.findFirst({
                where: {
                    uid: uid,
                    folderId: folder.id,
                    userId: folder.userId,
                },
            });

            if (!file) {
                return res.status(404).send('File not found');
            }

            const { data, error } = await Sstorage.from("Files-uploader").download(file.url);
            if (error) {
                console.error('Supabase view error:', error.message);
                return res.status(400).send('Failed to open file');
            }

            if (!data || data.size === 0) {
                return res.status(400).send('File is empty or invalid');
            }

            const arrayBuffer = await data.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            if (buffer.length === 0) {
                return res.status(400).send('File buffer is empty');
            }

            const fileStream = Readable.from(buffer);
            const originalName = decodeURIComponent(file.name.trim());
            const safeName = originalName
                .replace(/[\r\n]/g, '')
                .replace(/[\\/]/g, '-')
                .replace(/"/g, "'");
            const encodedName = encodeURIComponent(safeName);
            const mimeType = data.type || 'application/octet-stream';

            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', `inline; filename="${safeName}"; filename*=UTF-8''${encodedName}`);
            res.setHeader('Content-Length', buffer.length);

            fileStream.on('error', (streamError) => {
                console.error('Stream error:', streamError.message);
                if (!res.headersSent) {
                    res.status(500).send('Failed to stream file');
                }
            });

            fileStream.pipe(res);
        } catch (error) {
            console.error('Internal server error:', error.message);
            if (!res.headersSent) {
                res.status(500).send('Internal server error');
            }
        }
};

const downloadFolderZip = async (req, res) => {
        try {
            const user = req.user;
            const userId = getUserId(user);
            if (!userId) {
                return res.status(401).send('Unauthorized');
            }

            const { folderName } = req.params;

            const folder = await prisma.folder.findFirst({
                where: {
                    name: folderName,
                    userId,
                },
            });

            if (!folder) {
                return res.status(404).send('Folder not found');
            }

            const files = await prisma.file.findMany({
                where: {
                    folderId: folder.id,
                    userId: folder.userId,
                },
                select: {
                    name: true,
                    url: true,
                },
            });

            if (!files.length) {
                return res.status(404).send('No files found in folder');
            }

            const safeFolderName = String(folderName)
                .replace(/[\r\n]/g, '')
                .replace(/[\\/]/g, '-')
                .replace(/"/g, "'")
                .trim() || 'folder';

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFolderName}.zip"`);

            const archive = archiver('zip', { zlib: { level: 9 } });

            archive.on('error', (error) => {
                console.error('Zip archive error:', error.message);
                if (!res.headersSent) {
                    res.status(500).send('Failed to create zip');
                }
            });

            archive.pipe(res);

            let appendedCount = 0;

            for (const file of files) {
                const { data, error } = await Sstorage.from('Files-uploader').download(file.url);
                if (error || !data) {
                    console.error(`Failed to download file for zip (${file.name}):`, error?.message || 'Unknown error');
                    continue;
                }

                const buffer = Buffer.from(await data.arrayBuffer());
                if (!buffer.length) {
                    continue;
                }

                const safeFileName = String(file.name)
                    .replace(/[\r\n]/g, '')
                    .replace(/[\\/]/g, '-')
                    .trim() || `file-${appendedCount + 1}`;

                archive.append(buffer, { name: safeFileName });
                appendedCount += 1;
            }

            if (!appendedCount) {
                archive.append('No downloadable files were available in this folder.', { name: 'README.txt' });
            }

            await archive.finalize();
        } catch (error) {
            console.error('Internal server error:', error.message);
            if (!res.headersSent) {
                return res.status(500).send('Internal server error');
            }
        }
};

module.exports = {uploadFile, getFile, deleteFile , downloadFile, viewFile, downloadFolderZip}; // CommonJS syntax for export
