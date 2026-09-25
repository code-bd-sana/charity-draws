## Context

See `proposal.md` for motivation. The TanStack Query v5 cache layer manages server state across consumer, host, and administrator dashboard views. Ad-hoc query key string definitions currently lead to partial cache invalidations when multi-tenant mutations occur.

## Goals / Non-Goals

**Goals:**
- Implement a centralized Query Key Factory (`frontend/hooks/queryKeys.ts`) ensuring consistent hierarchical query keys.
- Update all mutation hooks across `useRaffleHooks`, `useTicketHooks`, `useHostWalletHooks`, `useAdminHooks`, `useSubscriptionHooks`, and `useUserHooks` to perform complete cross-role cache invalidations.
- Implement background refetching on the live raffle details page (`refetchInterval: 15_000`) for high-concurrency ticket counts.

**Non-Goals:**
- Introducing WebSockets or Server-Sent Events (SSE) (polling + optimistic query invalidations are sufficient for current scale).
- Altering database schema or backend controller response payloads.

## Decisions

### Decision 1: Centralized Query Key Factory (`queryKeys.ts`)
- **Rationale**: Organizing query keys into namespaced factories (e.g. `raffleKeys`, `ticketKeys`, `hostKeys`, `adminKeys`) allows prefix-based cache invalidation. For example, `queryClient.invalidateQueries({ queryKey: raffleKeys.all })` cleanly targets all raffle lists, details, and filtered views without missing individual variations.
- **Alternatives considered**: Continuing with inline string arrays in each hook (rejected: causes typos, mismatched keys, and missed invalidation targets).

### Decision 2: Multi-Role Invalidation on Critical Mutations
- **Rationale**:
  - `usePurchaseTicketsMutation`: Invalidates `ticketKeys.my()`, `winnerKeys.my()`, `raffleKeys.detail(id)`, `raffleKeys.public()`, `hostKeys.overview()`, and `adminKeys.orders()`.
  - `useCreateRaffle` / `useApproveRaffle` / `useDrawWinner`: Invalidates host, admin, and public query scopes simultaneously.
  - `useRequestWithdrawalMutation` / `useUpdateWithdrawalStatusMutation`: Invalidates host wallet and admin withdrawal queues bidirectionally.
- **Alternatives considered**: Leaving cache invalidation to manual page refreshes (rejected: leads to stale ticket counters and confusing UX).

### Decision 3: Polling Strategy for Active Draws
- **Rationale**: On `/live-raffles/[slug]`, configure `refetchInterval: 15_000` when the competition status is `ACTIVE` and end date is within 24 hours to keep ticket stock fresh during peak purchasing periods.

## Risks / Trade-offs

- **[Risk] Excessive network refetches on broad prefix invalidations** → *Mitigation*: TanStack Query only refetches active queries currently rendered on screen; inactive queries are marked stale and only refetched upon navigation.
- **[Risk] Race conditions between mutation response and background polling** → *Mitigation*: Ensure mutation callbacks explicitly await invalidation or set optimistic cache updates where appropriate.
