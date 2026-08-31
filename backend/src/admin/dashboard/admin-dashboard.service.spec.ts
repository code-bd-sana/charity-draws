import { Test, TestingModule } from '@nestjs/testing';
import { AdminDashboardService } from './admin-dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock, MockPrismaService } from '../../../test/helpers/prisma-mock.helper';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AdminDashboardService>(AdminDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOverviewStats', () => {
    it('should aggregate global users, hosts, raffles, and platform revenue', async () => {
      prismaMock.user.count.mockResolvedValue(150);
      prismaMock.hostProfile.count.mockResolvedValue(12);
      prismaMock.raffle.count
        .mockResolvedValueOnce(5) // live active raffles
        .mockResolvedValueOnce(2); // awaiting review count
      prismaMock.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 25000.0 },
      });

      // findMany mocks for awaitingReviewList and recent feeds
      prismaMock.raffle.findMany
        .mockResolvedValueOnce([]) // awaitingReviewList
        .mockResolvedValueOnce([]); // recentRaffles
      prismaMock.hostProfile.findMany.mockResolvedValue([]);
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.withdrawal.findMany.mockResolvedValue([]);
      prismaMock.transaction.findMany.mockResolvedValue([]);

      const res = await service.getOverviewStats();
      expect(res.stats.totalUsers).toBe(150);
      expect(res.stats.activeHosts).toBe(12);
      expect(res.stats.liveRaffles).toBe(5);
      expect(res.stats.totalRevenue).toBe(25000.0);
    });
  });
});
