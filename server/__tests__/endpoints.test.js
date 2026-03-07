process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/file-uploader-test';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

const request = require('supertest');
const app = require('../app');

describe('API endpoints', () => {
  test('GET /healthz returns 200 and status ok', async () => {
    const response = await request(app).get('/healthz');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('GET /api/auth/protected returns 401 when no auth cookie is present', async () => {
    const response = await request(app).get('/api/auth/protected');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized - No cookies found' });
  });

  test('unknown route returns 404', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
  });
});
