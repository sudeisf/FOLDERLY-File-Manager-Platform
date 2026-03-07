const { Queue } = require('bullmq');
const { getRedisConnection } = require('./redisConnection');

const EMAIL_QUEUE_NAME = 'email-jobs';

const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: getRedisConnection(),
});

const enqueuePasswordResetOtpEmail = async ({ email, otpCode }) => {
  await emailQueue.add(
    'password-reset-otp',
    { email, otpCode },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1500,
      },
      removeOnComplete: 100,
      removeOnFail: 100,
    }
  );
};

module.exports = {
  EMAIL_QUEUE_NAME,
  enqueuePasswordResetOtpEmail,
};
