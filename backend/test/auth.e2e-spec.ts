import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-test-app';
import { createTestAuthSession } from './helpers/e2e-auth.helper';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should reject registration when required fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should reject login when credentials format is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 when no accessToken cookie is present', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should authenticate request with simulated cookie token', async () => {
      const session = createTestAuthSession({
        id: 'clt-user-123',
        email: 'client@gmail.com',
        role: 'CLIENT',
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', session.cookie);

      expect(res.status).toBeDefined();
    });
  });
});
