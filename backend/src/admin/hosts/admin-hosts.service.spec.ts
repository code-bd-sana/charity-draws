import { Test, TestingModule } from '@nestjs/testing';
import { AdminHostsService } from './admin-hosts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock, MockPrismaService } from '../../../test/helpers/prisma-mock.helper';

describe('AdminHostsService', () => {
  let service: AdminHostsService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminHostsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AdminHostsService>(AdminHostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHosts', () => {
    it('should return paginated list of hosts', async () => {
      const mockHosts = [
        {
          id: 'host-1',
          businessName: 'Tactical UK',
          isVerified: true,
          user: { email: 'host@uk.com', isBlocked: false },
          subscriptions: [{ plan: { name: 'Pro' } }],
          _count: { raffles: 5 },
          raffles: [{ pricePerTicket: 5, ticketsSold: 20 }],
        },
      ];
      prismaMock.hostProfile.findMany.mockResolvedValue(mockHosts);
      prismaMock.hostProfile.count.mockResolvedValue(1);

      const result = await service.getHosts(1, 10, '', 'All');
      expect(result.hosts).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.hosts[0].businessName).toBe('Tactical UK');
    });
  });
});
