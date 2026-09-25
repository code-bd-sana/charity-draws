import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('PaymentService', () => {
  let service: PaymentService;
  let prismaMock: MockPrismaService;
  let ticketsServiceMock: any;

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    ticketsServiceMock = {
      allocateTicketsInDatabase: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: TicketsService,
          useValue: ticketsServiceMock,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSubscriptionCheckout', () => {
    it('should throw BadRequestException if plan is not found', async () => {
      prismaMock.subscriptionPlan.findUnique.mockResolvedValue(null);

      await expect(
        service.createSubscriptionCheckout('user-1', 'invalid-plan'),
      ).rejects.toThrow(new BadRequestException('Plan not found'));
    });

    it('should directly activate free tier plan if price is 0', async () => {
      prismaMock.subscriptionPlan.findUnique.mockResolvedValue({
        id: 'free',
        name: 'Starter Plan',
        price: 0,
        durationDays: 30,
        maxActiveRaffles: 1,
      });

      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        user: { id: 'user-1', email: 'host@test.com' },
      });

      prismaMock.hostSubscription.create.mockResolvedValue({
        id: 'sub-1',
        status: 'ACTIVE',
      });

      const result = await service.createSubscriptionCheckout('user-1', 'free');
      expect(result.isTest).toBe(true);
      expect(result.message).toContain('Free subscription activated');
    });
  });
});
