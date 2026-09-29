import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'WIN' | 'PAYMENT' | 'DRAW' | 'LAUNCH' | 'SYSTEM' | string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        link: data.link || null,
        isRead: false,
      },
    });
  }

  async notifyAdmins(data: {
    title: string;
    message: string;
    type?: string;
    link?: string;
  }) {
    const adminUsers = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (adminUsers.length === 0) return [];

    const notificationsData = adminUsers.map((admin) => ({
      userId: admin.id,
      title: data.title,
      message: data.message,
      type: data.type || 'INFO',
      link: data.link || null,
      isRead: false,
    }));

    return this.prisma.notification.createMany({
      data: notificationsData,
    });
  }

  async getUserNotifications(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      type?: string;
      unreadOnly?: boolean;
    } = {},
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.type && query.type !== 'All') {
      where.type = query.type.toUpperCase();
    }

    if (query.unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      total,
      page,
      limit,
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You cannot access another user notification',
      );
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You cannot access another user notification',
      );
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async clearAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  async clearRead(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });
  }
}
