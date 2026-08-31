import { BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TicketsService } from '../tickets/tickets.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: MockPrismaService;
  let ticketsService: { allocateTicketsInDatabase: jest.Mock };

  beforeEach(() => {
    prisma = createPrismaMock();
    ticketsService = { allocateTicketsInDatabase: jest.fn() };
    service = new PaymentService(prisma as any, ticketsService as unknown as TicketsService);
  });

  it('activates free subscriptions without external payment', async () => {
    prisma.subscriptionPlan.findUnique.mockResolvedValue({
      id: 'free',
      name: 'Free',
      price: 0,
      durationDays: 30,
    });
    prisma.hostProfile.findUnique.mockResolvedValue({
      id: 'host-1',
      user: { id: 'host-user-1', email: 'host@example.com' },
    });
    prisma.hostSubscription.create.mockResolvedValue({ id: 'sub-1' });

    const result = await service.createSubscriptionCheckout('host-user-1', 'free');

    expect(prisma.hostSubscription.updateMany).toHaveBeenCalledWith({
      where: { hostId: 'host-1', status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    });
    expect(prisma.transaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'host-user-1',
        type: 'SUBSCRIPTION_FEE',
        amount: 0,
        status: 'COMPLETED',
        paymentGateway: 'FREE_TIER',
      }),
    });
    expect(result.message).toBe('Free subscription activated successfully');
  });

  it('rejects checkout for unknown plans', async () => {
    prisma.subscriptionPlan.findUnique.mockResolvedValue(null);

    await expect(
      service.createSubscriptionCheckout('host-user-1', 'missing-plan'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('processes ticket purchase webhooks by allocating tickets', async () => {
    prisma.raffle.findFirst.mockResolvedValue({ id: 'raffle-abc' });
    prisma.user.findFirst.mockResolvedValue({ id: 'user-def' });
    ticketsService.allocateTicketsInDatabase.mockResolvedValue({ tickets: [] });

    await expect(
      service.handleWebhook('', {
        orderNumber: 'TCK_raffle_user_2_123',
        paymentStatus: 'PAID',
      }),
    ).resolves.toMatchObject({ success: true });

    expect(ticketsService.allocateTicketsInDatabase).toHaveBeenCalledWith(
      'user-def',
      'raffle-abc',
      2,
    );
  });
});
