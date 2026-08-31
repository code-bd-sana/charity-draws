import { BadRequestException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: MockPrismaService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new SubscriptionsService(prisma as any);
  });

  it('lists plans ordered by ascending price', async () => {
    prisma.subscriptionPlan.findMany.mockResolvedValue([{ id: 'free' }]);

    await expect(service.getPlans()).resolves.toEqual([{ id: 'free' }]);
    expect(prisma.subscriptionPlan.findMany).toHaveBeenCalledWith({
      orderBy: { price: 'asc' },
    });
  });

  it('returns current subscription with latest transaction', async () => {
    prisma.hostProfile.findUnique.mockResolvedValue({ id: 'host-1' });
    prisma.hostSubscription.findFirst.mockResolvedValue({ id: 'sub-1', plan: { name: 'Pro' } });
    prisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1' });

    await expect(service.getMySubscription('host-user-1')).resolves.toMatchObject({
      id: 'sub-1',
      transaction: { id: 'tx-1' },
    });
  });

  it('cancels active subscriptions and rejects missing active subscriptions', async () => {
    prisma.hostProfile.findUnique.mockResolvedValue({ id: 'host-1' });
    prisma.hostSubscription.findFirst.mockResolvedValueOnce(null);

    await expect(service.cancelSubscription('host-user-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );

    prisma.hostSubscription.findFirst.mockResolvedValueOnce({ id: 'sub-1' });
    prisma.hostSubscription.update.mockResolvedValue({ id: 'sub-1', status: 'CANCELLED' });

    await expect(service.cancelSubscription('host-user-1')).resolves.toEqual({
      id: 'sub-1',
      status: 'CANCELLED',
    });
  });

  it('calculates subscription MRR and plan distribution', async () => {
    prisma.hostSubscription.findMany.mockResolvedValue([
      { planId: 'pro', plan: { name: 'Pro', price: 29 } },
      { planId: 'pro', plan: { name: 'Pro', price: 29 } },
      { planId: 'free', plan: { name: 'Free', price: 0 } },
    ]);

    await expect(service.getAdminStats()).resolves.toEqual({
      mrr: 58,
      totalActive: 3,
      planDistribution: [
        { name: 'Pro', value: 2, percentage: '67%' },
        { name: 'Free', value: 1, percentage: '33%' },
      ],
    });
  });
});
