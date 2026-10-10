import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/review.service';
import { CreateReviewInput, UpdateReviewInput } from '../types/review.types';
import { reviewKeys, winnerKeys, hostKeys } from './queryKeys';

export const useHostReviewsQuery = (
  hostId: string,
  params?: { page?: number; limit?: number; rating?: number },
) => {
  return useQuery({
    queryKey: reviewKeys.host(hostId, params),
    queryFn: () => reviewService.getHostReviews(hostId, params),
    enabled: Boolean(hostId),
  });
};

export const useMyReviewsQuery = () => {
  return useQuery({
    queryKey: reviewKeys.my(),
    queryFn: () => reviewService.getMyReviews(),
  });
};

export const useHostDashboardReviewsQuery = () => {
  return useQuery({
    queryKey: reviewKeys.hostDashboard(),
    queryFn: () => reviewService.getHostDashboardReviews(),
  });
};

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewInput) => reviewService.createReview(data),
    onSuccess: () => {
      // Invalidate winner records so "Leave Review" button immediately turns into "Reviewed ★X"
      queryClient.invalidateQueries({ queryKey: winnerKeys.my() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      queryClient.invalidateQueries({ queryKey: hostKeys.all });
    },
  });
};

export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReviewInput }) =>
      reviewService.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: winnerKeys.my() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      queryClient.invalidateQueries({ queryKey: hostKeys.all });
    },
  });
};

export const useFlagReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      reviewService.flagReview(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
};
