import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  createPrismaMock,
  MockPrismaService,
} from '../../test/helpers/prisma-mock.helper';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create notification for user', async () => {
      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        title: 'You won!',
        message: 'Congratulations on winning',
        type: 'WIN',
        link: '/dashboard/user/winners',
        isRead: false,
        createdAt: new Date(),
      };

      prismaMock.notification.create.mockResolvedValue(mockNotification);

      const result = await service.create({
        userId: 'user-1',
        title: 'You won!',
        message: 'Congratulations on winning',
        type: 'WIN',
        link: '/dashboard/user/winners',
      });

      expect(result).toEqual(mockNotification);
      expect(prismaMock.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          title: 'You won!',
          message: 'Congratulations on winning',
          type: 'WIN',
          link: '/dashboard/user/winners',
          isRead: false,
        },
      });
    });
  });

  describe('notifyAdmins', () => {
    it('should create notifications for all admin users', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { id: 'admin-1' },
        { id: 'admin-2' },
      ]);
      prismaMock.notification.createMany.mockResolvedValue({ count: 2 });

      const result = await service.notifyAdmins({
        title: 'New Withdrawal',
        message: 'Host requested £100',
        type: 'PAYMENT',
      });

      expect(result).toEqual({ count: 2 });
      expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
        data: [
          {
            userId: 'admin-1',
            title: 'New Withdrawal',
            message: 'Host requested £100',
            type: 'PAYMENT',
            link: null,
            isRead: false,
          },
          {
            userId: 'admin-2',
            title: 'New Withdrawal',
            message: 'Host requested £100',
            type: 'PAYMENT',
            link: null,
            isRead: false,
          },
        ],
      });
    });
  });

  describe('getUserNotifications', () => {
    it('should return paginated notifications only for the requesting user', async () => {
      const mockList = [
        {
          id: 'n-1',
          userId: 'user-1',
          title: 'Draw Soon',
          message: 'Starts in 10 mins',
          type: 'DRAW',
          link: null,
          isRead: false,
          createdAt: new Date(),
        },
      ];

      prismaMock.notification.findMany.mockResolvedValue(mockList);
      prismaMock.notification.count
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1); // unreadCount

      const result = await service.getUserNotifications('user-1', {
        page: 1,
        limit: 10,
      });

      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.unreadCount).toBe(1);
      expect(prismaMock.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should throw NotFoundException if notification does not exist', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('n-999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if notification belongs to another user', async () => {
      prismaMock.notification.findUnique.mockResolvedValue({
        id: 'n-1',
        userId: 'other-user',
      });

      await expect(service.markAsRead('n-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should mark notification as read for authorized user', async () => {
      prismaMock.notification.findUnique.mockResolvedValue({
        id: 'n-1',
        userId: 'user-1',
        isRead: false,
      });
      prismaMock.notification.update.mockResolvedValue({
        id: 'n-1',
        userId: 'user-1',
        isRead: true,
      });

      const result = await service.markAsRead('n-1', 'user-1');
      expect(result.isRead).toBe(true);
      expect(prismaMock.notification.update).toHaveBeenCalledWith({
        where: { id: 'n-1' },
        data: { isRead: true },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read for user', async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('user-1');
      expect(result.count).toBe(3);
      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        data: { isRead: true },
      });
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if notification not found', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(null);

      await expect(service.delete('n-99', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if notification belongs to another user', async () => {
      prismaMock.notification.findUnique.mockResolvedValue({
        id: 'n-1',
        userId: 'other-user',
      });

      await expect(service.delete('n-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should delete notification for owner', async () => {
      prismaMock.notification.findUnique.mockResolvedValue({
        id: 'n-1',
        userId: 'user-1',
      });
      prismaMock.notification.delete.mockResolvedValue({ id: 'n-1' });

      const result = await service.delete('n-1', 'user-1');
      expect(result.id).toBe('n-1');
      expect(prismaMock.notification.delete).toHaveBeenCalledWith({
        where: { id: 'n-1' },
      });
    });
  });

  describe('clearAll', () => {
    it('should delete all notifications for user', async () => {
      prismaMock.notification.deleteMany.mockResolvedValue({ count: 5 });

      const result = await service.clearAll('user-1');
      expect(result.count).toBe(5);
      expect(prismaMock.notification.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });

  describe('clearRead', () => {
    it('should delete only read notifications for user', async () => {
      prismaMock.notification.deleteMany.mockResolvedValue({ count: 4 });

      const result = await service.clearRead('user-1');
      expect(result.count).toBe(4);
      expect(prismaMock.notification.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: true },
      });
    });
  });
});
