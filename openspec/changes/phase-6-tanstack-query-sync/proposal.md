## Why

TanStack Query caches across the Charity Draws frontend currently suffer from inconsistent query keys and incomplete cache invalidation rules across multi-role workflows. Mutations such as ticket purchasing, raffle creation/approvals, and withdrawal requests fail to invalidate cross-role queries (e.g. remaining ticket inventory, instant win prize tables, host wallet balances, and admin approval queues), resulting in stale data and requiring manual browser refreshes.

## What Changes

- **Query Key Factory Standardization**:
  - Establish a centralized, type-safe query key factory (`raffleKeys`, `ticketKeys`, `winnerKeys`, `hostKeys`, `adminKeys`, `subscriptionKeys`) to replace ad-hoc query string arrays across all frontend hooks.
- **Comprehensive Cross-Role Mutation Cache Invalidations**:
  - `usePurchaseTicketsMutation`: Invalidate public raffle cards, raffle detail inventory, client tickets, client winners (instant win sync), host sales overview, and admin order queues.
  - `useCreateRaffle` & `useUpdateRaffle`: Invalidate host competitions, host overview stats, admin pending approvals, and admin all raffles.
  - `useApproveRaffle` & `useAdminDeleteRaffle`: Invalidate admin pending queue, admin all raffles, public raffle grid, host competitions, and admin dashboard stats.
  - `useDrawWinner`: Invalidate raffle detail, public raffles, public winners list, host competitions, client tickets, client winners, and admin dashboard stats.
  - `useRequestWithdrawalMutation` & `useUpdateWithdrawalStatusMutation`: Synchronize host wallet balances, withdrawal history, and admin withdrawal queues bidirectionally.
- **Live Inventory Polling Configuration**:
  - Configure automatic background refetch intervals for live raffle inventory on active public raffle detail pages.

## Capabilities

### New Capabilities
- `tanstack-cache-sync`: Defines requirements for automated cache invalidation, prefix-based query key synchronization, and zero stale state across all multi-tenant roles.

### Modified Capabilities
<!-- None: No existing specs in openspec/specs/ are being modified -->

## Impact

- **Frontend Code**: `frontend/hooks/queryKeys.ts` [NEW], `frontend/hooks/useRaffleHooks.ts`, `frontend/hooks/useTicketHooks.ts`, `frontend/hooks/useHostWalletHooks.ts`, `frontend/hooks/useAdminHooks.ts`, `frontend/hooks/useSubscriptionHooks.ts`, `frontend/hooks/useUserHooks.ts`.
- **Dependencies**: Uses existing `@tanstack/react-query` v5 setup.
- **API/Contracts**: Zero backend schema or endpoint modifications.
