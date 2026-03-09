const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getUserId = (user) => user?.sub || user?.id;

const toggleFileStar = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    const file = await prisma.file.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
      select: {
        id: true,
        name: true,
        isStarred: true,
        updatedAt: true,
      },
    });

    if (!file) {
      return res.status(404).send('File not found');
    }

    const updated = await prisma.file.update({
      where: { id: file.id },
      data: { isStarred: !file.isStarred },
      select: {
        id: true,
        name: true,
        isStarred: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: updated.isStarred ? 'File starred' : 'File unstarred',
      file: updated,
    });
  } catch (error) {
    console.error('Internal server error:', error.message);
    return res.status(500).send('Internal server error');
  }
};

const toggleFolderStar = async (req, res) => {
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
      select: {
        id: true,
        name: true,
        isStarred: true,
        updatedAt: true,
      },
    });

    if (!folder) {
      return res.status(404).send('Folder not found');
    }

    const updated = await prisma.folder.update({
      where: { id: folder.id },
      data: { isStarred: !folder.isStarred },
      select: {
        id: true,
        name: true,
        isStarred: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: updated.isStarred ? 'Folder starred' : 'Folder unstarred',
      folder: updated,
    });
  } catch (error) {
    console.error('Internal server error:', error.message);
    return res.status(500).send('Internal server error');
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    const [starredFiles, starredFolders] = await Promise.all([
      prisma.file.findMany({
        where: {
          userId,
          isStarred: true,
        },
        select: {
          id: true,
          name: true,
          uid: true,
          url: true,
          size: true,
          folderId: true,
          updatedAt: true,
          createdAt: true,
        },
      }),
      prisma.folder.findMany({
        where: {
          userId,
          isStarred: true,
        },
        select: {
          id: true,
          name: true,
          parentId: true,
          updatedAt: true,
          createdAt: true,
        },
      }),
    ]);

    const favorites = [
      ...starredFiles.map((file) => ({
        type: 'file',
        id: file.id,
        name: file.name,
        uid: file.uid,
        url: file.url,
        size: file.size,
        folderId: file.folderId,
        updatedAt: file.updatedAt,
        createdAt: file.createdAt,
      })),
      ...starredFolders.map((folder) => ({
        type: 'folder',
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        updatedAt: folder.updatedAt,
        createdAt: folder.createdAt,
      })),
    ].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt).getTime();
      return bTime - aTime;
    });

    return res.status(200).json(favorites);
  } catch (error) {
    console.error('Internal server error:', error.message);
    return res.status(500).send('Internal server error');
  }
};

module.exports = {
  toggleFileStar,
  toggleFolderStar,
  getFavorites,
};
