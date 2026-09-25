import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-test-app';
import { createTestAuthSession } from './helpers/e2e-auth.helper';

describe('Raffle Lifecycle & Tickets (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/raffles', () => {
    it('should return 200 with list of active public competitions', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/raffles')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data) || Array.isArray(res.body.data.raffles) || Array.isArray(res.body.data.data)).toBe(true);
    });
  });

  describe('POST /api/v1/tickets/purchase/:raffleId', () => {
    it('should reject ticket purchase when unauthenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tickets/purchase/nonexistent-id')
        .send({ quantity: 2 })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject ticket purchase when quantity is zero or missing', async () => {
      const session = createTestAuthSession({
        id: 'client-1',
        email: 'client@example.com',
        role: 'CLIENT',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/tickets/purchase/nonexistent-id')
        .set('Cookie', session.cookie)
        .send({ quantity: 0 })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
