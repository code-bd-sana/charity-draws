import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { raffleService, UpdateRaffleData, CreateRaffleData } from '../services/raffle.service';
import { raffleKeys, winnerKeys, hostKeys, adminKeys, ticketKeys } from './queryKeys';

export const usePublicRaffles = (params: {
  search?: string;
  page?: number;
  limit?: number;
  category?: string;
  statusFilter?: string;
  sort?: string;
}) => {
  return useQuery({
    queryKey: raffleKeys.public(params),
    queryFn: () => raffleService.getPublicRaffles(params),
  });
};

export const usePublicWinnersList = (params: {
  activeTab?: string;
  winnerType?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: winnerKeys.public(params),
    queryFn: () => raffleService.getPublicWinnersList(params),
  });
};

export const usePublicRaffleDetail = (
  slug: string,
  options?: {
    refetchInterval?: number | false | ((query: any) => number | false);
    initialData?: any;
  }
) => {
  return useQuery({
    queryKey: raffleKeys.detail(slug),
    queryFn: () => raffleService.getPublicRaffleBySlug(slug),
    enabled: !!slug,
    ...options,
  });
};

export const useHostRaffles = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: raffleKeys.host(params),
    queryFn: () => raffleService.getMyRaffles(params),
  });
};

export const useGetRaffleById = (id: string) => {
  return useQuery({
    queryKey: raffleKeys.detail(id),
    queryFn: () => raffleService.getRaffleById(id),
    enabled: !!id,
  });
};

export const useUpdateRaffle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRaffleData }) =>
      raffleService.updateRaffle(id, data),
    onSuccess: (_, variables) => {
      // Invalidate host competitions, individual raffle details, public cards, and admin tables
      queryClient.invalidateQueries({ queryKey: raffleKeys.host() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: raffleKeys.details() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.public() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.adminAll() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.adminPending() });
    },
  });
};

export const useCreateRaffle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRaffleData) => raffleService.createRaffle(data),
    onSuccess: () => {
      // Synchronize host competitions, host overview stats, and admin approval queues
      queryClient.invalidateQueries({ queryKey: raffleKeys.host() });
      queryClient.invalidateQueries({ queryKey: hostKeys.overview() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.adminPending() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.adminAll() });
    },
  });
};

export const useUploadRaffleImage = () => {
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      raffleService.uploadRaffleImage(id, file),
  });
};

export const useDeleteRaffle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => raffleService.deleteRaffle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: raffleKeys.host() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.public() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.adminAll() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.adminPending() });
      queryClient.invalidateQueries({ queryKey: hostKeys.overview() });
    },
  });
};

export const useAdminPendingRaffles = () => {
  return useQuery({
    queryKey: raffleKeys.adminPending(),
    queryFn: raffleService.getPendingApprovals,
  });
};

export const useApproveRaffle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => raffleService.approveRaffle(id),
    onSuccess: () => {
      // Synchronize admin queues, admin lists, host competitions, public showcase, and admin dashboard stats
      queryClient.invalidateQueries({ queryKey: raffleKeys.adminPending() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.adminAll() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.host() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.public() });
      queryClient.invalidateQueries({ queryKey: adminKeys.overviewStats() });
    },
  });
};

export const useRaffleWinners = (raffleId: string) => {
  return useQuery({
    queryKey: raffleKeys.winners(raffleId),
    queryFn: () => raffleService.getWinners(raffleId),
    enabled: !!raffleId,
  });
};

export const useDrawWinner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (raffleId: string) => raffleService.drawWinner(raffleId),
    onSuccess: (_, raffleId) => {
      // Cross-role invalidation across raffle details, public winners, host competitions, admin metrics, and user prizes
      queryClient.invalidateQueries({ queryKey: raffleKeys.detail(raffleId) });
      queryClient.invalidateQueries({ queryKey: raffleKeys.details() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.public() });
      queryClient.invalidateQueries({ queryKey: winnerKeys.public() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.host() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.winners(raffleId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.overviewStats() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.my() });
      queryClient.invalidateQueries({ queryKey: winnerKeys.my() });
    },
  });
};

export const useAdminAllRaffles = (params?: {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: raffleKeys.adminAll(params),
    queryFn: () => raffleService.getAdminAllRaffles(params),
  });
};

export const useAdminDeleteRaffle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => raffleService.adminDeleteRaffle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: raffleKeys.adminAll() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.adminPending() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.public() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.host() });
      queryClient.invalidateQueries({ queryKey: adminKeys.overviewStats() });
    },
  });
};
