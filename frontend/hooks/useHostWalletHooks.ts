import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hostWalletService, HostSalesRange, RequestWithdrawalPayload } from '../services/host-wallet.service';
import { hostKeys, adminKeys } from './queryKeys';

export const useHostDashboardOverview = () => {
  return useQuery({
    queryKey: hostKeys.overview(),
    queryFn: hostWalletService.getDashboardOverview,
    staleTime: 30 * 1000,
  });
};

export const useHostWalletStats = () => {
  return useQuery({
    queryKey: hostKeys.walletStats(),
    queryFn: hostWalletService.getWalletStats,
    staleTime: 60 * 1000,
  });
};

export const useHostSalesAnalytics = (range: HostSalesRange) => {
  return useQuery({
    queryKey: hostKeys.sales(range),
    queryFn: () => hostWalletService.getSalesAnalytics(range),
    staleTime: 30 * 1000,
  });
};

export const useHostPerformanceAnalytics = (timeframe: string) => {
  return useQuery({
    queryKey: hostKeys.performance(timeframe),
    queryFn: () => hostWalletService.getPerformanceAnalytics(timeframe),
    staleTime: 30 * 1000,
  });
};

export const useHostWithdrawalHistory = () => {
  return useQuery({
    queryKey: hostKeys.walletHistory(),
    queryFn: hostWalletService.getWithdrawalHistory,
    staleTime: 60 * 1000,
  });
};

export const useRequestWithdrawalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequestWithdrawalPayload) => hostWalletService.requestWithdrawal(payload),
    onSuccess: () => {
      // Synchronize host wallet metrics, withdrawal history, and admin withdrawal queues bidirectionally
      queryClient.invalidateQueries({ queryKey: hostKeys.walletStats() });
      queryClient.invalidateQueries({ queryKey: hostKeys.walletHistory() });
      queryClient.invalidateQueries({ queryKey: hostKeys.wallet() });
      queryClient.invalidateQueries({ queryKey: hostKeys.overview() });
      queryClient.invalidateQueries({ queryKey: adminKeys.withdrawals() });
      queryClient.invalidateQueries({ queryKey: adminKeys.overviewStats() });
    },
  });
};
