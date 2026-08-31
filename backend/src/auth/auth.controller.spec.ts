import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    verifyToken: jest.Mock;
    verifyEmail: jest.Mock;
    forgotPassword: jest.Mock;
    resetPassword: jest.Mock;
    resendVerification: jest.Mock;
  };
  let response: { cookie: jest.Mock; clearCookie: jest.Mock };

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyToken: jest.fn(),
      verifyEmail: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      resendVerification: jest.fn(),
    };
    response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  it('sets an httpOnly accessToken cookie on login', async () => {
    authService.login.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' },
      accessToken: 'token-1',
    });

    await expect(
      controller.login({ email: 'user@example.com', password: 'Password123!' }, response as any),
    ).resolves.toEqual({ user: { id: 'user-1', email: 'user@example.com' } });

    expect(response.cookie).toHaveBeenCalledWith(
      'accessToken',
      'token-1',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
  });

  it('rejects /me without an accessToken cookie', async () => {
    await expect(controller.getMe({ cookies: {} } as any)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('delegates verification and password reset workflows', async () => {
    authService.verifyEmail.mockResolvedValue({ message: 'Email successfully verified' });
    authService.forgotPassword.mockResolvedValue({ message: 'sent' });
    authService.resetPassword.mockResolvedValue({ message: 'reset' });

    await expect(controller.verifyEmail({ token: 'verify-token' })).resolves.toEqual({
      message: 'Email successfully verified',
    });
    await expect(controller.forgotPassword({ email: 'user@example.com' })).resolves.toEqual({
      message: 'sent',
    });
    await expect(
      controller.resetPassword({ token: 'reset-token', newPassword: 'NewPassword123!' }),
    ).resolves.toEqual({ message: 'reset' });
  });
});
