import { JwtService } from '@nestjs/jwt';

export interface TestUserSession {
  id: string;
  email: string;
  role: 'ADMIN' | 'HOST' | 'CLIENT';
  cookie: string;
  token: string;
}

export const createTestAuthSession = (
  user: { id: string; email: string; role: 'ADMIN' | 'HOST' | 'CLIENT' },
  jwtSecret = process.env.JWT_SECRET || 'secretKey',
): TestUserSession => {
  const jwtService = new JwtService({ secret: jwtSecret });
  const token = jwtService.sign(
    { sub: user.id, email: user.email, role: user.role },
    { expiresIn: '7d' },
  );

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    token,
    cookie: `accessToken=${token}`,
  };
};

export const createAdminSession = (
  id = 'admin-e2e-1',
  email = 'admin@charitydraws.co.uk',
) => createTestAuthSession({ id, email, role: 'ADMIN' });

export const createHostSession = (
  id = 'host-e2e-1',
  email = 'host@charitydraws.co.uk',
) => createTestAuthSession({ id, email, role: 'HOST' });

export const createClientSession = (
  id = 'client-e2e-1',
  email = 'client@charitydraws.co.uk',
) => createTestAuthSession({ id, email, role: 'CLIENT' });

