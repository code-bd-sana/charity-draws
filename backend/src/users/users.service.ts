import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';
import { processAndSaveImage } from '../common/utils/image.util';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid current password');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(changePasswordDto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { hostProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { businessName, bio, avatarUrl, logo, ...userData } = updateProfileDto;

    const rawAvatar = avatarUrl || logo;
    if (rawAvatar !== undefined) {
      const processed = await processAndSaveImage(rawAvatar, 'avatars');
      (userData as any).avatarUrl = processed;
    }

    const updatedUser = await this.prisma.$transaction(async (prisma) => {
      const u = await prisma.user.update({
        where: { id: userId },
        data: userData,
        include: { hostProfile: true },
      });

      if (u.role === 'HOST') {
        const hostProfileData: any = {};
        if (businessName !== undefined)
          hostProfileData.businessName = businessName;
        if (bio !== undefined) hostProfileData.bio = bio;
        if (userData.phone !== undefined)
          hostProfileData.phone = userData.phone;
        if (userData.address !== undefined)
          hostProfileData.address = userData.address;

        if (Object.keys(hostProfileData).length > 0) {
          if (u.hostProfile) {
            await prisma.hostProfile.update({
              where: { userId },
              data: hostProfileData,
            });
          } else if (businessName !== undefined) {
            // Need businessName at minimum to create
            await prisma.hostProfile.create({
              data: { userId, ...hostProfileData },
            });
          }
        }
      }
      return prisma.user.findUnique({
        where: { id: userId },
        include: { hostProfile: true },
      });
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser!;
    return {
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      include: { hostProfile: true },
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return {
      message: 'Logo updated successfully',
      user: userWithoutPassword,
    };
  }

  async getMyWinners(userId: string) {
    const winners = await this.prisma.winner.findMany({
      where: { userId },
      include: {
        raffle: {
          include: {
            host: true,
            instantWins: true,
          },
        },
        ticket: {
          select: {
            ticketNumber: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return winners.map((w) => {
      const instantWinDetails =
        w.winType === 'INSTANT_WIN'
          ? w.raffle.instantWins.find(
              (iw) => iw.ticketNumber === w.ticket.ticketNumber,
            )
          : null;

      const prizeImage =
        w.winType === 'INSTANT_WIN'
          ? instantWinDetails?.image || w.raffle.mainImage
          : w.raffle.mainImage;

      const prizeName =
        w.prizeName ||
        (w.winType === 'INSTANT_WIN'
          ? instantWinDetails?.prizeName
          : w.raffle.prizeName);

      return {
        id: w.id,
        raffleId: w.raffleId,
        ticketId: w.ticketId,
        winType: w.winType, // 'INSTANT_WIN' | 'MAIN_DRAW'
        prizeName: prizeName || 'Prize',
        prizeImage: prizeImage || null,
        rrpValue: instantWinDetails?.rrpValue
          ? Number(instantWinDetails.rrpValue)
          : w.raffle.mainPrizeValue
            ? Number(w.raffle.mainPrizeValue)
            : null,
        ticketNumber: w.ticket.ticketNumber,
        deliveryStatus: w.deliveryStatus,
        verificationStatus: w.verificationStatus,
        trackingNumber: w.trackingNumber,
        createdAt: w.createdAt,
        raffle: {
          id: w.raffle.id,
          title: w.raffle.title,
          slug: w.raffle.slug,
          mainImage: w.raffle.mainImage,
          hostBusinessName: w.raffle.host?.businessName || 'Host',
          status: w.raffle.status,
        },
        instantWinDetails: instantWinDetails
          ? {
              id: instantWinDetails.id,
              prizeName: instantWinDetails.prizeName,
              image: instantWinDetails.image,
              rrpValue: instantWinDetails.rrpValue
                ? Number(instantWinDetails.rrpValue)
                : null,
            }
          : null,
      };
    });
  }

  async getUserDashboardOverview(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 1. Fetch tickets for this user with raffle info
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      include: {
        raffle: {
          select: {
            id: true,
            title: true,
            slug: true,
            mainImage: true,
            endDate: true,
            status: true,
            pricePerTicket: true,
            host: {
              select: {
                businessName: true,
              },
            },
          },
        },
        winners: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch completed transactions for this user
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'asc' },
    });

    // 3. Fetch winners / prizes for this user
    const winners = await this.prisma.winner.findMany({
      where: { userId },
      include: {
        raffle: {
          select: {
            id: true,
            title: true,
            slug: true,
            mainImage: true,
            status: true,
            host: { select: { businessName: true } },
          },
        },
        ticket: {
          select: {
            ticketNumber: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute KPIs
    const totalTickets = tickets.length;
    const ticketsThisMonth = tickets.filter(
      (t) => new Date(t.createdAt) >= startOfMonth,
    ).length;

    // Group active tickets by competition
    const activeEntriesMap = new Map<
      string,
      {
        id: string;
        title: string;
        slug: string;
        image: string | null;
        hostName: string;
        drawDate: Date;
        ticketCount: number;
      }
    >();

    for (const t of tickets) {
      if (t.raffle && t.raffle.status === 'ACTIVE') {
        const existing = activeEntriesMap.get(t.raffle.id);
        if (existing) {
          existing.ticketCount += 1;
        } else {
          activeEntriesMap.set(t.raffle.id, {
            id: t.raffle.id,
            title: t.raffle.title,
            slug: t.raffle.slug || t.raffle.id,
            image: t.raffle.mainImage,
            hostName: t.raffle.host?.businessName || 'Verified Host',
            drawDate: t.raffle.endDate,
            ticketCount: 1,
          });
        }
      }
    }

    const activeEntriesList = Array.from(activeEntriesMap.values());
    const activeEntriesCount = activeEntriesList.length;
    const activeTicketsCount = activeEntriesList.reduce(
      (sum, e) => sum + e.ticketCount,
      0,
    );

    const totalWins = winners.length;
    const newWinsThisMonth = winners.filter(
      (w) => new Date(w.createdAt) >= startOfMonth,
    ).length;

    // Total spent: from transactions, or fallback to tickets price sum
    let totalSpent = transactions
      .filter((t) => t.type === 'TICKET_PURCHASE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    if (totalSpent === 0 && tickets.length > 0) {
      totalSpent = tickets.reduce(
        (sum, t) => sum + Number(t.raffle?.pricePerTicket || 0),
        0,
      );
    }

    const spentThisMonth = transactions
      .filter(
        (t) =>
          t.type === 'TICKET_PURCHASE' &&
          new Date(t.createdAt) >= startOfMonth,
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const spentLastMonth = transactions
      .filter(
        (t) =>
          t.type === 'TICKET_PURCHASE' &&
          new Date(t.createdAt) >= startOfLastMonth &&
          new Date(t.createdAt) <= endOfLastMonth,
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    let spendChangePercentage = 0;
    if (spentLastMonth > 0) {
      spendChangePercentage = Math.round(
        ((spentThisMonth - spentLastMonth) / spentLastMonth) * 100,
      );
    } else if (spentThisMonth > 0) {
      spendChangePercentage = 100;
    }

    const ticketTransactions = transactions.filter(
      (t) => t.type === 'TICKET_PURCHASE',
    );

    const recentWins = winners.slice(0, 5).map((w) => ({
      id: w.id,
      prizeName: w.prizeName || 'Prize',
      image: w.raffle?.mainImage || null,
      winType: w.winType,
      ticketNumber: w.ticket?.ticketNumber,
      raffleTitle: w.raffle?.title || 'Competition',
      raffleSlug: w.raffle?.slug || '',
      hostName: w.raffle?.host?.businessName || 'Host',
      createdAt: w.createdAt,
      deliveryStatus: w.deliveryStatus,
    }));

    return {
      kpi: {
        totalTickets,
        ticketsThisMonth,
        activeEntriesCount,
        activeTicketsCount,
        totalWins,
        newWinsThisMonth,
        totalSpent,
        spentThisMonth,
        spendChangePercentage,
      },
      activeEntries: activeEntriesList.slice(0, 5),
      recentWins,
      transactions: ticketTransactions.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        date: t.createdAt,
      })),
    };
  }

  async getMyTransactions(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const raffleIds = transactions
      .filter((t) => t.type === 'TICKET_PURCHASE' && t.relatedEntityId)
      .map((t) => t.relatedEntityId!);

    const raffles =
      raffleIds.length > 0
        ? await this.prisma.raffle.findMany({
            where: { id: { in: raffleIds } },
            select: { id: true, title: true, slug: true, mainImage: true },
          })
        : [];

    const raffleMap = new Map(raffles.map((r) => [r.id, r]));

    return transactions.map((tx) => {
      const raffle = tx.relatedEntityId ? raffleMap.get(tx.relatedEntityId) : null;
      return {
        id: tx.id,
        transactionId: `#TRN-${tx.id.slice(0, 8).toUpperCase()}`,
        amount: Number(tx.amount),
        type: tx.type,
        status: tx.status.toLowerCase(),
        paymentGateway: tx.paymentGateway || 'Card',
        createdAt: tx.createdAt,
        raffleTitle: raffle?.title || 'Competition Entry',
        raffleSlug: raffle?.slug || null,
      };
    });
  }
}

