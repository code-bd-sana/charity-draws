jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: MockPrismaService;
  let jwtService: JwtService;
  let mailService: { sendVerificationEmail: jest.Mock; sendPasswordResetEmail: jest.Mock };

  beforeEach(() => {
    prisma = createPrismaMock();
    jwtService = new JwtService({ secret: 'test-secret' });
    mailService = {
      sendVerificationEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    };
    service = new AuthService(prisma as any, jwtService, mailService as unknown as MailService);
  });

  it('registers a host, creates host profile, and sends verification email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'host-user-1',
      email: 'host@example.com',
    });

    const result = await service.register({
      email: 'host@example.com',
      password: 'Password123!',
      firstName: 'Host',
      lastName: 'User',
      role: 'HOST',
      businessName: 'Host Ltd',
    } as any);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'host@example.com',
        passwordHash: 'hashed-password',
        role: 'HOST',
      }),
    });
    expect(prisma.hostProfile.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'host-user-1',
        businessName: 'Host Ltd',
      }),
    });
    expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
      'host@example.com',
      expect.any(String),
    );
    expect(result).toMatchObject({
      userId: 'host-user-1',
      email: 'host@example.com',
    });
  });

  it('rejects duplicate registration email addresses', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.register({
        email: 'exists@example.com',
        password: 'Password123!',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects login for unverified host profile', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'host-user-1',
      email: 'host@example.com',
      passwordHash: 'hashed',
      isBlocked: false,
      isEmailVerified: true,
      role: 'HOST',
      hostProfile: { isVerified: false },
    });

    await expect(
      service.login({ email: 'host@example.com', password: 'Password123!' } as any),
    ).rejects.toThrow('pending admin approval');
  });

  it('logs in verified users and returns an access token without password hash', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'client-1',
      email: 'client@example.com',
      passwordHash: 'hashed',
      isBlocked: false,
      isEmailVerified: true,
      role: 'CLIENT',
      hostProfile: null,
    });

    const result = await service.login({
      email: 'client@example.com',
      password: 'Password123!',
    } as any);

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(jwtService.verify(result.accessToken)).toMatchObject({
      sub: 'client-1',
      role: 'CLIENT',
    });
  });

  it('verifies email tokens and updates the user', async () => {
    const token = jwtService.sign({ sub: 'user-1', type: 'VERIFY_EMAIL' });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      isEmailVerified: false,
    });

    await expect(service.verifyEmail({ token })).resolves.toEqual({
      message: 'Email successfully verified',
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isEmailVerified: true },
    });
  });

  it('sends password reset emails with a hash fragment bound token', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'abcdef1234567890',
    });

    await service.forgotPassword({ email: 'user@example.com' });

    const token = mailService.sendPasswordResetEmail.mock.calls[0][1];
    expect(jwtService.verify(token)).toMatchObject({
      sub: 'user-1',
      type: 'RESET_PASSWORD',
      hashFragment: 'abcdef123456789',
    });
  });

  it('resets password only when the token hash fragment still matches', async () => {
    const token = jwtService.sign({
      sub: 'user-1',
      type: 'RESET_PASSWORD',
      hashFragment: 'abcdef123456789',
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      passwordHash: 'abcdef1234567890',
    });

    await expect(
      service.resetPassword({ token, newPassword: 'NewPassword123!' }),
    ).resolves.toEqual({
      message: 'Password has been successfully reset. You can now login.',
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { passwordHash: 'hashed-password' },
    });
  });

  it('rejects blocked users during login and token verification', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'blocked@example.com',
      passwordHash: 'hashed',
      isBlocked: true,
      isEmailVerified: true,
      role: 'CLIENT',
      hostProfile: null,
    });

    await expect(
      service.login({ email: 'blocked@example.com', password: 'Password123!' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      isBlocked: true,
      role: 'CLIENT',
      hostProfile: null,
    });

    await expect(
      service.verifyToken(jwtService.sign({ sub: 'user-1', role: 'CLIENT' })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
