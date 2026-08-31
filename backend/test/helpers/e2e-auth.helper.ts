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
