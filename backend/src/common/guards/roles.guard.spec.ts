import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

const createContext = (user?: any) =>
  ({
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as any;

describe('RolesGuard', () => {
  it('allows requests when no roles are required', () => {
    const guard = new RolesGuard({
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('allows users with a required role', () => {
    const guard = new RolesGuard({
      getAllAndOverride: jest.fn().mockReturnValue(['HOST']),
    } as unknown as Reflector);

    expect(guard.canActivate(createContext({ role: 'HOST' }))).toBe(true);
  });

  it('rejects authenticated users with insufficient roles', () => {
    const guard = new RolesGuard({
      getAllAndOverride: jest.fn().mockReturnValue(['ADMIN']),
    } as unknown as Reflector);

    expect(guard.canActivate(createContext({ role: 'CLIENT' }))).toBe(false);
  });
});
