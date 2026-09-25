import { Test, TestingModule } from '@nestjs/testing';
import { AdminOrdersService } from './admin-orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock, MockPrismaService } from '../../../test/helpers/prisma-mock.helper';

describe('AdminOrdersService', () => {
  let service: AdminOrdersService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminOrdersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AdminOrdersService>(AdminOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('should return paginated transactions list', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          gatewayTransactionId: 'GW-1234',
          amount: 25.0,
          status: 'COMPLETED',
          createdAt: new Date(),
          user: { firstName: 'John', lastName: 'Doe', email: 'john@doe.com' },
          tickets: [{ raffle: { title: 'Rifle Draw' } }],
        },
      ];
      prismaMock.transaction.findMany.mockResolvedValue(mockTransactions);
      prismaMock.transaction.count.mockResolvedValue(1);

      const result = await service.getAllOrders(1, 10);
      expect(result.orders).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.orders[0].buyerName).toBe('John Doe');
    });
  });
});
