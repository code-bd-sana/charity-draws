/**
 * Centralized Type-Safe Query Key Factory
 *
 * Defines hierarchical query key namespaces for raffles, tickets, winners,
 * hosts, admin queues, subscriptions, and user sessions to enable precise
 * prefix-based and single-query cache invalidations across multi-tenant views.
 */

export const raffleKeys = {
  all: ['raffles'] as const,
  lists: () => [...raffleKeys.all, 'list'] as const,
  public: (params?: unknown) =>
    params !== undefined
      ? ([...raffleKeys.all, 'public', params] as const)
      : ([...raffleKeys.all, 'public'] as const),
  details: () => [...raffleKeys.all, 'detail'] as const,
  detail: (idOrSlug: string) => [...raffleKeys.details(), idOrSlug] as const,
  host: (params?: unknown) =>
    params !== undefined
      ? ([...raffleKeys.all, 'host', params] as const)
      : ([...raffleKeys.all, 'host'] as const),
  admin: () => [...raffleKeys.all, 'admin'] as const,
  adminAll: (params?: unknown) =>
    params !== undefined
      ? ([...raffleKeys.admin(), 'all', params] as const)
      : ([...raffleKeys.admin(), 'all'] as const),
  adminPending: () => [...raffleKeys.admin(), 'pending'] as const,
  winners: (raffleId: string) => [...raffleKeys.all, 'winners', raffleId] as const,
};

export const ticketKeys = {
  all: ['tickets'] as const,
  my: () => [...ticketKeys.all, 'my'] as const,
};

export const winnerKeys = {
  all: ['winners'] as const,
  my: () => [...winnerKeys.all, 'my'] as const,
  public: (params?: unknown) =>
    params !== undefined
      ? ([...winnerKeys.all, 'public', params] as const)
      : ([...winnerKeys.all, 'public'] as const),
  admin: () => [...winnerKeys.all, 'admin'] as const,
  adminList: (params?: unknown) =>
    params !== undefined
      ? ([...winnerKeys.admin(), 'list', params] as const)
      : ([...winnerKeys.admin(), 'list'] as const),
  adminStats: (filter?: string) =>
    filter !== undefined
      ? ([...winnerKeys.admin(), 'stats', filter] as const)
      : ([...winnerKeys.admin(), 'stats'] as const),
};

export const hostKeys = {
  all: ['hosts'] as const,
  overview: () => [...hostKeys.all, 'overview'] as const,
  wallet: () => [...hostKeys.all, 'wallet'] as const,
  walletStats: () => [...hostKeys.wallet(), 'stats'] as const,
  walletHistory: () => [...hostKeys.wallet(), 'history'] as const,
  sales: (range?: unknown) =>
    range !== undefined
      ? ([...hostKeys.all, 'sales', range] as const)
      : ([...hostKeys.all, 'sales'] as const),
  performance: (timeframe?: string) =>
    timeframe !== undefined
      ? ([...hostKeys.all, 'performance', timeframe] as const)
      : ([...hostKeys.all, 'performance'] as const),
  adminList: (params?: unknown) =>
    params !== undefined
      ? ([...hostKeys.all, 'admin', 'list', params] as const)
      : ([...hostKeys.all, 'admin', 'list'] as const),
  adminStats: () => [...hostKeys.all, 'admin', 'stats'] as const,
};

export const adminKeys = {
  all: ['admin'] as const,
  users: (params?: unknown) =>
    params !== undefined
      ? ([...adminKeys.all, 'users', params] as const)
      : ([...adminKeys.all, 'users'] as const),
  usersStats: () => [...adminKeys.all, 'users', 'stats'] as const,
  hostStats: () => [...adminKeys.all, 'host-stats'] as const,
  orders: (params?: unknown) =>
    params !== undefined
      ? ([...adminKeys.all, 'orders', params] as const)
      : ([...adminKeys.all, 'orders'] as const),
  ordersStats: () => [...adminKeys.all, 'orders-stats'] as const,
  overviewStats: () => [...adminKeys.all, 'overview-stats'] as const,
  logs: (params?: unknown) =>
    params !== undefined
      ? ([...adminKeys.all, 'logs', params] as const)
      : ([...adminKeys.all, 'logs'] as const),
  withdrawals: () => [...adminKeys.all, 'withdrawals'] as const,
};

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  my: () => [...subscriptionKeys.all, 'my'] as const,
  myBilling: () => [...subscriptionKeys.all, 'billing'] as const,
  adminAll: () => [...subscriptionKeys.all, 'admin', 'all'] as const,
  adminStats: () => [...subscriptionKeys.all, 'admin', 'stats'] as const,
};

export const userKeys = {
  all: ['user'] as const,
  current: () => [...userKeys.all, 'current'] as const,
};
