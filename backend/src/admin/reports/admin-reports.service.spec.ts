import { Test, TestingModule } from '@nestjs/testing';
import { AdminReportsService } from './admin-reports.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock, MockPrismaService } from '../../../test/helpers/prisma-mock.helper';

describe('AdminReportsService', () => {
  let service: AdminReportsService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminReportsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AdminReportsService>(AdminReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAnalytics', () => {
    it('should calculate summary, revenue trend, and categories properly', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([
        { amount: 50.0, createdAt: new Date() },
        { amount: 150.0, createdAt: new Date() },
      ]);
      prismaMock.user.count.mockResolvedValue(10);
      prismaMock.ticket.count.mockResolvedValue(40);
      prismaMock.raffle.count.mockResolvedValue(3);
      prismaMock.raffle.findMany.mockResolvedValue([
        {
          title: 'Sniper Rifle Set',
          category: 'Snipers',
          ticketsSold: 100,
          totalTickets: 200,
          pricePerTicket: 5.0,
          host: { businessName: 'Tactical UK' },
        },
      ]);
      prismaMock.user.findMany.mockResolvedValue([
        { location: 'London, England', address: null, createdAt: new Date() },
      ]);
      prismaMock.hostProfile.findMany.mockResolvedValue([
        {
          businessName: 'Tactical UK',
          raffles: [
            {
              ticketsSold: 100,
              totalTickets: 200,
              pricePerTicket: 5.0,
              status: 'ACTIVE',
            },
          ],
        },
      ]);
      prismaMock.category.findMany.mockResolvedValue([
        { id: '1', name: 'Snipers' },
      ]);

      const analytics = await service.getAnalytics('3M');
      expect(analytics.period).toBe('3M');
      expect(analytics.summary.totalRevenue).toBe(200.0);
      expect(analytics.summary.newUsers).toBe(10);
      expect(analytics.summary.ticketsSold).toBe(40);
      expect(analytics.summary.activeCompetitions).toBe(3);
      expect(analytics.revenueTrend).toBeDefined();
      expect(analytics.popularCompetitions[0].name).toBe('Sniper Rifle Set');
      expect(analytics.hostPerformance[0].name).toBe('Tactical UK');
      expect(analytics.hostPerformance[0].percent).toBe(50);
    });
  });

  describe('generateCsvReport', () => {
    it('should generate CSV formatted string', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([]);
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.ticket.count.mockResolvedValue(0);
      prismaMock.raffle.count.mockResolvedValue(0);
      prismaMock.raffle.findMany.mockResolvedValue([]);
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.hostProfile.findMany.mockResolvedValue([]);
      prismaMock.category.findMany.mockResolvedValue([]);

      const csv = await service.generateCsvReport('7D');
      expect(csv).toContain('CHARITY DRAWS - ANALYTICS & PERFORMANCE REPORT');
      expect(csv).toContain('KEY PERFORMANCE METRICS');
      expect(csv).toContain('REVENUE TREND');
    });
  });
});
