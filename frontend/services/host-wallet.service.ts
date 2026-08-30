import { api } from './api';

export interface WalletStats {
  availableBalance: number;
  pendingClearance: number;
  totalLifetimeEarnings: number;
  totalFeesPaid: number;
  commissionRate: number;
}

export interface RequestWithdrawalPayload {
  amount: number;
  payoutMethod: string;
  payoutDetails: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    sortCode?: string;
    iban?: string;
    paypalEmail?: string;
    notes?: string;
  };
}

export interface WithdrawalHistoryItem {
  id: string;
  date: string;
  grossAmount: number;
  feeDeducted: number;
  feePercent: number;
  netAmount: number;
  method: string;
  status: string;
  referenceId: string;
  payoutDetails?: Record<string, unknown>;
  adminNotes?: string;
}

export interface HostDashboardOverviewData {
  kpiStats: {
    totalNetRevenue: number;
    totalGrossRevenue: number;
    availableBalance: number;
    activeCompetitionsCount: number;
    totalCompetitionsCount: number;
    totalTicketsSold: number;
    totalWinnersCount: number;
  };
  activeRaffles: Array<{
    id: string;
    slug: string;
    title: string;
    image: string;
    ticketPrice: number;
    totalTickets: number;
    ticketsSold: number;
    percentageSold: number;
    endDate: string;
    status: string;
    revenue: number;
  }>;
  upcomingDraws: Array<{
    id: string;
    title: string;
    endDate: string;
    ticketsSold: number;
    totalTickets: number;
    status: string;
  }>;
  recentActivity: Array<{
    id: string;
    ticketNumber: number;
    raffleTitle: string;
    buyerName: string;
    amount: number;
    createdAt: string;
  }>;
}

export type HostSalesRange = '7d' | '30d' | '12m';

export interface HostSalesRaffle {
  id: string;
  name: string;
  ticketsSold: number;
  totalTickets: number;
  raised: number;
  status: 'Live' | 'Completed' | 'Draft' | 'Pending Review' | 'Cancelled';
  endsAt: string;
  grossRevenue: number;
  ticketPrice: number;
  platformFee: number;
  platformFeePercent: number;
  platformPlan: string;
  netEarnings: number;
}

export interface HostSalesAnalytics {
  metrics: {
    totalRevenue: number;
    totalTicketsSold: number;
    completedOrders: number;
    averageOrderValue: number;
  };
  chart: {
    range: HostSalesRange;
    data: Array<{
      date: string;
      sales: number;
      revenue: number;
    }>;
  };
  raffles: HostSalesRaffle[];
}

export const hostWalletService = {
  async getDashboardOverview(): Promise<HostDashboardOverviewData> {
    const response = await api.get('/hosts/dashboard');
    return response.data;
  },

  async getSalesAnalytics(range: HostSalesRange): Promise<HostSalesAnalytics> {
    const response = await api.get('/hosts/sales', { params: { range } });
    return response.data;
  },

  async getWalletStats(): Promise<WalletStats> {
    const response = await api.get('/hosts/wallet');
    return response.data;
  },

  async requestWithdrawal(payload: RequestWithdrawalPayload) {
    const response = await api.post('/hosts/withdraw', payload);
    return response.data;
  },

  async getWithdrawalHistory(): Promise<WithdrawalHistoryItem[]> {
    const response = await api.get('/hosts/withdrawals');
    return response.data;
  },
};
