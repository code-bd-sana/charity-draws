## 1. Environment Configuration Templates

- [ ] 1.1 Create `backend/.env.example` with documented keys for `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `FRONTEND_URL`, and Stripe/Cashflows keys, verifying completeness
- [ ] 1.2 Create `frontend/.env.example` with documented keys for `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, and `BACKEND_API_URL`, verifying completeness

## 2. Seed Data & Demo Personas Verification

- [ ] 2.1 Verify `npm run admin:seed` executes cleanly and creates Admin, Host, and Client personas, verifying user records in PostgreSQL

## 3. Operations Runbook & Documentation

- [ ] 3.1 Update `README.md` with complete architecture overview, setup instructions, test commands, and production build guides, verifying format and links
- [ ] 3.2 Verify Swagger OpenAPI documentation endpoints in `backend/src/main.ts`, verifying `/api` documentation integrity
