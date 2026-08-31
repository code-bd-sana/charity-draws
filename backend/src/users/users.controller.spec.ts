import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    getMyWinners: jest.Mock;
    changePassword: jest.Mock;
    updateProfile: jest.Mock;
    updateAvatar: jest.Mock;
  };
  let jwtService: JwtService;

  beforeEach(() => {
    usersService = {
      getMyWinners: jest.fn(),
      changePassword: jest.fn(),
      updateProfile: jest.fn(),
      updateAvatar: jest.fn(),
    };
    jwtService = new JwtService({ secret: 'test-secret' });
    controller = new UsersController(usersService as unknown as UsersService, jwtService);
  });

  it('delegates winner listing for the authenticated user', async () => {
    const accessToken = jwtService.sign({ sub: 'user-1', role: 'CLIENT' });
    usersService.getMyWinners.mockResolvedValue([{ id: 'winner-1' }]);

    await expect(
      controller.getMyWinners({ cookies: { accessToken } } as any),
    ).resolves.toEqual([{ id: 'winner-1' }]);
    expect(usersService.getMyWinners).toHaveBeenCalledWith('user-1');
  });

  it('delegates password changes for the authenticated user', async () => {
    const accessToken = jwtService.sign({ sub: 'user-1', role: 'CLIENT' });
    usersService.changePassword.mockResolvedValue({ message: 'Password updated successfully' });

    await expect(
      controller.changePassword(
        { cookies: { accessToken } } as any,
        { currentPassword: 'old', newPassword: 'new' },
      ),
    ).resolves.toEqual({ message: 'Password updated successfully' });
  });

  it('rejects profile updates without valid cookies', async () => {
    await expect(
      controller.updateProfile({ cookies: {} } as any, { firstName: 'Nope' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('requires an uploaded avatar file', async () => {
    const accessToken = jwtService.sign({ sub: 'user-1', role: 'CLIENT' });

    await expect(
      controller.uploadAvatar({ cookies: { accessToken } } as any, undefined as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
