const IORedis = require('ioredis');

let redisConnection;

const getRedisConnection = () => {
  if (!redisConnection) {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    redisConnection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });
  }

  return redisConnection;
};

module.exports = {
  getRedisConnection,
};
