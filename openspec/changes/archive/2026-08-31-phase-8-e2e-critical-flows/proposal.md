## Why

The Charity Draws platform requires automated end-to-end verification across the complete multi-tenant lifecycle: user registration, host competition creation with instant-win allocations, high-concurrency ticket purchasing, and administrator raffle approval / winner draws. Automating these end-to-end user journeys ensures zero regressions in transactional integrity, role access guards, and cross-dashboard state synchronization.

## What Changes

- **E2E Test Architecture Setup**:
  - Configure full-stack Supertest integration suites in `backend/test/` covering all major API controllers and transactional database interactions.
  - Implement reusable test helpers for auth sessions, test database seeding, and cleanup.
- **Critical User Journey Automated Test Suites**:
  - `auth-journey.e2e-spec.ts`: User registration, email verification, cookie session persistence, `/auth/me`, and logout.
  - `raffle-lifecycle.e2e-spec.ts`: Host competition creation with instant wins, submission, admin pending queue verification, approval, public marketplace visibility, and draw execution.
  - `ticket-purchase.e2e-spec.ts`: Concurrent ticket purchasing, atomic stock deduction, instant-win claim generation, and customer order history verification.
  - `host-payout-cycle.e2e-spec.ts`: Ticket sales revenue accumulation, host wallet balance calculations, withdrawal request dispatch, and administrator payout approval/rejection.

## Capabilities

### New Capabilities
- `e2e-workflow-verification`: Defines requirements for automated multi-role end-to-end workflow testing, transactional database isolation, and contract verification across customer, host, and admin personas.

### Modified Capabilities
<!-- None: No existing specs in openspec/specs/ are being modified -->

## Impact

- **Backend Code**: `backend/test/auth-journey.e2e-spec.ts`, `backend/test/raffle-lifecycle.e2e-spec.ts`, `backend/test/ticket-purchase.e2e-spec.ts`, `backend/test/host-payout-cycle.e2e-spec.ts`, `backend/test/helpers/e2e-auth.helper.ts`.
- **Scripts**: `npm run test:e2e` in `backend/package.json`.
- **API/Contracts**: Zero production code regressions or breaking schema changes.
