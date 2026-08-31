import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(null);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'CLIENT' } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should return false if user is missing on request', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(false);
  });

  it('should return false if user role does not match required roles', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'CLIENT' } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(false);
  });

  it('should return true if user role matches required roles', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN', 'HOST']);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'HOST' } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });
});
