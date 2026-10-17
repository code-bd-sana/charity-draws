import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FlagReviewDto } from './dto/flag-review.dto';
import { QueryHostReviewsDto } from './dto/query-reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

  /**
   * 1. Submit a verified winner review (Protected)
   * Only users who own the winning record can review.
   * Exactly 1 review per winning record.
   */
  async create(userId: string, dto: CreateReviewDto) {
    const winner = await this.prisma.winner.findUnique({
      where: { id: dto.winnerId },
      include: {
        raffle: {
          include: {
            host: true,
          },
        },
      },
    });

    if (!winner) {
      throw new NotFoundException('Winning prize record not found.');
    }

    if (winner.userId !== userId) {
      throw new ForbiddenException(
        'You can only submit reviews for prizes that you have won.',
      );
    }

    // Check duplicate review
    const existingReview = await this.prisma.review.findUnique({
      where: { winnerId: dto.winnerId },
    });

    if (existingReview) {
      throw new BadRequestException(
        'A verified review has already been submitted for this prize.',
      );
    }

    const hostId = winner.raffle?.hostId;
    if (!hostId) {
      throw new BadRequestException(
        'Competition host profile could not be identified.',
      );
    }

    const review = await this.prisma.review.create({
      data: {
        hostId,
        raffleId: winner.raffleId,
        winnerId: dto.winnerId,
        userId,
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        status: 'APPROVED',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        raffle: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        winner: {
          select: {
            id: true,
            prizeName: true,
          },
        },
      },
    });

    // Notify host/seller about the new review
    if (this.notificationsService && winner.raffle?.host?.userId) {
      try {
        await this.notificationsService.create({
          userId: winner.raffle.host.userId,
          title: `New Verified Review Received (★${dto.rating})`,
          message: `A winner left a ${dto.rating}-star review for "${winner.prizeName || winner.raffle.title}".`,
          type: 'INFO',
          link: `/hosts/${winner.raffle.host.slug || winner.raffle.hostId}`,
        });
      } catch (err) {
        // Notification failure should not abort review creation
        console.error('Failed to dispatch notification to host:', err);
      }
    }

    return review;
  }

  /**
   * 2. Get public reviews and aggregated stats for a host (Public)
   */
  async getHostReviews(hostIdOrSlug: string, query: QueryHostReviewsDto) {
    const host = await this.prisma.hostProfile.findFirst({
      where: {
        OR: [{ id: hostIdOrSlug }, { slug: hostIdOrSlug }],
      },
    });

    if (!host) {
      throw new NotFoundException('Host profile not found.');
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    // Fetch all APPROVED reviews for this host to compute accurate global stats
    const allApprovedReviews = await this.prisma.review.findMany({
      where: {
        hostId: host.id,
        status: 'APPROVED',
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = allApprovedReviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              allApprovedReviews.reduce((sum, r) => sum + r.rating, 0) /
              totalReviews
            ).toFixed(1),
          )
        : null;

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of allApprovedReviews) {
      if (r.rating >= 1 && r.rating <= 5) {
        breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
      }
    }

    const percentages: Record<number, number> = {
      1: totalReviews > 0 ? Number(((breakdown[1] / totalReviews) * 100).toFixed(1)) : 0,
      2: totalReviews > 0 ? Number(((breakdown[2] / totalReviews) * 100).toFixed(1)) : 0,
      3: totalReviews > 0 ? Number(((breakdown[3] / totalReviews) * 100).toFixed(1)) : 0,
      4: totalReviews > 0 ? Number(((breakdown[4] / totalReviews) * 100).toFixed(1)) : 0,
      5: totalReviews > 0 ? Number(((breakdown[5] / totalReviews) * 100).toFixed(1)) : 0,
    };

    // Filtered reviews query
    const whereClause: any = {
      hostId: host.id,
      status: 'APPROVED',
    };

    if (query.rating && query.rating >= 1 && query.rating <= 5) {
      whereClause.rating = Number(query.rating);
    }

    const [reviews, totalFiltered] = await Promise.all([
      this.prisma.review.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          raffle: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          winner: {
            select: {
              id: true,
              prizeName: true,
              winType: true,
              ticket: {
                select: {
                  ticketNumber: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.review.count({ where: whereClause }),
    ]);

    const formattedReviews = reviews.map((r) => {
      const reviewerName =
        `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim() ||
        'Verified Winner';

      return {
        id: r.id,
        hostId: r.hostId,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        reviewerName,
        reviewerAvatar: r.user?.avatarUrl || null,
        prizeTitle: r.winner?.prizeName || r.raffle?.title || 'Won Competition Prize',
        competitionTitle: r.raffle?.title || 'Competition',
        raffleSlug: r.raffle?.slug || null,
        winType: r.winner?.winType || 'WINNER',
        ticketNumber: r.winner?.ticket?.ticketNumber || null,
        canBeFlagged: r.status === 'APPROVED',
      };
    });

    return {
      host: {
        id: host.id,
        name: host.businessName,
        slug: host.slug || host.id,
      },
      stats: {
        averageRating,
        totalReviews,
        breakdown,
        percentages,
      },
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit) || 1,
      },
    };
  }

  /**
   * 3. Get all reviews submitted by the authenticated user (Protected)
   */
  async getMyReviews(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        host: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            user: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        raffle: {
          select: {
            id: true,
            title: true,
            slug: true,
            mainImage: true,
          },
        },
        winner: {
          select: {
            id: true,
            prizeName: true,
            winType: true,
          },
        },
      },
    });

    return reviews.map((r) => ({
      id: r.id,
      winnerId: r.winnerId,
      hostId: r.hostId,
      hostName: r.host.businessName,
      hostSlug: r.host.slug || r.host.id,
      hostLogo: r.host.user?.avatarUrl || null,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      prizeName: r.winner?.prizeName || r.raffle.title,
      raffleTitle: r.raffle.title,
      raffleSlug: r.raffle.slug,
      raffleImage: r.raffle.mainImage,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  /**
   * 4. Host Dashboard Reviews & Metrics (Protected - Host only)
   */
  async getHostDashboardReviews(userId: string) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { userId },
    });

    if (!hostProfile) {
      throw new NotFoundException('Host profile not found for this user account.');
    }

    const allApprovedReviews = await this.prisma.review.findMany({
      where: {
        hostId: hostProfile.id,
        status: 'APPROVED',
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = allApprovedReviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              allApprovedReviews.reduce((sum, r) => sum + r.rating, 0) /
              totalReviews
            ).toFixed(1),
          )
        : null;

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of allApprovedReviews) {
      if (r.rating >= 1 && r.rating <= 5) {
        breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
      }
    }

    const percentages: Record<number, number> = {
      1: totalReviews > 0 ? Number(((breakdown[1] / totalReviews) * 100).toFixed(1)) : 0,
      2: totalReviews > 0 ? Number(((breakdown[2] / totalReviews) * 100).toFixed(1)) : 0,
      3: totalReviews > 0 ? Number(((breakdown[3] / totalReviews) * 100).toFixed(1)) : 0,
      4: totalReviews > 0 ? Number(((breakdown[4] / totalReviews) * 100).toFixed(1)) : 0,
      5: totalReviews > 0 ? Number(((breakdown[5] / totalReviews) * 100).toFixed(1)) : 0,
    };

    // Satisfaction rate: % of reviews rated 4 or 5 stars
    const positiveReviews = (breakdown[4] || 0) + (breakdown[5] || 0);
    const satisfactionRate =
      totalReviews > 0
        ? Number(((positiveReviews / totalReviews) * 100).toFixed(1))
        : null;

    // Fetch all reviews for this host (including FLAGGED)
    const reviews = await this.prisma.review.findMany({
      where: {
        hostId: hostProfile.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        raffle: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        winner: {
          select: {
            id: true,
            prizeName: true,
            winType: true,
          },
        },
      },
    });

    return {
      metrics: {
        satisfactionRate,
        totalReviews,
        averageRating,
        breakdown,
        percentages,
      },
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        reviewerName:
          `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim() ||
          'Verified Winner',
        reviewerAvatar: r.user?.avatarUrl || null,
        prizeTitle: r.winner?.prizeName || r.raffle?.title,
        competitionTitle: r.raffle?.title,
        raffleSlug: r.raffle?.slug,
        canBeFlagged: r.status === 'APPROVED',
      })),
    };
  }

  /**
   * 5a. Edit a review comment / rating (Protected)
   * Only the authoring user can update their review.
   */
  async update(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews.');
    }

    const dataToUpdate: any = {};
    if (dto.rating !== undefined) {
      dataToUpdate.rating = dto.rating;
    }
    if (dto.comment !== undefined) {
      dataToUpdate.comment = dto.comment.trim() || null;
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: dataToUpdate,
    });
  }

  /**
   * 5b. Flag suspicious review for admin moderation (Protected)
   */
  async flag(reviewId: string, flaggerUserId: string, dto: FlagReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        raffle: true,
        user: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        status: 'FLAGGED',
      },
    });

    // Notify admins about the flagged review
    if (this.notificationsService) {
      try {
        await this.notificationsService.notifyAdmins({
          title: 'Review Flagged for Moderation',
          message: `Review #${reviewId} for "${review.raffle?.title || 'Competition'}" was flagged. Reason: ${dto.reason || 'Flagged by user/host'}`,
          type: 'SYSTEM',
        });
      } catch (err) {
        console.error('Failed to notify admins of flagged review:', err);
      }
    }

    return {
      message: 'Review has been flagged for moderation.',
      status: 'FLAGGED',
      review: updated,
    };
  }
}
