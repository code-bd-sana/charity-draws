import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { authService } from '../services/auth.service';
import { winnerKeys, userKeys } from './queryKeys';

export const useUserDashboardQuery = () => {
  return useQuery({
    queryKey: userKeys.dashboard(),
    queryFn: () => userService.getUserDashboard(),
    staleTime: 15 * 1000,
  });
};

export const useUserTransactionsQuery = () => {
  return useQuery({
    queryKey: userKeys.transactions(),
    queryFn: () => userService.getMyTransactions(),
    staleTime: 30 * 1000,
  });
};

export const useMyWinnersQuery = () => {
  return useQuery({
    queryKey: winnerKeys.my(),
    queryFn: () => userService.getMyWinners(),
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: userService.changePassword,
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.all, data.user);
    },
  });
};

export const useUploadAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.uploadAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.all, data.user);
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
  });
};
