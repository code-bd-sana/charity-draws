import { JwtService } from '@nestjs/jwt';
import { createAuthCookie } from '../../test/helpers/auth-fixture.helper';
import { createPrismaMock } from '../../test/helpers/prisma-mock.helper';

describe('test helpers', () => {
  it('creates an isolated Prisma mock with transaction support', async () => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

    await expect(
      prisma.$transaction((tx) => tx.user.findUnique({ where: { id: 'user-1' } })),
    ).resolves.toEqual({ id: 'user-1' });
  });

  it('creates signed auth cookies for e2e requests', () => {
    const jwtService = new JwtService({ secret: 'test-secret' });
    const [cookie] = createAuthCookie(
      'ADMIN',
      { sub: 'admin-1', email: 'admin@example.com' },
      jwtService,
    );
    const token = cookie.replace('accessToken=', '');

    expect(cookie).toContain('accessToken=');
    expect(jwtService.verify(token)).toMatchObject({
      sub: 'admin-1',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
  });
});
