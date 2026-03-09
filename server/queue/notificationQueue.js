const { Queue } = require('bullmq');
const { getRedisConnection } = require('./redisConnection');

const NOTIFICATION_QUEUE_NAME = 'notification-jobs';

const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: getRedisConnection(),
});

const enqueueNotificationJob = async ({ userId, type, title, message, metadata }) => {
  await notificationQueue.add(
    'create-notification',
    {
      userId,
      type: type || 'system',
      title,
      message,
      metadata: metadata || null,
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 100,
    }
  );
};

module.exports = {
  NOTIFICATION_QUEUE_NAME,
  enqueueNotificationJob,
};
