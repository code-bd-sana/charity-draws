import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { adminService, AdminDashboardOverview, AdminReportsAnalytics } from '../services/admin.service';
import { adminKeys, hostKeys } from './queryKeys';

export const useAdminUsers = (params: { page?: number; limit?: number; search?: string; role?: string }) => {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminService.getUsers(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAdminHostStats = () => {
  return useQuery({
    queryKey: hostKeys.adminStats(),
    queryFn: adminService.getHostStats,
  });
};

export const useAdminOrders = (params: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: adminKeys.orders(params),
    queryFn: () => adminService.getOrders(params),
  });
};

export const useAdminOrdersStats = () => {
  return useQuery({
    queryKey: adminKeys.ordersStats(),
    queryFn: adminService.getOrdersStats,
  });
};

export const useProcessRefundMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason?: string }) =>
      adminService.processRefund(transactionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.orders() });
      queryClient.invalidateQueries({ queryKey: adminKeys.ordersStats() });
      queryClient.invalidateQueries({ queryKey: adminKeys.overviewStats() });
      queryClient.invalidateQueries({ queryKey: adminKeys.revenueChart() });
      queryClient.invalidateQueries({ queryKey: hostKeys.overview() });
      queryClient.invalidateQueries({ queryKey: hostKeys.sales() });
    },
  });
};

export const useAdminUsersStats = () => {
  return useQuery({
    queryKey: adminKeys.usersStats(),
    queryFn: () => adminService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useToggleUserBlockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.toggleBlockStatus(userId),
    onSuccess: () => {
      // Invalidate users list, user stats, and host management caches
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.usersStats() });
      queryClient.invalidateQueries({ queryKey: hostKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: hostKeys.adminStats() });
      queryClient.invalidateQueries({ queryKey: hostKeys.all });
    },
  });
};

export interface UseAdminOverviewStatsOptions {
  period?: string;
  enabled?: boolean;
  [key: string]: any;
}

export const useAdminOverviewStats = (options?: UseAdminOverviewStatsOptions) => {
  const { period, ...queryOptions } = options || {};
  return useQuery<AdminDashboardOverview>({
    queryKey: adminKeys.overviewStats(period),
    queryFn: () => adminService.getOverviewStats(period),
    staleTime: 60 * 1000,
    ...queryOptions,
  });
};

export const useAdminRevenueChart = (
  period: '7D' | '1M' | '6M' | '1Y' = '1Y',
  options?: Record<string, any>
) => {
  return useQuery<{ name: string; value: number }[]>({
    queryKey: adminKeys.revenueChart(period),
    queryFn: () => adminService.getRevenueChart(period),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
};

export const useAdminLogs = (params: { page?: number; limit?: number; search?: string; filter?: string }) => {
  return useQuery({
    queryKey: adminKeys.logs(params),
    queryFn: () => adminService.getSystemLogs(params),
  });
};

export const useAdminWithdrawals = () => {
  return useQuery({
    queryKey: adminKeys.withdrawals(),
    queryFn: () => adminService.getAdminWithdrawals(),
    staleTime: 30 * 1000,
  });
};

export const useUpdateWithdrawalStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: string; status: 'APPROVED' | 'COMPLETED' | 'REJECTED'; adminNotes?: string }) =>
      adminService.updateWithdrawalStatus(id, status, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.withdrawals() });
      queryClient.invalidateQueries({ queryKey: adminKeys.overviewStats() });
      queryClient.invalidateQueries({ queryKey: hostKeys.walletStats() });
      queryClient.invalidateQueries({ queryKey: hostKeys.walletHistory() });
      queryClient.invalidateQueries({ queryKey: hostKeys.wallet() });
      queryClient.invalidateQueries({ queryKey: hostKeys.overview() });
    },
  });
};

export const useAdminReportsAnalytics = (
  period: string = '3M',
  options?: Record<string, any>
) => {
  return useQuery<AdminReportsAnalytics>({
    queryKey: adminKeys.reports(period),
    queryFn: () => adminService.getReportsAnalytics(period),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
};
