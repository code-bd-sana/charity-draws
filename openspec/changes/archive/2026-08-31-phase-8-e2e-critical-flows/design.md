## Context

See `proposal.md` for motivation. The backend is a modular NestJS 11 application with Prisma ORM and PostgreSQL. The application currently has mock-based unit tests but requires integrated end-to-end (E2E) suites executing across real HTTP endpoints, cookie-based session guards, and PostgreSQL database queries.

## Goals / Non-Goals

**Goals:**
- Construct a robust, fast-running Supertest integration harness in `backend/test/` with reusable authentication and session simulation helpers.
- Implement 4 critical end-to-end test suites verifying:
  1. Complete authentication journey (`auth-journey.e2e-spec.ts`).
  2. Multi-step host competition lifecycle, admin approval, and winner draw (`raffle-lifecycle.e2e-spec.ts`).
  3. Customer ticket checkout, atomic ticket allocation, and instant win prize assignment (`ticket-purchase.e2e-spec.ts`).
  4. Host revenue accumulation, wallet balance calculations, and admin withdrawal moderation (`host-payout-cycle.e2e-spec.ts`).
- Integrate the E2E suites into `npm run test:e2e` in `backend/package.json`.

**Non-Goals:**
- Modifying production database schemas or removing existing unit tests.
- Integrating external live Stripe / PayPal payment gateways during automated test runs (simulated checkout is used).

## Decisions

### Decision 1: Supertest-Driven Full-Stack NestJS Testing Module
- **Rationale**: Utilizing `@nestjs/testing` with `TestingModule` and `supertest` executes full HTTP request/response lifecycles, global pipes (validation), interceptors, and Prisma database transactions with minimal execution overhead and 100% deterministic test results.
- **Alternatives considered**: Mocking controllers directly (rejected: does not test cookie serialization, auth guards, or database constraint violations).

### Decision 2: Reusable E2E Auth Helper (`e2e-auth.helper.ts`)
- **Rationale**: Creating a helper function that generates signed JWT tokens and HttpOnly cookie headers for `ADMIN`, `HOST`, and `CLIENT` personas eliminates repetitive boilerplate across test suites while accurately testing role-based access guards.
- **Alternatives considered**: Logging in via HTTP before every single test assertion (rejected: adds unnecessary network latency to test runs).

### Decision 3: Deterministic Data Seeding & Teardown
- **Rationale**: Each test suite uses unique prefixes (e.g. `e2e_raffle_...`) and clean-up hooks (`afterAll`) to guarantee zero interference with existing demo data.

## Risks / Trade-offs

- **[Risk] Test database state pollution between test runs** → *Mitigation*: Test suites clean up created entities in `afterAll` blocks or isolate test entities using unique UUID prefixes.
- **[Risk] Slower test execution time compared to pure unit tests** → *Mitigation*: Run E2E tests in a dedicated `npm run test:e2e` script rather than during fast unit test watch mode.
