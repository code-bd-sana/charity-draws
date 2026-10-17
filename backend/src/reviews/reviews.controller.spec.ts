import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { JwtService } from '@nestjs/jwt';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let serviceMock: {
    create: jest.Mock;
    getHostReviews: jest.Mock;
    getMyReviews: jest.Mock;
    getHostDashboardReviews: jest.Mock;
    update: jest.Mock;
    flag: jest.Mock;
  };
  let jwtServiceMock: {
    verify: jest.Mock;
    verifyAsync: jest.Mock;
  };

  beforeEach(async () => {
    serviceMock = {
      create: jest.fn(),
      getHostReviews: jest.fn(),
      getMyReviews: jest.fn(),
      getHostDashboardReviews: jest.fn(),
      update: jest.fn(),
      flag: jest.fn(),
    };

    jwtServiceMock = {
      verify: jest.fn().mockReturnValue({ sub: 'user-1', role: 'CLIENT' }),
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1', role: 'CLIENT' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: serviceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createReview', async () => {
    const req: any = {
      cookies: { accessToken: 'valid-token' },
    };
    serviceMock.create.mockResolvedValue({ id: 'rev-1', rating: 5 });

    const result = await controller.createReview(req, {
      winnerId: 'winner-1',
      rating: 5,
      comment: 'Super!',
    });

    expect(result).toEqual({ id: 'rev-1', rating: 5 });
    expect(serviceMock.create).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ winnerId: 'winner-1', rating: 5 }),
    );
  });

  it('should call getHostReviews (public)', async () => {
    serviceMock.getHostReviews.mockResolvedValue({
      reviews: [],
      stats: { averageRating: null, totalReviews: 0 },
    });

    const result = await controller.getHostReviews('host-slug', { page: 1, limit: 10 });
    expect(result.stats.totalReviews).toBe(0);
    expect(serviceMock.getHostReviews).toHaveBeenCalledWith('host-slug', { page: 1, limit: 10 });
  });

  it('should call getMyReviews', async () => {
    const req: any = {
      headers: { authorization: 'Bearer test-token' },
    };
    serviceMock.getMyReviews.mockResolvedValue([]);

    const result = await controller.getMyReviews(req);
    expect(result).toEqual([]);
    expect(serviceMock.getMyReviews).toHaveBeenCalledWith('user-1');
  });

  it('should call updateReview', async () => {
    const req: any = {
      cookies: { accessToken: 'valid-token' },
    };
    serviceMock.update.mockResolvedValue({ id: 'rev-1', rating: 4 });

    const result = await controller.updateReview(req, 'rev-1', { rating: 4 });
    expect(result).toEqual({ id: 'rev-1', rating: 4 });
    expect(serviceMock.update).toHaveBeenCalledWith('rev-1', 'user-1', { rating: 4 });
  });

  it('should call flagReview', async () => {
    const req: any = {
      cookies: { accessToken: 'valid-token' },
    };
    serviceMock.flag.mockResolvedValue({ status: 'FLAGGED' });

    const result = await controller.flagReview(req, 'rev-1', { reason: 'spam' });
    expect(result).toEqual({ status: 'FLAGGED' });
    expect(serviceMock.flag).toHaveBeenCalledWith('rev-1', 'user-1', { reason: 'spam' });
  });
});
