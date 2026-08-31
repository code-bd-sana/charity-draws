import { JwtService } from '@nestjs/jwt';
import { config } from '../../src/config';

export type TestRole = 'CLIENT' | 'USER' | 'HOST' | 'ADMIN';

export type TestJwtPayload = {
  sub: string;
  email: string;
  role: TestRole;
};

export const createJwtService = () =>
  new JwtService({
    secret: config.security.jwtSecret,
    signOptions: { expiresIn: '7d' },
  });

export const createAuthToken = (
  payload: Partial<TestJwtPayload> = {},
  jwtService = createJwtService(),
) =>
  jwtService.sign({
    sub: payload.sub || 'user-1',
    email: payload.email || 'user@example.com',
    role: payload.role || 'CLIENT',
  });

export const createAuthCookie = (
  role: TestRole = 'CLIENT',
  payload: Partial<TestJwtPayload> = {},
  jwtService = createJwtService(),
) => [`accessToken=${createAuthToken({ ...payload, role }, jwtService)}`];

export const authCookies = {
  client: (payload?: Partial<TestJwtPayload>) =>
    createAuthCookie('CLIENT', payload),
  host: (payload?: Partial<TestJwtPayload>) => createAuthCookie('HOST', payload),
  admin: (payload?: Partial<TestJwtPayload>) =>
    createAuthCookie('ADMIN', payload),
};
