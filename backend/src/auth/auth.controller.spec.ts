import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyToken: jest.fn(),
      verifyEmail: jest.fn(),
      resendVerification: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };
      authService.register.mockResolvedValue({
        userId: '123',
        email: registerDto.email,
        message: 'Registration successful',
      });

      const result = await controller.register(registerDto);
      expect(result.userId).toBe('123');
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should set accessToken cookie and return user profile', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = { id: '123', email: 'test@example.com' };
      authService.login.mockResolvedValue({
        user: mockUser,
        accessToken: 'mock-jwt-token',
      });

      const mockRes: any = {
        cookie: jest.fn(),
      };

      const result = await controller.login(loginDto, mockRes);
      expect(result).toEqual({ user: mockUser });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'accessToken',
        'mock-jwt-token',
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  describe('logout', () => {
    it('should clear accessToken cookie and return success message', async () => {
      const mockRes: any = {
        clearCookie: jest.fn(),
      };

      const result = await controller.logout(mockRes);
      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'accessToken',
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });
});
