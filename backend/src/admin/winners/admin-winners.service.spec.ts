import { Test, TestingModule } from '@nestjs/testing';
import { AdminWinnersService } from './admin-winners.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock, MockPrismaService } from '../../../test/helpers/prisma-mock.helper';

describe('AdminWinnersService', () => {
  let service: AdminWinnersService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminWinnersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AdminWinnersService>(AdminWinnersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllWinners', () => {
    it('should return paginated list of winners', async () => {
      const mockWinners = [
        {
          id: 'w-1',
          prizeName: 'Scope',
          user: { firstName: 'John', lastName: 'Doe', email: 'john@doe.com' },
          raffle: { title: 'Rifle Draw' },
          ticket: { ticketNumber: 5 },
        },
      ];
      prismaMock.winner.findMany.mockResolvedValue(mockWinners);
      prismaMock.winner.count.mockResolvedValue(1);

      const result = await service.getAllWinners(1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
