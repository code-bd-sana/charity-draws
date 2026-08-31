
## 1. Test Harness, Helpers & Baseline Fixes

- [x] 1.1 Create reusable Prisma mock factory in `test/helpers/prisma-mock.helper.ts` and verify unit test instantiation
- [x] 1.2 Create authentication cookie fixture helper and Supertest app bootstrap in `test/helpers/` and verify token generation
- [x] 1.3 Fix existing broken unit tests in `src/hosts/hosts.service.spec.ts` and `src/hosts/hosts.controller.spec.ts` and verify `npm test` runs with 0 failures

## 2. Common Security, Guards & Middleware Tests

- [x] 2.1 Implement unit tests for `JwtAuthGuard` in `src/common/guards/jwt-auth.guard.spec.ts` and verify cookie extraction and error assertions pass
- [x] 2.2 Implement unit tests for `RolesGuard` in `src/common/guards/roles.guard.spec.ts` and verify role-based access rejection passes
- [x] 2.3 Implement unit tests for `TransformInterceptor` and `AllExceptionsFilter` in `src/common/` and verify payload wrapping passes

## 3. Core Domain Unit Tests (Auth, Users, Tickets & Raffles)

- [x] 3.1 Implement unit tests for `AuthService` and `AuthController` in `src/auth/` and verify registration, login, verification, and reset password tests pass
- [x] 3.2 Implement unit tests for `TicketsService` and `TicketsController` in `src/tickets/` and verify ticket purchase, capacity limits, instant wins, and wallet credit pass
- [x] 3.3 Implement unit tests for `RafflesService` and `RafflesController` in `src/raffles/` and verify creation quotas, winner drawing, and deletion pass
- [x] 3.4 Implement unit tests for `DrawSchedulerService` in `src/raffles/draw-scheduler.service.spec.ts` and verify cron auto-draw execution passes
- [x] 3.5 Implement unit tests for `UsersService` and `UsersController` in `src/users/` and verify profile, password change, and winner listing pass

## 4. Financials, Subscriptions & Admin Unit Tests

- [x] 4.1 Implement unit tests for `HostsService` in `src/hosts/` and verify wallet math, 10% fee calculation, withdrawals, and sales analytics pass
- [x] 4.2 Implement unit tests for `PaymentService` and `SubscriptionsService` in `src/payment/` and `src/subscriptions/` and verify webhook and MRR calculations pass
- [x] 4.3 Implement unit tests for Admin services (`AdminHostsService`, `AdminOrdersService`, `AdminUsersService`, `AdminWinnersService`, `AdminWithdrawalsService`, `AdminDashboardService`) and verify admin operation tests pass
- [x] 4.4 Implement unit tests for `CategoriesService` and `MailService` and verify CRUD and email dispatch tests pass

## 5. End-to-End (E2E) Integration Test Suites

- [x] 5.1 Implement E2E suite for Authentication & Authorization in `test/auth.e2e-spec.ts` and verify with `npm run test:e2e`
- [x] 5.2 Implement E2E suite for Raffle Lifecycle & Ticket Purchases in `test/raffles-lifecycle.e2e-spec.ts` and verify with `npm run test:e2e`
- [x] 5.3 Implement E2E suite for Host Financials & Admin Operations in `test/admin-operations.e2e-spec.ts` and verify with `npm run test:e2e`
- [x] 5.4 Run full test suite with coverage `npm run test:cov` and verify all tests pass with zero regressions
