const { Worker } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const { NOTIFICATION_QUEUE_NAME } = require('../queue/notificationQueue');
const { getRedisConnection } = require('../queue/redisConnection');
const { emitNotificationToUser } = require('../realtime/socketServer');

const prisma = new PrismaClient();
let notificationWorker;

const initializeNotificationWorker = () => {
  if (notificationWorker || process.env.NODE_ENV === 'test') {
    return notificationWorker;
  }

  notificationWorker = new Worker(
    NOTIFICATION_QUEUE_NAME,
    async (job) => {
      if (job.name !== 'create-notification') {
        return;
      }

      const { userId, type, title, message, metadata } = job.data;

      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          metadata,
          isRead: false,
        },
      });

      emitNotificationToUser(userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      });
    },
    {
      connection: getRedisConnection(),
      concurrency: 8,
    }
  );

  notificationWorker.on('completed', (job) => {
    console.log(`[NotificationWorker] Completed job ${job.id} (${job.name})`);
  });

  notificationWorker.on('failed', (job, err) => {
    console.error(`[NotificationWorker] Failed job ${job?.id || 'unknown'}:`, err?.message || err);
  });

  return notificationWorker;
};

module.exports = {
  initializeNotificationWorker,
};
