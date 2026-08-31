import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { RafflesController } from '../src/raffles/raffles.controller';
import { RafflesService } from '../src/raffles/raffles.service';
import { AuthService } from '../src/auth/auth.service';
import { createAuthCookie, createJwtService } from './helpers/auth-fixture.helper';
import { createTestApp } from './helpers/test-app.helper';

describe('Authentication & authorization (e2e)', () => {
  let app: any;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    verifyToken: jest.Mock;
    verifyEmail: jest.Mock;
    resendVerification: jest.Mock;
    forgotPassword: jest.Mock;
    resetPassword: jest.Mock;
  };
  let rafflesService: { findHostRaffles: jest.Mock };
  let jwtService: JwtService;

  beforeEach(async () => {
    jwtService = createJwtService();
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyToken: jest.fn(),
      verifyEmail: jest.fn(),
      resendVerification: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };
    rafflesService = {
      findHostRaffles: jest.fn().mockResolvedValue({ data: [] }),
    };
    app = await createTestApp({
      controllers: [AuthController, RafflesController],
      providers: [
        JwtAuthGuard,
        RolesGuard,
        Reflector,
        { provide: JwtService, useValue: jwtService },
        { provide: AuthService, useValue: authService },
        { provide: RafflesService, useValue: rafflesService },
      ],
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers, logs in, and issues JWT accessToken cookies', async () => {
    authService.register.mockResolvedValue({
      userId: 'user-1',
      email: 'client@example.com',
      message: 'Registration successful. Please check your email to verify your account.',
    });
    authService.login.mockResolvedValue({
      user: { id: 'user-1', email: 'client@example.com', role: 'CLIENT' },
      accessToken: jwtService.sign({
        sub: 'user-1',
        email: 'client@example.com',
        role: 'CLIENT',
      }),
    });

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'client@example.com',
        password: 'Password123!',
        firstName: 'Client',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe('client@example.com');
      });

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'client@example.com', password: 'Password123!' })
      .expect(200)
      .expect('set-cookie', /accessToken=/)
      .expect((res) => {
        expect(res.body.data.user).toMatchObject({ role: 'CLIENT' });
      });
  });

  it('rejects protected routes without an accessToken cookie', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/raffles/host/my-raffles')
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toBe('Authentication token is missing');
      });
  });

  it('rejects authenticated clients from host-only routes', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/raffles/host/my-raffles')
      .set('Cookie', createAuthCookie('CLIENT', { sub: 'client-1' }, jwtService))
      .expect(403);
  });

  it('allows host cookies through host-only routes', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/raffles/host/my-raffles')
      .set('Cookie', createAuthCookie('HOST', { sub: 'host-user-1' }, jwtService))
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toEqual([]);
      });
  });

  it('surfaces unverified host login rejection', async () => {
    authService.login.mockRejectedValue(
      new UnauthorizedException('Your host account is pending admin approval.'),
    );

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'host@example.com', password: 'Password123!' })
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toBe('Your host account is pending admin approval.');
      });
  });
});
