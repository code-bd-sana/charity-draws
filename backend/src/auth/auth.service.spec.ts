import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: MockPrismaService;
  let jwtService: any;
  let mailService: any;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-token'),
      verify: jest.fn(),
    };

    mailService = {
      sendVerificationEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: MailService,
          useValue: mailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'existing@example.com' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register a new client user and send verification email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const mockCreatedUser = {
        id: 'new-user-id',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
      };
      prismaMock.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.register({
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.userId).toBe('new-user-id');
      expect(result.email).toBe('john@example.com');
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        'john@example.com',
        'mocked-token',
      );
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('should throw UnauthorizedException if email is not verified', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash,
        isBlocked: false,
        isEmailVerified: false,
        role: 'CLIENT',
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(
        new UnauthorizedException('Please verify your email address before logging in'),
      );
    });

    it('should return user and accessToken on valid login', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        isBlocked: false,
        isEmailVerified: true,
        role: 'CLIENT',
        hostProfile: null,
      };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mocked-token');
      expect(result.user.email).toBe('test@example.com');
      expect((result.user as any).passwordHash).toBeUndefined();
    });
  });
});
