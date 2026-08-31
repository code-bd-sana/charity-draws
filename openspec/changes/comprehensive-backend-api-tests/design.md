## Context

The Charity Draws backend is built on NestJS 11, Prisma 7 (with `@prisma/adapter-pg`), PostgreSQL, class-validator, and express-session/cookie-parser. See `proposal.md` for motivation.

All protected API endpoints require an `accessToken` cookie extracted by `JwtAuthGuard` and role validation via `RolesGuard`. The testing framework uses Jest with `ts-jest` and `supertest`.

## Goals / Non-Goals

**Goals:**
- Provide comprehensive unit test suites for all services (`AuthService`, `TicketsService`, `RafflesService`, `HostsService`, `SubscriptionsService`, `CategoriesService`, `Admin*Service`, `MailService`, `DrawSchedulerService`).
- Provide unit tests for security guards (`JwtAuthGuard`, `RolesGuard`), interceptors (`TransformInterceptor`), and filters (`AllExceptionsFilter`).
- Fix existing broken unit tests in `HostsController` and `HostsService`.
- Build reusable test helper utilities: `PrismaServiceMock` (deep mock factory) and `AuthCookieHelper` (token & cookie forging for Client, Host, Admin).
- Implement End-to-End (E2E) integration test suites using Supertest to validate complete multi-step user and host journeys.
- Achieve clean passing execution across `npm run test` and `npm run test:e2e`.

**Non-Goals:**
- Modifying production application logic or schema unless fixing an uncovered bug.
- Frontend UI testing (Cypress/Playwright).
- Stress or performance load testing (k6/JMeter).

## Decisions

### 1. Mocking Strategy: Deep Prisma Mock Factory for Unit Tests
- **Decision**: Use a typed mock factory (`createPrismaMock()`) that mocks Prisma Client models (`user`, `hostProfile`, `raffle`, `ticket`, `instantWin`, `winner`, `transaction`, `withdrawal`, `subscriptionPlan`, `hostSubscription`, `category`) and transaction runner `$transaction(cb)`.
- **Rationale**: Keeps unit tests sub-second fast, deterministic, independent of a running database server, and friendly to CI/CD pipelines.
- **Alternatives Considered**:
  - *In-memory SQLite with Prisma*: Rejected due to incompatible schema types (PostgreSQL UUIDs, Decimals, VarChar lengths, and Prisma 7 pg adapter).
  - *Spinning PostgreSQL container for every unit test*: Rejected as it introduces heavy latency and setup overhead for simple logic tests.

### 2. Cookie Authentication Helper for Supertest E2E
- **Decision**: Create an `AuthCookieHelper` that uses `@nestjs/jwt` and the configured `JWT_SECRET` to forge signed JWT payloads matching `CLIENT`, `HOST`, and `ADMIN` roles, serializing them into standard HTTP request cookies (`Cookie: accessToken=...`).
- **Rationale**: Allows testing guarded endpoints realistically without coupling every test to a real login HTTP trip.
- **Alternatives Considered**:
  - *Calling POST /login before every single test*: Slower and introduces cascade failures across tests if login setup encounters an error.

### 3. Test File Layout & Organization
- **Decision**:
  - Unit tests co-located next to their source files: `src/**/*.spec.ts`.
  - Integration/E2E test files located in `test/*.e2e-spec.ts`.
  - Shared test helpers located in `test/helpers/`: `prisma-mock.helper.ts`, `auth-fixture.helper.ts`, `test-app.helper.ts`.
- **Rationale**: Adheres to standard NestJS conventions and aligns with Jest configurations in `package.json` and `test/jest-e2e.json`.

## Risks / Trade-offs

- **[Prisma $transaction mock fidelity]** → Mitigation: `createPrismaMock()` must support both array-based `$transaction([p1, p2])` and interactive callback-based `$transaction(async (tx) => { ... })` passing the mock client as `tx`.
- **[E2E middleware discrepancy]** → Mitigation: `test-app.helper.ts` must apply `app.use(cookieParser())`, `ValidationPipe`, `TransformInterceptor`, and `AllExceptionsFilter` identically to `main.ts`.
