import { api } from './api';
import { User } from './auth.service';

export interface UserWinner {
  id: string;
  raffleId: string;
  ticketId: string;
  winType: 'INSTANT_WIN' | 'MAIN_DRAW';
  prizeName: string;
  prizeImage: string | null;
  rrpValue: number | null;
  ticketNumber: number;
  deliveryStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED';
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  trackingNumber: string | null;
  createdAt: string;
  raffle: {
    id: string;
    title: string;
    slug: string;
    mainImage: string | null;
    hostBusinessName: string;
    status: string;
  };
  instantWinDetails?: {
    id: string;
    prizeName: string;
    image: string | null;
    rrpValue: number | null;
  } | null;
}

export const userService = {
  async changePassword(data: any) {
    const response = await api.patch('/users/change-password', data);
    return response.data;
  },

  async updateProfile(data: any): Promise<{ message: string; user: User }> {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  async uploadAvatar(file: File): Promise<{ message: string; user: User }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getMyWinners(): Promise<UserWinner[]> {
    const response = await api.get('/users/my-winners');
    return response.data;
  },

  async getUserDashboard(): Promise<UserDashboardOverview> {
    const response = await api.get('/users/dashboard');
    return response.data;
  },

  async getMyTransactions(): Promise<UserTransaction[]> {
    const response = await api.get('/users/my-transactions');
    return response.data;
  },
};

export interface UserDashboardOverview {
  kpi: {
    totalTickets: number;
    ticketsThisMonth: number;
    activeEntriesCount: number;
    activeTicketsCount: number;
    totalWins: number;
    newWinsThisMonth: number;
    totalSpent: number;
    spentThisMonth: number;
    spendChangePercentage: number;
  };
  activeEntries: Array<{
    id: string;
    title: string;
    slug: string;
    image: string | null;
    hostName: string;
    drawDate: string;
    ticketCount: number;
  }>;
  recentWins: Array<{
    id: string;
    prizeName: string;
    image: string | null;
    winType: string;
    ticketNumber?: number;
    raffleTitle: string;
    raffleSlug: string;
    hostName: string;
    createdAt: string;
    deliveryStatus: string;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    date: string;
  }>;
}

export interface UserTransaction {
  id: string;
  transactionId: string;
  amount: number;
  type: string;
  status: 'completed' | 'refunded' | 'failed' | string;
  paymentGateway: string;
  createdAt: string;
  raffleTitle: string | null;
  raffleSlug: string | null;
}

