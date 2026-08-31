import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { HostsController } from './hosts.controller';
import { HostsService } from './hosts.service';

describe('HostsController', () => {
  let controller: HostsController;
  let hostsService: {
    findAllVerifiedPublic: jest.Mock;
    getWalletStats: jest.Mock;
  };
  let jwtService: JwtService;

  beforeEach(async () => {
    hostsService = {
      findAllVerifiedPublic: jest.fn(),
      getWalletStats: jest.fn(),
    };
    jwtService = new JwtService({ secret: 'test-secret' });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HostsController],
      providers: [
        { provide: HostsService, useValue: hostsService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    controller = module.get<HostsController>(HostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates public verified host listing', async () => {
    hostsService.findAllVerifiedPublic.mockResolvedValue([{ id: 'host-1' }]);

    await expect(controller.findAllVerifiedPublic()).resolves.toEqual([
      { id: 'host-1' },
    ]);
  });

  it('extracts user id from accessToken cookie for wallet requests', async () => {
    const accessToken = jwtService.sign({ sub: 'host-user-1', role: 'HOST' });
    hostsService.getWalletStats.mockResolvedValue({ availableBalance: 10 });

    await expect(
      controller.getWalletStats({
        cookies: { accessToken },
      } as any),
    ).resolves.toEqual({ availableBalance: 10 });

    expect(hostsService.getWalletStats).toHaveBeenCalledWith('host-user-1');
  });
});
