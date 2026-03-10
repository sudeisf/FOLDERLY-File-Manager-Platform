const { PrismaClient } = require('@prisma/client');
const { enqueueNotificationJob } = require('../queue/notificationQueue');

const prisma = new PrismaClient();

const getUserId = (user) => user?.sub || user?.id;

const getNotifications = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    const tab = String(req.query.tab || 'all').toLowerCase();
    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 100);

    const where = { userId };
    if (tab === 'unread') {
      where.isRead = false;
    } else if (tab === 'system') {
      where.type = 'system';
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Internal server error:', error.message);
    return res.status(500).send('Internal server error');
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!notification) {
      return res.status(404).send('Notification not found');
    }

    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Internal server error:', error.message);
    return res.status(500).send('Internal server error');
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Internal server error:', error.message);
    return res.status(500).send('Internal server error');
  }
};

const enqueueTestNotification = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    const title = String(req.body?.title || 'New Notification');
    const message = String(req.body?.message || 'This is a realtime test notification.');
    const type = String(req.body?.type || 'system');

    await enqueueNotificationJob({
      userId,
      type,
      title,
      message,
      metadata: req.body?.metadata || null,
    });

    return res.status(202).json({
      success: true,
      message: 'Notification queued',
    });
  } catch (error) {
    console.error('Internal server error:', error.message);
    return res.status(500).send('Internal server error');
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  enqueueTestNotification,
};
