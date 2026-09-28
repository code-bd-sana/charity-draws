import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminHostsService {
  constructor(private prisma: PrismaService) {}

  async getHosts(page = 1, limit = 10, search = '', status = 'All') {
    const skip = (page - 1) * limit;

    const where: Prisma.HostProfileWhereInput = {};

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status === 'Active') {
      where.isVerified = true;
      where.user = { isBlocked: false };
    } else if (status === 'Blocked') {
      where.user = { isBlocked: true };
    } else if (status === 'Pending') {
      where.isVerified = false;
    }

    const [hosts, total] = await Promise.all([
      this.prisma.hostProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              location: true,
              phone: true,
              address: true,
              role: true,
              isBlocked: true,
              isEmailVerified: true,
              createdAt: true,
            },
          },
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          raffles: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              pricePerTicket: true,
              ticketsSold: true,
              totalTickets: true,
              createdAt: true,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { raffles: true, withdrawals: true },
          },
        },
      }),
      this.prisma.hostProfile.count({ where }),
    ]);

    const formattedHosts = hosts.map((host) => {
      // For revenue, using walletBalance for simplicity right now
      const revenue = Number(host.walletBalance) || 0;

      const activePlan =
        host.subscriptions && host.subscriptions.length > 0
          ? host.subscriptions[0].plan.name
          : 'Free';

      const ownerName =
        `${host.user?.firstName || ''} ${host.user?.lastName || ''}`.trim() ||
        'Not specified';

      return {
        id: host.id,
        userId: host.userId,
        businessName: host.businessName,
        slug: host.slug || null,
        bio: host.bio || null,
        phone: host.phone || host.user?.phone || null,
        address: host.address || host.user?.address || null,
        location: host.address || host.user?.location || host.user?.address || null,
        email: host.user?.email || '',
        avatarUrl: host.user?.avatarUrl || null,
        ownerName,
        firstName: host.user?.firstName || null,
        lastName: host.user?.lastName || null,
        role: host.user?.role || 'HOST',
        isBlocked: host.user?.isBlocked || false,
        isEmailVerified: host.user?.isEmailVerified || false,
        isVerified: host.isVerified,
        plan: !host.isVerified ? 'Pending Approval' : activePlan,
        walletBalance: Number(host.walletBalance) || 0,
        raffles: host._count?.raffles || 0,
        recentRaffles: host.raffles || [],
        revenue: revenue,
        createdAt: host.createdAt,
        userCreatedAt: host.user?.createdAt || host.createdAt,
      };
    });

    return {
      hosts: formattedHosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getHostById(id: string) {
    const host = await this.prisma.hostProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            location: true,
            phone: true,
            address: true,
            role: true,
            isBlocked: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        raffles: {
          orderBy: { createdAt: 'desc' },
          include: {
            instantWins: true,
            winners: true,
          },
        },
        withdrawals: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { raffles: true, withdrawals: true },
        },
      },
    });

    if (!host) {
      throw new NotFoundException('Host profile not found');
    }

    return host;
  }

  async getStats() {
    const [totalHosts, activeHosts, blockedHosts, pendingHosts] = await Promise.all([
      this.prisma.hostProfile.count(),
      this.prisma.hostProfile.count({ where: { isVerified: true, user: { isBlocked: false } } }),
      this.prisma.hostProfile.count({ where: { user: { isBlocked: true } } }),
      this.prisma.hostProfile.count({ where: { isVerified: false } }),
    ]);

    return {
      totalHosts,
      activeHosts,
      blockedHosts,
      pendingHosts,
    };
  }

  async approveHost(id: string) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { id },
    });
    if (!hostProfile) {
      throw new NotFoundException('Host profile not found');
    }

    return this.prisma.hostProfile.update({
      where: { id },
      data: { isVerified: true },
    });
  }

  async rejectHost(id: string) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { id },
    });
    if (!hostProfile) {
      throw new NotFoundException('Host profile not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete subscriptions if any exist
      await tx.hostSubscription.deleteMany({
        where: { hostId: id },
      });
      // Delete host profile
      await tx.hostProfile.delete({
        where: { id },
      });
      // Reset user role to CLIENT
      await tx.user.update({
        where: { id: hostProfile.userId },
        data: { role: 'CLIENT' },
      });
    });
  }
}
