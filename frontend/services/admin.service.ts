import { api } from './api';

export interface UserStats {
  totalUsers: number;
  newThisMonth: number;
  activeUsers: number;
  blockedUsers: number;
  activePercentage: string;
  blockedPercentage: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isBlocked: boolean;
  isEmailVerified: boolean;
  avatarUrl: string | null;
  location: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  ticketsCount: number;
  totalSpent: number;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HostData {
  id: string;
  userId: string;
  businessName: string;
  slug?: string | null;
  bio?: string | null;
  phone?: string | null;
  address?: string | null;
  location?: string | null;
  email: string;
  avatarUrl?: string | null;
  ownerName?: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
  isBlocked: boolean;
  isEmailVerified?: boolean;
  isVerified: boolean;
  plan: string;
  walletBalance?: number;
  raffles: number;
  recentRaffles?: any[];
  revenue: number;
  createdAt: string;
  userCreatedAt?: string;
}

export interface GetHostsResponse {
  hosts: HostData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HostStats {
  totalHosts: number;
  activeHosts: number;
  blockedHosts: number;
  pendingHosts?: number;
}

export interface OrderData {
  id: string;
  orderId: string;
  buyerName: string;
  buyerInitials: string;
  competition: string;
  tickets: number;
  amount: number;
  payment: string;
  status: string;
  date: string;
}

export interface GetOrdersResponse {
  orders: OrderData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderStats {
  totalOrders: number;
  totalTicketsSold: number;
  totalOrderValue: number;
  refundedOrders: number;
}


export interface LogData {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    initials: string;
    type: "admin" | "system" | "user";
  };
  description: string;
  ip: string;
  status: "Success" | "Failed";
}

export interface GetLogsResponse {
  logs: LogData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminDashboardOverview {
  stats: {
    totalUsers: number;
    activeHosts: number;
    liveRaffles: number;
    totalRevenue: number;
  };
  revenueChart: {
    name: string;
    value: number;
  }[];
  growthChart: {
    name: string;
    Users: number;
    Hosts: number;
  }[];
  topHosts: {
    rank: number;
    id: string;
    name: string;
    revenue: string;
    initials: string;
    rafflesCount: number;
  }[];
  awaitingReview: {
    count: number;
    list: {
      id: string;
      title: string;
      sub: string;
      icon: string;
    }[];
  };
  recentActivity: {
    text: string;
    time: string;
    highlight: boolean;
    alert: boolean;
  }[];
}

export interface AdminReportsAnalytics {
  period: string;
  summary: {
    totalRevenue: number;
    ticketsSold: number;
    newUsers: number;
    activeCompetitions: number;
  };
  revenueTrend: {
    name: string;
    value: number;
  }[];
  salesByCategory: {
    name: string;
    value: number;
    amount: number;
    color: string;
  }[];
  popularCompetitions: {
    name: string;
    value: number;
    totalTickets: number;
    revenue: number;
    hostName: string;
  }[];
  userGrowth: {
    name: string;
    users: number;
  }[];
  hostPerformance: {
    name: string;
    percent: number;
    revenue: number;
    rafflesCount: number;
    ticketsSold?: number;
    totalTickets?: number;
  }[];
  geographicDistribution: {
    name: string;
    value: number;
    count: number;
  }[];
}

export const adminService = {
  async getUsers(params: { page?: number; limit?: number; search?: string; role?: string }): Promise<GetUsersResponse> {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  async getStats(): Promise<UserStats> {
    const { data } = await api.get('/admin/users/stats');
    return data;
  },

  async toggleBlockStatus(userId: string): Promise<User> {
    const { data } = await api.patch(`/admin/users/${userId}/block`);
    return data;
  },

  async getHosts(params: { page?: number; limit?: number; search?: string; status?: string }): Promise<GetHostsResponse> {
    const { data } = await api.get('/admin/hosts', { params });
    return data;
  },

  async getHostStats(): Promise<HostStats> {
    const { data } = await api.get('/admin/hosts/stats');
    return data;
  },

  async getHostDetails(hostId: string): Promise<any> {
    const { data } = await api.get(`/admin/hosts/${hostId}`);
    return data;
  },

  async approveHost(hostId: string): Promise<any> {
    const { data } = await api.patch(`/admin/hosts/${hostId}/approve`);
    return data;
  },

  async rejectHost(hostId: string): Promise<any> {
    const { data } = await api.patch(`/admin/hosts/${hostId}/reject`);
    return data;
  },

  async getOverviewStats(period?: string): Promise<AdminDashboardOverview> {
    const { data } = await api.get('/admin/dashboard/stats', { params: { period } });
    return data;
  },

  async getRevenueChart(period?: string): Promise<{ name: string; value: number }[]> {
    const { data } = await api.get('/admin/dashboard/revenue-chart', { params: { period } });
    return data;
  },

  async getSystemLogs(params: { page?: number; limit?: number; search?: string; filter?: string }): Promise<GetLogsResponse> {
    const { data } = await api.get('/admin/dashboard/logs', { params });
    return data;
  },

  async getOrders(params: { page?: number; limit?: number; search?: string }): Promise<GetOrdersResponse> {
    const { data } = await api.get('/admin/orders', { params });
    return data;
  },

  async getOrdersStats(): Promise<OrderStats> {
    const { data } = await api.get('/admin/orders/stats');
    return data;
  },

  async processRefund(transactionId: string, reason?: string): Promise<{ message: string; transaction: any }> {
    const { data } = await api.post(`/admin/orders/${transactionId}/refund`, { reason });
    return data;
  },

  async getAdminWithdrawals(): Promise<any[]> {
    const { data } = await api.get('/admin/withdrawals');
    return data;
  },

  async updateWithdrawalStatus(id: string, status: 'APPROVED' | 'COMPLETED' | 'REJECTED', adminNotes?: string): Promise<any> {
    const { data } = await api.patch(`/admin/withdrawals/${id}/status`, { status, adminNotes });
    return data;
  },

  async getReportsAnalytics(period: string = '3M'): Promise<AdminReportsAnalytics> {
    const { data } = await api.get('/admin/reports/analytics', { params: { period } });
    return data;
  },

  async downloadReportsCsv(period: string = '3M'): Promise<void> {
    const response = await api.get('/admin/reports/export', {
      params: { period },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `charity-draws-report-${period.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
