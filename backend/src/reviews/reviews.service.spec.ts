import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  createPrismaMock,
  MockPrismaService,
} from '../../test/helpers/prisma-mock.helper';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prismaMock: MockPrismaService;
  let notificationsServiceMock: {
    create: jest.Mock;
    notifyAdmins: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    notificationsServiceMock = {
      create: jest.fn().mockResolvedValue({}),
      notifyAdmins: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: NotificationsService,
          useValue: notificationsServiceMock,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validDto = {
      winnerId: 'winner-1',
      rating: 5,
      comment: 'Excellent experience and fast prize dispatch!',
    };

    it('should create review and dispatch notification to host', async () => {
      prismaMock.winner.findUnique.mockResolvedValue({
        id: 'winner-1',
        userId: 'user-1',
        raffleId: 'raffle-1',
        prizeName: 'PlayStation 5',
        raffle: {
          id: 'raffle-1',
          title: 'PS5 Giveaway',
          hostId: 'host-1',
          host: {
            id: 'host-1',
            userId: 'host-user-1',
            slug: 'tech-raffles',
          },
        },
      });

      prismaMock.review.findUnique.mockResolvedValue(null);

      const createdReview = {
        id: 'rev-1',
        hostId: 'host-1',
        raffleId: 'raffle-1',
        winnerId: 'winner-1',
        userId: 'user-1',
        rating: 5,
        comment: 'Excellent experience and fast prize dispatch!',
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.review.create.mockResolvedValue(createdReview);

      const result = await service.create('user-1', validDto);

      expect(result).toEqual(createdReview);
      expect(prismaMock.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            hostId: 'host-1',
            winnerId: 'winner-1',
            userId: 'user-1',
            rating: 5,
            status: 'APPROVED',
          }),
        }),
      );
      expect(notificationsServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'host-user-1',
          title: expect.stringContaining('5'),
        }),
      );
    });

    it('should throw NotFoundException if winner record does not exist', async () => {
      prismaMock.winner.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', validDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if authenticated user does not own winner record', async () => {
      prismaMock.winner.findUnique.mockResolvedValue({
        id: 'winner-1',
        userId: 'someone-else',
        raffleId: 'raffle-1',
        raffle: { hostId: 'host-1' },
      });

      await expect(service.create('user-1', validDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if review already exists for this winnerId', async () => {
      prismaMock.winner.findUnique.mockResolvedValue({
        id: 'winner-1',
        userId: 'user-1',
        raffleId: 'raffle-1',
        raffle: { hostId: 'host-1' },
      });

      prismaMock.review.findUnique.mockResolvedValue({
        id: 'existing-rev',
        winnerId: 'winner-1',
      });

      await expect(service.create('user-1', validDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getHostReviews', () => {
    it('should return null averageRating and 0 totalReviews when host has 0 reviews', async () => {
      prismaMock.hostProfile.findFirst.mockResolvedValue({
        id: 'host-1',
        businessName: 'Zero Reviews Host',
        slug: 'zero-reviews',
      });

      prismaMock.review.findMany
        .mockResolvedValueOnce([]) // for stats
        .mockResolvedValueOnce([]); // for paginated list

      prismaMock.review.count.mockResolvedValue(0);

      const result = await service.getHostReviews('host-1', { page: 1, limit: 10 });

      expect(result.stats.averageRating).toBeNull();
      expect(result.stats.totalReviews).toBe(0);
      expect(result.stats.breakdown).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      expect(result.stats.percentages).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      expect(result.reviews).toHaveLength(0);
    });

    it('should compute correct averageRating and distribution for reviews', async () => {
      prismaMock.hostProfile.findFirst.mockResolvedValue({
        id: 'host-1',
        businessName: 'Top Host',
        slug: 'top-host',
      });

      // 4 reviews: ratings 5, 5, 4, 3 => sum 17, avg 4.25 => 4.3 rounded
      prismaMock.review.findMany
        .mockResolvedValueOnce([
          { rating: 5 },
          { rating: 5 },
          { rating: 4 },
          { rating: 3 },
        ])
        .mockResolvedValueOnce([
          {
            id: 'rev-1',
            hostId: 'host-1',
            rating: 5,
            comment: 'Great draw!',
            status: 'APPROVED',
            createdAt: new Date(),
            updatedAt: new Date(),
            user: { firstName: 'Alice', lastName: 'Smith', avatarUrl: null },
            raffle: { title: 'Charity Draw #1', slug: 'draw-1' },
            winner: { prizeName: 'Drone', winType: 'MAIN_DRAW', ticket: { ticketNumber: 42 } },
          },
        ]);

      prismaMock.review.count.mockResolvedValue(4);

      const result = await service.getHostReviews('host-1', { page: 1, limit: 10 });

      expect(result.stats.totalReviews).toBe(4);
      expect(result.stats.averageRating).toBe(4.3);
      expect(result.stats.breakdown).toEqual({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 2 });
      expect(result.stats.percentages[5]).toBe(50);
      expect(result.reviews[0].reviewerName).toBe('Alice Smith');
      expect(result.reviews[0].prizeTitle).toBe('Drone');
      expect(result.reviews[0].ticketNumber).toBe(42);
    });
  });

  describe('update', () => {
    it('should allow review owner to update rating and comment', async () => {
      prismaMock.review.findUnique.mockResolvedValue({
        id: 'rev-1',
        userId: 'user-1',
        rating: 4,
        comment: 'Original comment',
      });

      prismaMock.review.update.mockResolvedValue({
        id: 'rev-1',
        rating: 5,
        comment: 'Updated comment',
      });

      const result = await service.update('rev-1', 'user-1', {
        rating: 5,
        comment: 'Updated comment',
      });

      expect(result.rating).toBe(5);
      expect(result.comment).toBe('Updated comment');
    });

    it('should throw ForbiddenException if another user tries to update', async () => {
      prismaMock.review.findUnique.mockResolvedValue({
        id: 'rev-1',
        userId: 'user-1',
      });

      await expect(
        service.update('rev-1', 'attacker-user', { rating: 1 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('flag', () => {
    it('should flag review and notify administrators', async () => {
      prismaMock.review.findUnique.mockResolvedValue({
        id: 'rev-1',
        status: 'APPROVED',
        raffle: { title: 'Test Raffle' },
        user: { firstName: 'Test' },
      });

      prismaMock.review.update.mockResolvedValue({
        id: 'rev-1',
        status: 'FLAGGED',
      });

      const result = await service.flag('rev-1', 'user-1', {
        reason: 'Inappropriate language',
      });

      expect(result.status).toBe('FLAGGED');
      expect(notificationsServiceMock.notifyAdmins).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SYSTEM',
          message: expect.stringContaining('Inappropriate language'),
        }),
      );
    });
  });

  describe('getHostDashboardReviews', () => {
    it('should return satisfaction rate and host metrics', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-host',
      });

      // 2 reviews: 5 and 4 stars => 100% satisfaction
      prismaMock.review.findMany
        .mockResolvedValueOnce([{ rating: 5 }, { rating: 4 }])
        .mockResolvedValueOnce([
          {
            id: 'rev-1',
            rating: 5,
            comment: 'Super!',
            status: 'APPROVED',
            createdAt: new Date(),
            updatedAt: new Date(),
            user: { firstName: 'John' },
            raffle: { title: 'Raffle 1' },
            winner: { prizeName: 'Car' },
          },
        ]);

      const result = await service.getHostDashboardReviews('user-host');

      expect(result.metrics.totalReviews).toBe(2);
      expect(result.metrics.satisfactionRate).toBe(100);
      expect(result.metrics.averageRating).toBe(4.5);
      expect(result.reviews).toHaveLength(1);
    });
  });
});
