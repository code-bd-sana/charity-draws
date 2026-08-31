import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-test-app';
import { createTestAuthSession } from './helpers/e2e-auth.helper';

describe('Admin Operations (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/admin/dashboard/stats', () => {
    it('should reject non-admin client from accessing admin dashboard', async () => {
      const clientSession = createTestAuthSession({
        id: 'client-user',
        email: 'client@example.com',
        role: 'CLIENT',
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard/stats')
        .set('Cookie', clientSession.cookie)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should allow ADMIN role to access dashboard stats', async () => {
      const adminSession = createTestAuthSession({
        id: 'admin-user',
        email: 'admin@charitydraws.com',
        role: 'ADMIN',
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard/stats')
        .set('Cookie', adminSession.cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.stats).toBeDefined();
    });
  });

  describe('GET /api/v1/admin/hosts', () => {
    it('should reject unauthenticated request', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/hosts')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should return 200 with hosts list when requested by ADMIN', async () => {
      const adminSession = createTestAuthSession({
        id: 'admin-user',
        email: 'admin@charitydraws.com',
        role: 'ADMIN',
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/hosts')
        .set('Cookie', adminSession.cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.hosts).toBeDefined();
    });
  });
});
