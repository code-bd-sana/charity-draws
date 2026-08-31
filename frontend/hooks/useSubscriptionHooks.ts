import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../services/subscription.service';
import { subscriptionKeys, adminKeys } from './queryKeys';

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: subscriptionService.getPlans,
  });
};

export const useMySubscription = () => {
  return useQuery({
    queryKey: subscriptionKeys.my(),
    queryFn: subscriptionService.getMySubscription,
  });
};

export const useCreateCheckoutSessionMutation = () => {
  return useMutation({
    mutationFn: subscriptionService.createCheckoutSession,
  });
};

export const useCancelSubscriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscriptionService.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.my() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.adminAll() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.adminStats() });
      queryClient.invalidateQueries({ queryKey: adminKeys.overviewStats() });
    },
  });
};

export const useAllSubscriptionsAdmin = () => {
  return useQuery({
    queryKey: subscriptionKeys.adminAll(),
    queryFn: subscriptionService.getAllSubscriptionsForAdmin,
  });
};

export const useMyBillingHistory = () => {
  return useQuery({
    queryKey: subscriptionKeys.myBilling(),
    queryFn: subscriptionService.getMyBillingHistory,
  });
};

export const useAdminSubscriptionStats = () => {
  return useQuery({
    queryKey: subscriptionKeys.adminStats(),
    queryFn: subscriptionService.getAdminSubscriptionStats,
  });
};
