import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class AdminWithdrawalsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

  async findAll() {
    const withdrawals = await this.prisma.withdrawal.findMany({
      include: {
        host: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return withdrawals.map((w) => {
      const wObj = w as any;
      let parsedDetails = {};
      try {
        if (w.payoutDetails) parsedDetails = JSON.parse(w.payoutDetails);
      } catch (e) {
        parsedDetails = { raw: w.payoutDetails };
      }

      return {
        id: w.id,
        hostId: w.hostId,
        hostBusinessName: w.host.businessName,
        hostUserEmail: w.host.user.email,
        hostUserName: `${w.host.user.firstName || ''} ${w.host.user.lastName || ''}`.trim(),
        amount: Number(w.amount),
        feeAmount: Number(wObj.feeAmount || Number(w.amount) * 0.10),
        netAmount: Number(wObj.netAmount || Number(w.amount) * 0.90),
        status: w.status,
        payoutMethod: w.payoutMethod || 'BANK_TRANSFER',
        payoutDetails: parsedDetails,
        adminNotes: w.adminNotes,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      };
    });
  }

  async updateStatus(
    id: string,
    status: 'APPROVED' | 'COMPLETED' | 'REJECTED',
    adminNotes?: string,
  ) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
      include: { host: true },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (withdrawal.status === status) {
      return withdrawal;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // If rejected and previously PENDING, refund host's wallet
      if (status === 'REJECTED' && withdrawal.status === 'PENDING') {
        await tx.hostProfile.update({
          where: { id: withdrawal.hostId },
          data: {
            walletBalance: {
              increment: withdrawal.amount,
            },
          },
        });
      }

      return tx.withdrawal.update({
        where: { id },
        data: {
          status,
          adminNotes: adminNotes || withdrawal.adminNotes,
        },
      });
    });

    if (this.notificationsService && withdrawal.host?.userId) {
      const formattedAmount = Number(withdrawal.amount).toFixed(2);
      const title =
        status === 'COMPLETED'
          ? 'Withdrawal Payout Sent 💸'
          : status === 'APPROVED'
            ? 'Withdrawal Approved'
            : 'Withdrawal Request Update';
      const message =
        status === 'REJECTED'
          ? `Your withdrawal request for £${formattedAmount} was rejected.${adminNotes ? ` Reason: ${adminNotes}` : ''}`
          : `Your withdrawal request for £${formattedAmount} has been marked as ${status.toLowerCase()}.`;

      this.notificationsService
        .create({
          userId: withdrawal.host.userId,
          title,
          message,
          type: 'PAYMENT',
          link: '/dashboard/host/payouts',
        })
        .catch((e) => console.error('Withdrawal status notification error:', e));
    }

    return updated;
  }
}
