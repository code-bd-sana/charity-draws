import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;
  let jwtService: any;

  beforeEach(async () => {
    usersService = {
      changePassword: jest.fn(),
      updateProfile: jest.fn(),
      getMyWinners: jest.fn(),
      getPublicProfile: jest.fn(),
      updateAvatar: jest.fn(),
    };

    jwtService = {
      verify: jest.fn().mockReturnValue({ sub: 'user-123' }),
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-123' }),
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyWinners', () => {
    it('should extract userId and return list of won prizes', async () => {
      const mockReq: any = {
        cookies: { accessToken: 'valid-token' },
      };
      const mockWinners = [{ id: 'w1', prizeName: 'Scope' }];
      usersService.getMyWinners.mockResolvedValue(mockWinners);

      const result = await controller.getMyWinners(mockReq);
      expect(result).toEqual(mockWinners);
      expect(usersService.getMyWinners).toHaveBeenCalledWith('user-123');
    });
  });

  describe('changePassword', () => {
    it('should extract userId and call usersService.changePassword', async () => {
      const mockReq: any = {
        cookies: { accessToken: 'valid-token' },
      };
      const dto = { currentPassword: 'old', newPassword: 'new' };
      usersService.changePassword.mockResolvedValue({ message: 'Success' });

      const result = await controller.changePassword(mockReq, dto);
      expect(result).toEqual({ message: 'Success' });
      expect(usersService.changePassword).toHaveBeenCalledWith('user-123', dto);
    });
  });

  describe('getUserDashboard', () => {
    it('should return user dashboard overview', async () => {
      const mockReq: any = {
        cookies: { accessToken: 'valid-token' },
      };
      const mockOverview = { kpi: { totalTickets: 5 }, activeEntries: [] };
      usersService.getUserDashboardOverview = jest.fn().mockResolvedValue(mockOverview);

      const result = await controller.getUserDashboard(mockReq);
      expect(result).toEqual(mockOverview);
      expect(usersService.getUserDashboardOverview).toHaveBeenCalledWith('user-123');
    });
  });

  describe('getMyTransactions', () => {
    it('should return user transactions', async () => {
      const mockReq: any = {
        cookies: { accessToken: 'valid-token' },
      };
      const mockTx = [{ id: 'tx-1', amount: 20 }];
      usersService.getMyTransactions = jest.fn().mockResolvedValue(mockTx);

      const result = await controller.getMyTransactions(mockReq);
      expect(result).toEqual(mockTx);
      expect(usersService.getMyTransactions).toHaveBeenCalledWith('user-123');
    });
  });
});
