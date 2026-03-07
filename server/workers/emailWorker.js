const { Worker } = require('bullmq');
const { EMAIL_QUEUE_NAME } = require('../queue/emailQueue');
const { getRedisConnection } = require('../queue/redisConnection');
const { sendPasswordResetOtpEmail } = require('../utils/mailer');

let emailWorker;

const initializeEmailWorker = () => {
  if (emailWorker || process.env.NODE_ENV === 'test') {
    return emailWorker;
  }

  emailWorker = new Worker(
    EMAIL_QUEUE_NAME,
    async (job) => {
      if (job.name === 'password-reset-otp') {
        const { email, otpCode } = job.data;
        await sendPasswordResetOtpEmail(email, otpCode);
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
    }
  );

  emailWorker.on('completed', (job) => {
    console.log(`[EmailWorker] Completed job ${job.id} (${job.name})`);
  });

  emailWorker.on('failed', (job, err) => {
    console.error(`[EmailWorker] Failed job ${job?.id || 'unknown'}:`, err?.message || err);
  });

  return emailWorker;
};

module.exports = {
  initializeEmailWorker,
};
