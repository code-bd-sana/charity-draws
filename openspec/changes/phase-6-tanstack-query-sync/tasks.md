## 1. Query Key Factory Implementation

- [ ] 1.1 Create `frontend/hooks/queryKeys.ts` defining structured factory keys for raffles, tickets, winners, hosts, admin, and subscriptions, verifying type definitions and export structure

## 2. Raffle & Ticket Hooks Synchronization

- [ ] 2.1 Refactor `frontend/hooks/useRaffleHooks.ts` to use `raffleKeys` and enforce cross-role invalidations across creation, update, approval, delete, and winner draws, verifying public and host table sync
- [ ] 2.2 Refactor `frontend/hooks/useTicketHooks.ts` to use `ticketKeys` and invalidate raffle inventory, user tickets, instant wins, host sales, and admin orders on ticket purchase, verifying inventory updates

## 3. Host Wallet & Admin Hooks Synchronization

- [ ] 3.1 Refactor `frontend/hooks/useHostWalletHooks.ts` to use `hostKeys` and synchronize withdrawal requests with admin queues, verifying wallet balance and transaction history refetches
- [ ] 3.2 Refactor `frontend/hooks/useAdminHooks.ts` and `frontend/hooks/useSubscriptionHooks.ts` to use `adminKeys` and `subscriptionKeys`, verifying admin status mutations trigger host updates

## 4. Background Polling & Verification

- [ ] 4.1 Configure 15-second background polling interval for active draws on the live raffle details page, verifying automatic ticket inventory updates
- [ ] 4.2 Run `npm run build` in `frontend/` and verify zero TypeScript or Next.js compilation errors
