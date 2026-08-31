import { Test, TestingModule } from '@nestjs/testing';
import { HostsService } from './hosts.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  createPrismaMock,
  MockPrismaService,
} from '../../test/helpers/prisma-mock.helper';

describe('HostsService', () => {
  let service: HostsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HostsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<HostsService>(HostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calculates wallet balances, pending withdrawals, lifetime earnings, and 10% fees', async () => {
    prisma.hostProfile.findUnique.mockResolvedValue({
      id: 'host-1',
      walletBalance: 250,
    });
    prisma.withdrawal.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 40 } })
      .mockResolvedValueOnce({ _sum: { amount: 100 } });
    prisma.raffle.findMany.mockResolvedValue([
      { pricePerTicket: 5, ticketsSold: 10 },
      { pricePerTicket: 2.5, ticketsSold: 4 },
    ]);

    await expect(service.getWalletStats('user-1')).resolves.toEqual({
      availableBalance: 250,
      pendingClearance: 40,
      totalLifetimeEarnings: 60,
      totalFeesPaid: 10,
      commissionRate: 10,
    });
  });

  it('rejects withdrawals above wallet balance', async () => {
    prisma.hostProfile.findUnique.mockResolvedValue({
      id: 'host-1',
      walletBalance: 20,
    });

    await expect(
      service.requestWithdrawal('user-1', {
        amount: 25,
        payoutMethod: 'BANK_TRANSFER',
        payoutDetails: {},
      }),
    ).rejects.toThrow('Insufficient wallet balance');
  });

  it('deducts gross withdrawal amount and records 10% platform fee', async () => {
    prisma.hostProfile.findUnique.mockResolvedValue({
      id: 'host-1',
      walletBalance: 100,
    });
    prisma.withdrawal.create.mockResolvedValue({
      id: 'withdrawal-1',
      amount: 50,
      feeAmount: 5,
      netAmount: 45,
      payoutMethod: 'BANK_TRANSFER',
      status: 'PENDING',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const result = await service.requestWithdrawal('user-1', {
      amount: 50,
      payoutMethod: 'BANK_TRANSFER',
      payoutDetails: { sortCode: '00-00-00' },
    });

    expect(prisma.hostProfile.update).toHaveBeenCalledWith({
      where: { id: 'host-1' },
      data: { walletBalance: { decrement: 50 } },
    });
    expect(prisma.withdrawal.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: 50,
        feeAmount: 5,
        netAmount: 45,
      }),
    });
    expect(result.withdrawal).toMatchObject({
      grossAmount: 50,
      feeAmount: 5,
      netAmount: 45,
    });
  });

  it('calculates sales analytics including gross revenue, 10% fees, and net earnings', async () => {
    const endDate = new Date('2026-02-01T00:00:00.000Z');
    prisma.hostProfile.findUnique.mockResolvedValue({ id: 'host-1' });
    prisma.transaction.aggregate.mockResolvedValue({
      _sum: { amount: 100 },
      _count: { id: 2 },
    });
    prisma.ticket.count.mockResolvedValue(5);
    prisma.transaction.findMany.mockResolvedValue([
      {
        amount: 50,
        createdAt: new Date(),
        tickets: [{ id: 'ticket-1' }, { id: 'ticket-2' }],
      },
    ]);
    prisma.raffle.findMany.mockResolvedValue([
      {
        id: 'raffle-1',
        title: 'Prize Draw',
        ticketsSold: 10,
        totalTickets: 20,
        pricePerTicket: 5,
        endDate,
        status: 'ACTIVE',
      },
    ]);

    const result = await service.getHostSalesAnalytics('host-user-1', '7d');

    expect(result.metrics).toEqual({
      totalRevenue: 100,
      totalTicketsSold: 5,
      completedOrders: 2,
      averageOrderValue: 50,
    });
    expect(result.raffles[0]).toMatchObject({
      raised: 50,
      platformFee: 5,
      platformFeePercent: 10,
      netEarnings: 45,
      status: 'Live',
    });
  });
});
