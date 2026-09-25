import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlans', () => {
    it('should return subscription plans ordered by price', async () => {
      const mockPlans = [
        { id: 'plan-1', name: 'Basic', price: 19.99 },
        { id: 'plan-2', name: 'Pro', price: 49.99 },
      ];
      prismaMock.subscriptionPlan.findMany.mockResolvedValue(mockPlans);

      const result = await service.getPlans();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Basic');
    });
  });

  describe('cancelSubscription', () => {
    it('should throw BadRequestException if host has no active subscription', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({ id: 'host-1', userId: 'user-1' });
      prismaMock.hostSubscription.findFirst.mockResolvedValue(null);

      await expect(service.cancelSubscription('user-1')).rejects.toThrow(
        new BadRequestException('No active subscription found to cancel'),
      );
    });

    it('should cancel subscription and update status to CANCELLED', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({ id: 'host-1', userId: 'user-1' });
      prismaMock.hostSubscription.findFirst.mockResolvedValue({ id: 'sub-1', status: 'ACTIVE' });
      prismaMock.hostSubscription.update.mockResolvedValue({ id: 'sub-1', status: 'CANCELLED' });

      const result = await service.cancelSubscription('user-1');
      expect(result.status).toBe('CANCELLED');
    });
  });
});
