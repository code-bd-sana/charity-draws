import { Test, TestingModule } from '@nestjs/testing';
import { HostsController } from './hosts.controller';
import { HostsService } from './hosts.service';
import { JwtService } from '@nestjs/jwt';

describe('HostsController', () => {
  let controller: HostsController;
  let hostsService: any;
  let jwtService: any;

  beforeEach(async () => {
    hostsService = {
      findAllVerifiedPublic: jest.fn(),
      findOnePublic: jest.fn(),
      getHostDashboardOverview: jest.fn(),
      getHostSalesAnalytics: jest.fn(),
      getHostPerformanceAnalytics: jest.fn(),
      getHostWalletStats: jest.fn(),
      getWithdrawalHistory: jest.fn(),
      requestWithdrawal: jest.fn(),
    };

    jwtService = {
      verify: jest.fn(),
      verifyAsync: jest.fn(),
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HostsController],
      providers: [
        {
          provide: HostsService,
          useValue: hostsService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    controller = module.get<HostsController>(HostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllVerifiedPublic', () => {
    it('should call hostsService.findAllVerifiedPublic', async () => {
      const mockResult = [{ id: 'host-1', name: 'Tactical Host' }];
      hostsService.findAllVerifiedPublic.mockResolvedValue(mockResult);

      const result = await controller.findAllVerifiedPublic();
      expect(result).toEqual(mockResult);
      expect(hostsService.findAllVerifiedPublic).toHaveBeenCalledTimes(1);
    });
  });
});
