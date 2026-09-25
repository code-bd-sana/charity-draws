import { Test, TestingModule } from '@nestjs/testing';
import { AdminWithdrawalsService } from './admin-withdrawals.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock, MockPrismaService } from '../../../test/helpers/prisma-mock.helper';

describe('AdminWithdrawalsService', () => {
  let service: AdminWithdrawalsService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminWithdrawalsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AdminWithdrawalsService>(AdminWithdrawalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return formatted list of withdrawals', async () => {
      const mockWithdrawals = [
        {
          id: 'w-1',
          hostId: 'host-1',
          amount: 200,
          feeAmount: 20,
          netAmount: 180,
          status: 'PENDING',
          payoutMethod: 'BANK_TRANSFER',
          payoutDetails: JSON.stringify({ sortCode: '12-34-56' }),
          createdAt: new Date(),
          host: {
            businessName: 'Tactical Host',
            user: { firstName: 'Host', lastName: 'User', email: 'host@test.com', avatarUrl: null },
          },
        },
      ];
      prismaMock.withdrawal.findMany.mockResolvedValue(mockWithdrawals);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].hostBusinessName).toBe('Tactical Host');
      expect(result[0].netAmount).toBe(180);
    });
  });
});
