import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

const createContext = (request: any) =>
  ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as any;

describe('JwtAuthGuard', () => {
  it('extracts and verifies the accessToken cookie', async () => {
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1', role: 'CLIENT' }),
    } as unknown as JwtService;
    const guard = new JwtAuthGuard(jwtService);
    const request: any = { cookies: { accessToken: 'token-1' } };

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token-1');
    expect(request.user).toEqual({ sub: 'user-1', role: 'CLIENT' });
  });

  it('rejects requests without an accessToken cookie', async () => {
    const guard = new JwtAuthGuard({ verifyAsync: jest.fn() } as any);

    await expect(guard.canActivate(createContext({ cookies: {} }))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects invalid or expired cookies', async () => {
    const guard = new JwtAuthGuard({
      verifyAsync: jest.fn().mockRejectedValue(new Error('expired')),
    } as any);

    await expect(
      guard.canActivate(createContext({ cookies: { accessToken: 'bad' } })),
    ).rejects.toThrow('Invalid or expired authentication token');
  });
});
