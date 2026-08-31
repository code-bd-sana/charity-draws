import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as any;
    guard = new JwtAuthGuard(jwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when no token is present in cookie', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: {},
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      new UnauthorizedException('Authentication token is missing'),
    );
  });

  it('should throw UnauthorizedException when token verification fails', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: { accessToken: 'invalid-token' },
        }),
      }),
    } as unknown as ExecutionContext;

    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired authentication token'),
    );
  });

  it('should attach user payload to request and return true on valid token', async () => {
    const mockRequest: any = {
      cookies: { accessToken: 'valid-token' },
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const payload = { sub: 'user-123', email: 'test@example.com', role: 'CLIENT' };
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(payload);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.user).toEqual(payload);
  });
});
