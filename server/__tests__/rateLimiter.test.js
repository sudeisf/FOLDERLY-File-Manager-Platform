const express = require('express');
const request = require('supertest');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');

const buildApp = (limiter) => {
  const app = express();
  app.set('trust proxy', 1);
  app.use(limiter);
  app.get('/ping', (_req, res) => {
    res.status(200).json({ ok: true });
  });
  return app;
};

describe('rateLimiter middleware', () => {
  test('authLimiter allows first 10 requests and blocks the 11th', async () => {
    const app = buildApp(authLimiter);

    for (let i = 0; i < 10; i += 1) {
      const response = await request(app)
        .get('/ping')
        .set('X-Forwarded-For', '10.10.10.1');
      expect(response.status).toBe(200);
    }

    const blocked = await request(app)
      .get('/ping')
      .set('X-Forwarded-For', '10.10.10.1');

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    });
  });

  test('apiLimiter adds standard rate-limit headers', async () => {
    const app = buildApp(apiLimiter);

    const response = await request(app)
      .get('/ping')
      .set('X-Forwarded-For', '10.10.10.2');

    expect(response.status).toBe(200);
    expect(response.headers['ratelimit-policy']).toBeDefined();
    expect(response.headers['ratelimit-limit']).toBeDefined();
    expect(response.headers['ratelimit-remaining']).toBeDefined();
  });
});
