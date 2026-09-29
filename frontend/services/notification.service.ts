import { api } from './api';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string; // INFO, WIN, PAYMENT, DRAW, LAUNCH, SYSTEM
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface GetNotificationsResponse {
  notifications: AppNotification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export interface QueryNotificationsParams {
  page?: number;
  limit?: number;
  type?: string;
  unreadOnly?: boolean;
}

export const notificationService = {
  async getNotifications(
    params?: QueryNotificationsParams,
  ): Promise<GetNotificationsResponse> {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  async markAsRead(id: string): Promise<AppNotification> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ count: number }> {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  async deleteNotification(id: string): Promise<AppNotification> {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  async clearAll(): Promise<{ count: number }> {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  },

  async clearRead(): Promise<{ count: number }> {
    const response = await api.delete('/notifications/clear-read');
    return response.data;
  },
};
