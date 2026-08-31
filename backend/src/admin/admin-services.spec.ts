import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminDashboardService } from './dashboard/admin-dashboard.service';
import { AdminHostsService } from './hosts/admin-hosts.service';
import { AdminOrdersService } from './orders/admin-orders.service';
import { AdminUsersService } from './users/admin-users.service';
import { AdminWinnersService } from './winners/admin-winners.service';
import { AdminWithdrawalsService } from './withdrawals/admin-withdrawals.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('Admin services', () => {
  let prisma: MockPrismaService;

  beforeEach(() => {
    prisma = createPrismaMock();
  });

  it('approves host profiles', async () => {
    const service = new AdminHostsService(prisma as any);
    prisma.hostProfile.findUnique.mockResolvedValue({ id: 'host-1' });
    prisma.hostProfile.update.mockResolvedValue({ id: 'host-1', isVerified: true });

    await expect(service.approveHost('host-1')).resolves.toEqual({
      id: 'host-1',
      isVerified: true,
    });
    expect(prisma.hostProfile.update).toHaveBeenCalledWith({
      where: { id: 'host-1' },
      data: { isVerified: true },
    });
  });

  it('rejects host applications and resets the user role', async () => {
    const service = new AdminHostsService(prisma as any);
    prisma.hostProfile.findUnique.mockResolvedValue({ id: 'host-1', userId: 'user-1' });

    await service.rejectHost('host-1');

    expect(prisma.hostSubscription.deleteMany).toHaveBeenCalledWith({
      where: { hostId: 'host-1' },
    });
    expect(prisma.hostProfile.delete).toHaveBeenCalledWith({ where: { id: 'host-1' } });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { role: 'CLIENT' },
    });
  });

  it('processes completed order refunds and rejects duplicate refunds', async () => {
    const service = new AdminOrdersService(prisma as any);
    prisma.transaction.findUnique.mockResolvedValueOnce({
      id: 'tx-1',
      type: 'TICKET_PURCHASE',
      status: 'COMPLETED',
    });
    prisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'REFUNDED' });

    await expect(service.processRefund('tx-1', 'Customer request')).resolves.toMatchObject({
      message: 'Refund processed successfully',
      transaction: { status: 'REFUNDED' },
    });

    prisma.transaction.findUnique.mockResolvedValueOnce({
      id: 'tx-1',
      type: 'TICKET_PURCHASE',
      status: 'REFUNDED',
    });
    await expect(service.processRefund('tx-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('toggles user account suspension', async () => {
    const service = new AdminUsersService(prisma as any);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', isBlocked: false });
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      isBlocked: true,
    });

    await expect(service.toggleBlockStatus('user-1')).resolves.toEqual({
      id: 'user-1',
      email: 'user@example.com',
      isBlocked: true,
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isBlocked: true },
      select: { id: true, email: true, isBlocked: true },
    });
  });

  it('verifies winners for admin tracking', async () => {
    const service = new AdminWinnersService(prisma as any);
    prisma.winner.findUnique.mockResolvedValue({ id: 'winner-1' });
    prisma.winner.update.mockResolvedValue({
      id: 'winner-1',
      verificationStatus: 'VERIFIED',
    });

    await expect(service.verifyWinner('winner-1')).resolves.toMatchObject({
      verificationStatus: 'VERIFIED',
    });
  });

  it('refunds wallet balances when rejecting pending withdrawals', async () => {
    const service = new AdminWithdrawalsService(prisma as any);
    prisma.withdrawal.findUnique.mockResolvedValue({
      id: 'withdrawal-1',
      hostId: 'host-1',
      amount: 75,
      status: 'PENDING',
      adminNotes: null,
      host: {},
    });
    prisma.withdrawal.update.mockResolvedValue({ id: 'withdrawal-1', status: 'REJECTED' });

    await expect(
      service.updateStatus('withdrawal-1', 'REJECTED', 'Invalid bank details'),
    ).resolves.toEqual({ id: 'withdrawal-1', status: 'REJECTED' });
    expect(prisma.hostProfile.update).toHaveBeenCalledWith({
      where: { id: 'host-1' },
      data: { walletBalance: { increment: 75 } },
    });
  });

  it('returns dashboard overview stats and audit log data', async () => {
    const service = new AdminDashboardService(prisma as any);
    prisma.user.count.mockResolvedValue(10);
    prisma.hostProfile.count.mockResolvedValue(2);
    prisma.raffle.count.mockResolvedValueOnce(4).mockResolvedValueOnce(1);
    prisma.transaction.aggregate.mockResolvedValue({ _sum: { amount: 125 } });
    prisma.raffle.findMany
      .mockResolvedValueOnce([
        {
          id: 'raffle-1',
          title: 'Pending Draw',
          host: { businessName: 'Host Ltd' },
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'raffle-2',
          title: 'Active Draw',
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          host: { businessName: 'Host Ltd' },
        },
      ])
      .mockResolvedValue([
        {
          id: 'raffle-2',
          title: 'Active Draw',
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          host: { businessName: 'Host Ltd' },
        },
      ]);
    prisma.hostProfile.findMany.mockResolvedValue([
      { id: 'host-1', businessName: 'Host Ltd', createdAt: new Date(), user: { email: 'host@example.com' } },
    ]);
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        email: 'user@example.com',
        role: 'CLIENT',
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    prisma.withdrawal.findMany.mockResolvedValue([]);
    prisma.transaction.findMany.mockResolvedValue([]);

    await expect(service.getOverviewStats()).resolves.toMatchObject({
      stats: {
        totalUsers: 10,
        activeHosts: 2,
        liveRaffles: 4,
        totalRevenue: 125,
      },
      awaitingReview: { count: 1 },
    });

    await expect(service.getSystemLogs({ filter: 'User Actions' })).resolves.toMatchObject({
      logs: expect.any(Array),
      meta: expect.objectContaining({ total: expect.any(Number) }),
    });
  });

  it('throws not found for missing admin entities', async () => {
    const hosts = new AdminHostsService(prisma as any);
    const winners = new AdminWinnersService(prisma as any);
    prisma.hostProfile.findUnique.mockResolvedValueOnce(null);
    prisma.winner.findUnique.mockResolvedValueOnce(null);

    await expect(hosts.approveHost('missing')).rejects.toBeInstanceOf(NotFoundException);
    await expect(winners.verifyWinner('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
