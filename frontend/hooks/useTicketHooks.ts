import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { ticketKeys, raffleKeys, winnerKeys, hostKeys, adminKeys } from './queryKeys';

export const usePurchaseTicketsMutation = (raffleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quantity: number) => {
      const response = await api.post(`/tickets/purchase/${raffleId}`, { quantity });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate raffle inventory, public listings, user tickets, instant win prizes, host sales, and admin queues
      queryClient.invalidateQueries({ queryKey: raffleKeys.detail(raffleId) });
      queryClient.invalidateQueries({ queryKey: raffleKeys.details() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.public() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.my() });
      queryClient.invalidateQueries({ queryKey: winnerKeys.my() });
      queryClient.invalidateQueries({ queryKey: hostKeys.overview() });
      queryClient.invalidateQueries({ queryKey: hostKeys.sales() });
      queryClient.invalidateQueries({ queryKey: adminKeys.orders() });
      queryClient.invalidateQueries({ queryKey: adminKeys.ordersStats() });
      queryClient.invalidateQueries({ queryKey: adminKeys.overviewStats() });
    },
  });
};

export interface UserTicketsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface UserTicketsResponse {
  tickets: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalOwned: number;
    activeTickets: number;
    wonTickets: number;
  };
}

export const useMyTicketsQuery = (params?: UserTicketsQueryParams) => {
  return useQuery<UserTicketsResponse | any[]>({
    queryKey: ticketKeys.my(params),
    queryFn: async () => {
      const response = await api.get('/tickets/my-tickets', { params });
      return response.data;
    },
  });
};
