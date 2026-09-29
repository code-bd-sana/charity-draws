import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtService } from '@nestjs/jwt';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: any;
  let jwtService: any;

  beforeEach(async () => {
    notificationsService = {
      getUserNotifications: jest.fn().mockResolvedValue({
        notifications: [],
        total: 0,
        page: 1,
        limit: 20,
        unreadCount: 0,
      }),
      markAsRead: jest.fn().mockResolvedValue({ id: 'notif-1', isRead: true }),
      markAllAsRead: jest.fn().mockResolvedValue({ count: 5 }),
      clearAll: jest.fn().mockResolvedValue({ count: 10 }),
      clearRead: jest.fn().mockResolvedValue({ count: 7 }),
      delete: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    jwtService = {
      verify: jest.fn().mockReturnValue({ sub: 'user-123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNotifications', () => {
    it('should extract userId and return notifications', async () => {
      const mockReq: any = { user: { sub: 'user-123' } };
      const result = await controller.getNotifications(mockReq, { page: 1, limit: 10 });
      expect(result.total).toBe(0);
      expect(notificationsService.getUserNotifications).toHaveBeenCalledWith(
        'user-123',
        { page: 1, limit: 10 },
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark single notification as read', async () => {
      const mockReq: any = { user: { id: 'user-123' } };
      const result = await controller.markAsRead(mockReq, 'notif-1');
      expect(result.isRead).toBe(true);
      expect(notificationsService.markAsRead).toHaveBeenCalledWith('notif-1', 'user-123');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockReq: any = { user: { sub: 'user-123' } };
      const result = await controller.markAllAsRead(mockReq);
      expect(result.count).toBe(5);
      expect(notificationsService.markAllAsRead).toHaveBeenCalledWith('user-123');
    });
  });

  describe('clearReadNotifications', () => {
    it('should clear read notifications for user', async () => {
      const mockReq: any = { user: { sub: 'user-123' } };
      const result = await controller.clearReadNotifications(mockReq);
      expect(result.count).toBe(7);
      expect(notificationsService.clearRead).toHaveBeenCalledWith('user-123');
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const mockReq: any = { user: { sub: 'user-123' } };
      const result = await controller.deleteNotification(mockReq, 'notif-1');
      expect(result.id).toBe('notif-1');
      expect(notificationsService.delete).toHaveBeenCalledWith('notif-1', 'user-123');
    });
  });
});
