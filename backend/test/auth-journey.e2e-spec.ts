import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-test-app';
import { MockPrismaService } from './helpers/prisma-mock.helper';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

describe('Authentication & User Journey (e2e)', () => {
  let app: INestApplication;
  let prismaMock: MockPrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    prismaMock = context.prismaMock;
    jwtService = new JwtService({ secret: process.env.JWT_SECRET || 'secretKey' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Authentication Lifecycle', () => {
    const mockUser = {
      id: 'e2e-user-uuid-1',
      email: 'alex.e2e@charitydraws.co.uk',
      firstName: 'Alex',
      lastName: 'Morgan',
      passwordHash: '',
      role: 'CLIENT',
      isEmailVerified: false,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeAll(async () => {
      mockUser.passwordHash = await bcrypt.hash('SecurePassword123!', 10);
    });

    it('Step 1: POST /api/v1/auth/register should create a pending unverified user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockUser);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Alex',
          lastName: 'Morgan',
          email: 'alex.e2e@charitydraws.co.uk',
          password: 'SecurePassword123!',
          role: 'CLIENT',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('alex.e2e@charitydraws.co.uk');
    });

    it('Step 2: POST /api/v1/auth/verify-email should verify the JWT verification token and activate account', async () => {
      const verifyToken = jwtService.sign(
        { sub: mockUser.id, type: 'VERIFY_EMAIL' },
        { expiresIn: '24h' },
      );
      const verifiedUser = { ...mockUser, isEmailVerified: true };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(verifiedUser);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({ token: verifyToken })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    let authCookie = '';

    it('Step 3: POST /api/v1/auth/login should authenticate verified user and set accessToken cookie', async () => {
      const verifiedUser = { ...mockUser, isEmailVerified: true, hostProfile: null };
      prismaMock.user.findUnique.mockResolvedValue(verifiedUser);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'alex.e2e@charitydraws.co.uk',
          password: 'SecurePassword123!',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alex.e2e@charitydraws.co.uk');

      // Verify Set-Cookie header contains accessToken
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      const accessTokenCookie = cookies.find((c) => c.startsWith('accessToken='));
      expect(accessTokenCookie).toBeDefined();
      authCookie = accessTokenCookie!.split(';')[0];
    });

    it('Step 4: GET /api/v1/auth/me should return authenticated profile via session cookie', async () => {
      const verifiedUser = {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
        isEmailVerified: true,
        isBlocked: false,
        hostProfile: null,
      };
      prismaMock.user.findUnique.mockResolvedValue(verifiedUser);

      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', authCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alex.e2e@charitydraws.co.uk');
      expect(res.body.data.user.id).toBe(mockUser.id);
    });

    it('Step 5: POST /api/v1/auth/logout should clear session cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', authCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      const clearedCookie = cookies.find((c) => c.startsWith('accessToken=;'));
      expect(clearedCookie).toBeDefined();
    });

    it('Step 6: GET /api/v1/auth/me without cookie should be rejected with 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
