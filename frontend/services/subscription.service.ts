import { api } from './api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  durationDays: number;
  maxActiveRaffles: number | null;
}

export interface HostSubscription {
  id: string;
  hostId: string;
  planId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  plan: SubscriptionPlan;
  transaction?: {
    id: string;
    amount: string;
    status: string;
    paymentGateway: string;
    gatewayTransactionId: string;
    createdAt: string;
  };
}

export interface AdminSubscriptionItem {
  id: string;
  hostId: string;
  planId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  createdAt: string;
  plan: SubscriptionPlan;
  host: {
    id: string;
    userId: string;
    businessName: string;
    slug?: string | null;
    bio?: string | null;
    phone?: string | null;
    address?: string | null;
    walletBalance?: string | number;
    isVerified?: boolean;
    user?: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
      phone: string | null;
      role: string;
      isBlocked?: boolean;
    };
  };
  transaction?: {
    id: string;
    userId?: string;
    amount: string;
    status: string;
    paymentGateway: string;
    gatewayTransactionId?: string;
    createdAt: string;
  } | null;
}

export interface AdminSubscriptionStats {
  mrr: number;
  totalActive: number;
  totalSubscriptions: number;
  paidActive: number;
  freeActive: number;
  planDistribution: {
    id?: string;
    name: string;
    value: number;
    percentage: string;
  }[];
}

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  async getMySubscription(): Promise<HostSubscription | null> {
    const response = await api.get('/subscriptions/my');
    return response.data;
  },

  async cancelSubscription(): Promise<HostSubscription> {
    const response = await api.post('/subscriptions/cancel');
    return response.data;
  },

  async createCheckoutSession(planId: string): Promise<{ url?: string; isTest?: boolean; transactionId?: string; message?: string }> {
    const response = await api.post('/payment/checkout/subscription', { planId });
    return response.data;
  },

  async getAllSubscriptionsForAdmin(): Promise<AdminSubscriptionItem[]> {
    const response = await api.get('/subscriptions/admin');
    return response.data;
  },

  async cancelSubscriptionAdmin(subscriptionId: string): Promise<any> {
    const response = await api.post(`/subscriptions/admin/${subscriptionId}/cancel`);
    return response.data;
  },

  async getMyBillingHistory(): Promise<any[]> {
    const response = await api.get('/subscriptions/history');
    return response.data;
  },

  async getAdminSubscriptionStats(): Promise<AdminSubscriptionStats> {
    const response = await api.get('/subscriptions/admin/stats');
    return response.data;
  }
};
