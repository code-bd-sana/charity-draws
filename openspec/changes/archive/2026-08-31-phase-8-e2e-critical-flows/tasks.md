## 1. E2E Test Harness & Auth Helpers

- [x] 1.1 Create `backend/test/helpers/e2e-auth.helper.ts` for generating authenticated JWT session cookies across ADMIN, HOST, and CLIENT roles, verifying token structure and cookie formatting
- [x] 1.2 Configure `backend/test/jest-e2e.json` for sequential and isolated E2E test execution, verifying test pattern matching

## 2. Critical User Journey E2E Suites

- [x] 2.1 Implement `backend/test/auth-journey.e2e-spec.ts` covering registration, email verification, login, session inspection, and logout, verifying HTTP status codes and cookie headers
- [x] 2.2 Implement `backend/test/raffle-lifecycle.e2e-spec.ts` covering host creation, admin approval, public marketplace indexing, and winner draw execution, verifying database state transitions
- [x] 2.3 Implement `backend/test/ticket-purchase.e2e-spec.ts` covering multi-ticket orders, instant-win allocation, and user ticket list reflection, verifying atomic ticket allocation
- [x] 2.4 Implement `backend/test/host-payout-cycle.e2e-spec.ts` covering revenue accumulation, host withdrawal requests, and admin status updates, verifying balance calculations

## 3. Test Suite Verification

- [x] 3.1 Execute `npm run test:e2e` in `backend/` and verify all test suites execute and pass with zero failures
