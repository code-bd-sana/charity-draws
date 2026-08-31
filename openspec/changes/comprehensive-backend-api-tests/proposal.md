## Why

The Charity Draws NestJS backend currently has less than 1% test coverage with broken placeholder spec files and no automated validation for mission-critical operations (ticket purchases, instant-win assignment, winner draws, wallet balances, withdrawals, and role-based access). Establishing a comprehensive automated test suite is necessary to prevent financial discrepancies, overselling bugs, unauthorized access regressions, and broken production deployments.

## What Changes

- **Test Infrastructure & Fixtures**: Establish reusable Prisma mock factories, authentication cookie helpers (Client, Host, Admin), and isolated Supertest harness.
- **Fix Existing Broken Spec Suites**: Resolve missing provider dependencies in `HostsService` and `HostsController` unit specs.
- **Authentication & Security Unit/Integration Tests**: Test JWT cookie parsing, role-based guards (`RolesGuard`, `JwtAuthGuard`), email verification, and password reset hash fragments.
- **Financial & Gaming Core Unit Tests**: Comprehensive unit tests for `TicketsService` (Fisher-Yates random allocation, concurrency cap, instant-win claim, wallet balance incrementation) and `RafflesService.drawWinner`.
- **Host & Admin Domain Unit Tests**: Unit tests covering host wallet calculations, 10% platform fees, withdrawal requests/rejection refunds, order refunds, host approvals, and user suspension.
- **End-to-End (E2E) User Journey Suites**: Supertest API suites validating full workflows for Auth, Raffle Lifecycle (Draft -> Approval -> Live -> Ticket Purchase -> Winner Draw -> Ended), Host Withdrawal Lifecycle, and Admin operations.

## Capabilities

### New Capabilities
- `backend-api-testing`: Automated unit, integration, and E2E test coverage across all 63 API endpoints, security guards, database transactions, and background cron tasks.

### Modified Capabilities
<!-- None. No existing specs currently in openspec/specs/. -->

## Impact

- **Affected Code**: `backend/src/**/*.spec.ts`, `backend/test/**/*.e2e-spec.ts`, and test helpers/fixtures in `backend/test/helpers/`.
- **Dependencies**: Uses existing `@nestjs/testing`, `jest`, `supertest`, `ts-jest` devDependencies.
- **APIs & Database**: No modifications to production API schemas or runtime database schema.
