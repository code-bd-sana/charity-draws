import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async getMySubscription(hostId: string) {
    const host = await this.prisma.hostProfile.findUnique({
      where: { userId: hostId },
    }); if (!host) return null;

    const sub = await this.prisma.hostSubscription.findFirst({
      where: { hostId: host.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) return null;

    const transaction = await this.prisma.transaction.findFirst({
      where: { relatedEntityId: sub.id, type: 'SUBSCRIPTION_FEE' },
      orderBy: { createdAt: 'desc' },
    });

    return { ...sub, transaction };
  }

  async cancelSubscription(hostId: string) {
    const host = await this.prisma.hostProfile.findUnique({
      where: { userId: hostId },
    });
    if (!host) throw new BadRequestException('Host profile not found');

    const activeSub = await this.prisma.hostSubscription.findFirst({
      where: { hostId: host.id, status: 'ACTIVE' },
    });

    if (!activeSub) {
      throw new BadRequestException('No active subscription found to cancel');
    }

    return this.prisma.hostSubscription.update({
      where: { id: activeSub.id },
      data: { status: 'CANCELLED' },
    });
  }

  async getMyBillingHistory(userId: string) {
    // Check existing transactions
    let transactions = await this.prisma.transaction.findMany({
      where: { userId, type: 'SUBSCRIPTION_FEE' },
      orderBy: { createdAt: 'desc' },
    });

    // If no transactions found yet host has an active/past subscription, synthesize or create records
    if (transactions.length === 0) {
      const host = await this.prisma.hostProfile.findUnique({
        where: { userId },
        include: {
          subscriptions: {
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (host && host.subscriptions.length > 0) {
        for (const sub of host.subscriptions) {
          if (sub.plan && Number(sub.plan.price) > 0) {
            const created = await this.prisma.transaction.create({
              data: {
                userId,
                type: 'SUBSCRIPTION_FEE',
                amount: sub.plan.price,
                status: 'COMPLETED',
                relatedEntityId: sub.id,
                createdAt: sub.createdAt,
              },
            });
            transactions.push(created);
          }
        }
      }
    }

    return transactions;
  }

  async getAllSubscriptions() {
    const subscriptions = await this.prisma.hostSubscription.findMany({
      include: {
        plan: true,
        host: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      subscriptions.map(async (sub) => {
        const transaction = await this.prisma.transaction.findFirst({
          where: { relatedEntityId: sub.id, type: 'SUBSCRIPTION_FEE' },
          orderBy: { createdAt: 'desc' },
        });
        return { ...sub, transaction };
      }),
    );
  }

  async getAdminStats() {
    // Get all active subscriptions
    const activeSubscriptions = await this.prisma.hostSubscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    let mrr = 0;
    const planCounts: Record<string, number> = {};
    const planNames: Record<string, string> = {};

    activeSubscriptions.forEach((sub) => {
      // Calculate MRR (assuming price is per month)
      if (sub.plan && sub.plan.price) {
        mrr += Number(sub.plan.price);
      }

      // Count plans
      const planId = sub.planId;
      if (!planCounts[planId]) {
        planCounts[planId] = 0;
        planNames[planId] = sub.plan?.name || 'Unknown';
      }
      planCounts[planId]++;
    });

    // Format plan distribution for the pie chart
    const totalActive = activeSubscriptions.length;
    const planDistribution = Object.keys(planCounts).map((planId) => {
      const count = planCounts[planId];
      const percentage =
        totalActive > 0 ? Math.round((count / totalActive) * 100) : 0;
      return {
        name: planNames[planId],
        value: count,
        percentage: `${percentage}%`,
      };
    });

    return {
      mrr,
      totalActive,
      planDistribution,
    };
  }
}
