# CHARITY DRAWS — PROJECT DEVELOPMENT MASTER PLAN

> **Master Engineering Guide & Execution Plan**  
> **Project Scope**: Full-stack Charity Raffle & Competition Platform  
> **Target Delivery**: Production-Ready Release  
> **Document Version**: 1.0.0  

---

## 1. Project Overview

### Architecture Summary
**Charity Draws** is a modern, full-stack online raffle and competition platform connecting hosts (businesses, charities, individuals) with ticket buyers. It features dynamic instant-win prize allocations, automated draw scheduling, cash balance withdrawals, multi-tier host subscriptions, and comprehensive administrative oversight.

```
                  ┌─────────────────────────────────────────┐
                  │          Next.js 16 Frontend            │
                  │   (React 19, Tailwind v4, TanStack)     │
                  └────────────────────┬────────────────────┘
                                       │ HTTPS / HTTP-Only Cookies
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │           NestJS 11 Backend             │
                  │   (REST APIs, Guards, Schedule Module)  │
                  └──────────┬───────────────────┬──────────┘
                             │                   │
                             ▼                   ▼
                  ┌───────────────────┐ ┌───────────────────┐
                  │ Prisma ORM / Postgres│ │ Cashflows Gateway │
                  │  (10 Models DB)   │ │ & Mailer Service  │
                  └───────────────────┘ └───────────────────┘
```

### Technology Stack breakdown

| Layer | Technologies & Frameworks | Key Responsibilities |
|---|---|---|
| **Frontend Platform** | Next.js 16 (App Router), React 19, TypeScript | Server Components, Client Dashboard Views, Public SSR |
| **Styling & UI** | TailwindCSS v4, Lucide React, Recharts, Sonner | Premium aesthetic, Responsive layouts, Data visuals, Toast alerts |
| **Frontend State & Data** | TanStack Query v5, Axios | Server state caching, optimistic updates, background polling |
| **Backend Framework** | NestJS 11, Express, TypeScript | Modular architecture, REST Controllers, Services, DTOs |
| **Database & ORM** | PostgreSQL, Prisma ORM 7.8 | Type-safe queries, migration management, relational schema |
| **Authentication** | JWT, HttpOnly Cookies, Passport-JWT, Bcrypt | Secure role-based session management (`CLIENT`, `HOST`, `ADMIN`) |
| **Scheduled Tasks** | `@nestjs/schedule`, Node-Cron | Automated raffle expiry checks and draw winner trigger execution |
| **Payments & Billing** | Cashflows Gateway (SHA-512 API / Webhook), Test Mode | Subscription checkouts, ticket purchases, webhook allocations |
| **File Storage** | Multer, Static Serve (`/uploads`) | Cover images, user avatars, raffle prize banners |

---

## 2. Current Project Status

### Completed Functionality
- **Database Schema**: 10 Prisma models fully defined (`User`, `HostProfile`, `SubscriptionPlan`, `HostSubscription`, `Raffle`, `InstantWin`, `Transaction`, `Ticket`, `Winner`, `Withdrawal`, `Category`).
- **Backend Core**: Auth endpoints (`register`, `login`, `logout`, `me`, `verify-email`, `forgot-password`, `reset-password`), Raffle endpoints (`public/stats`, `live-stats`, `recent-winners`, host CRUD, admin approvals), Ticket purchasing & allocation logic, Host wallet & withdrawal requests, Cashflows subscription checkout and webhook confirmation logic.
- **Frontend Pages**: Public pages (Landing, Live Raffles, Raffle Details, Winners, Verified Hosts, Host Profile, How It Works, Pricing, Contact, Legal pages), Auth pages (Login, Register, Host Register, Password Reset, Email Verification), Multi-tenant Dashboards (User, Host, Admin).
- **TanStack Query Hooks**: Integrated custom hooks (`useAdminHooks`, `useAuthHooks`, `useHostWalletHooks`, `useRaffleHooks`, `useSubscriptionHooks`, `useTicketHooks`, `useUserHooks`).

### Partially Completed Functionality
- **Form Feedback & UX**: Registration button loading states and field error highlights require polish across all auth forms.
- **Host Withdrawal Flow**: Backend wallet calculation and request creation are present; frontend payout modal needs error message handling for insufficient funds.
- **Category Management**: Prisma model and CRUD service exist, but admin UI dropdown integration needs real-time dynamic sync.
- **OpenSpec & Specifications**: OpenSpec configuration initialized with active change `comprehensive-backend-api-tests`; main specifications require sync.

### Missing Functionality
- **Frontend Automated Tests**: No Vitest, React Testing Library, or Playwright setup in `frontend/package.json`.
- **Backend Unit Test Coverage**: Only 3 basic spec files (`app.controller.spec.ts`, `hosts.controller.spec.ts`, `hosts.service.spec.ts`). Unit tests for `RafflesService`, `TicketsService`, `PaymentService`, `AuthService`, and `AdminService` are missing.
- **E2E Test Suite**: Minimal default Jest E2E test in `backend/test/app.e2e-spec.ts`.

### Existing Technical Risks
- **Concurrency Risk in Ticket Purchases**: Simultaneous purchase requests for low-stock tickets could suffer from race conditions if not wrapped in strict Prisma transaction locks.
- **Test Coverage Gaps**: Critical business logic (instant win claim logic, draw winner calculation, ticket allocation) lacks unit test coverage.
- **Mobile Viewport Overflow**: Complex administrative tables (e.g., Orders, Users, Withdrawals) require horizontal touch scrolling polish on mobile viewports (<640px).

---

## 3. Complete Feature Inventory

| Module / Feature | Backend API | Frontend View | Status | Notes / Action Items |
|---|---|---|---|---|
| **User Registration** | `POST /auth/register` | `/register` | COMPLETED | Needs button loading state polish |
| **Host Registration** | `POST /auth/register` | `/host/register` | COMPLETED | Automatic `HOST` role assignment & HostProfile creation |
| **Authentication & Cookie** | `POST /auth/login`, `GET /auth/me` | Global Auth Provider | COMPLETED | HttpOnly cookie storage working |
| **Password Reset Flow** | `POST /auth/forgot-password`, `reset-password` | `/forgot-password`, `/reset-password` | COMPLETED | Requires email template preview testing |
| **Email Verification** | `POST /auth/verify-email` | `/verify-email` | COMPLETED | Verification tokens stored and verified |
| **Raffle List (Public)** | `GET /raffles` | `/live-raffles` | COMPLETED | Supports search, filtering, category, sorting |
| **Raffle Details** | `GET /raffles/public/:slug` | `/live-raffles/[slug]` | COMPLETED | Shows instant wins table & live countdown |
| **Ticket Purchase** | `POST /tickets/purchase/:raffleId` | Raffle details modal | COMPLETED | Instant win allocation included |
| **Host Create Raffle Wizard** | `POST /raffles` | `/dashboard/host/create` | COMPLETED | Multi-step wizard with instant win setup |
| **Host My Competitions** | `GET /raffles/host/my-raffles` | `/dashboard/host/competitions` | COMPLETED | Supports status filtering (Draft, Active, Ended) |
| **Host Wallet & Payouts** | `GET /hosts/wallet`, `POST /hosts/withdraw` | `/dashboard/host/payouts` | PARTIAL | UI needs explicit fee breakdown display |
| **Host Subscriptions** | `POST /payment/checkout/subscription` | `/dashboard/host/billing` | COMPLETED | Cashflows gateway + Test mode bypass |
| **Admin Overview & Stats** | `GET /admin/dashboard/stats` | `/dashboard/admin` | COMPLETED | Metric cards and chart visualizations |
| **Admin Pending Approvals** | `GET /raffles/admin/pending` | `/dashboard/admin/approvals` | COMPLETED | Approve/Reject action triggers |
| **Admin Draw Winner** | `POST /raffles/admin/:id/draw` | `/dashboard/admin/draws` | COMPLETED | Manual & automatic draw execution |
| **Admin Withdrawals Manager** | `GET /admin/withdrawals` | `/dashboard/admin/withdrawals` | PARTIAL | Approval modal status updates need toast feedback |
| **Admin Category Manager** | `GET/POST/PATCH /categories` | `/dashboard/admin/categories` | COMPLETED | Category listing, creation, and toggling |
| **User My Tickets** | `GET /tickets/my-tickets` | `/dashboard/user/tickets` | COMPLETED | Shows ticket numbers and win status |
| **User My Wins** | `GET /users/my-winners` | `/dashboard/user/winners` | COMPLETED | Displays main draw + instant win prizes |
| **Verified Hosts Directory** | `GET /hosts/verified` | `/verified-hosts` | COMPLETED | Lists verified hosts with active counts |
| **Host Public Profile** | `GET /hosts/public/:slug` | `/hosts/[slug]` | COMPLETED | Displays host bio, stats, and active raffles |
| **Backend Unit Testing** | N/A | N/A | MISSING | Core services require unit test specs |
| **Frontend Automated Testing** | N/A | N/A | MISSING | Vitest & React Testing Library setup required |
| **E2E Testing Suite** | N/A | N/A | MISSING | Critical flow automation required |

---

## 4. Development Roadmap

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     10-PHASE DEVELOPMENT ROADMAP                        │
└─────────────────────────────────────────────────────────────────────────┘
  Phase 1: Project Exploration & Baseline Audit
     │
  Phase 2: OpenSpec Alignment & Architecture Specifications
     │
  Phase 3: Backend Security & Transaction Hardening
     │
  Phase 4: Comprehensive Backend Unit & Integration Testing
     │
  Phase 5: Frontend UI/UX, Form Validation & State Polish
     │
  Phase 6: TanStack Query Data Flow & API Sync Verification
     │
  Phase 7: Comprehensive Responsive UX & Screen QA
     │
  Phase 8: End-to-End (E2E) Critical Flow Testing
     │
  Phase 9: Production QA, Performance & Build Verification
     │
  Phase 10: Final Deployment & Client Delivery Checklist
```

### Phase Details

#### Phase 1 — Project Exploration & Baseline Audit
- **Goal**: Validate codebase integrity, database seeds, and environment configuration.
- **Tasks**: Inspect backend NestJS modules, frontend Next.js pages, Prisma schema, and Cashflows payment configuration.

#### Phase 2 — Architecture & OpenSpec Sync
- **Goal**: Formally map application specs in OpenSpec.
- **Tasks**: Generate baseline specs for auth, raffles, tickets, payment, and admin modules.

#### Phase 3 — Backend Security & Transaction Hardening
- **Goal**: Prevent ticket allocation race conditions and secure role endpoints.
- **Tasks**: Enforce Prisma `$transaction` isolation for ticket generation and instant-win claims.

#### Phase 4 — Backend Unit & Integration Testing
- **Goal**: Reach >85% unit test coverage on core business logic.
- **Tasks**: Write unit test suites for `RafflesService`, `TicketsService`, `PaymentService`, `AuthService`, and `AdminService`.

#### Phase 5 — Frontend UI/UX, Form Validation & State Polish
- **Goal**: Deliver a polished, error-resilient client experience.
- **Tasks**: Add form loading spinners, toast notifications, empty state indicators, and error boundaries.

#### Phase 6 — API Integration & TanStack Query Sync
- **Goal**: Guarantee zero stale state and smooth background updates.
- **Tasks**: Verify cache invalidations on ticket purchase, raffle creation, approval, and withdrawal requests.

#### Phase 7 — Responsive Design & Mobile Usability QA
- **Goal**: Flawless responsive layout across all standard device breakpoints.
- **Tasks**: Test and tune mobile drawers, sticky action bars, table scrollbars, and modal responsiveness.

#### Phase 8 — End-to-End (E2E) Testing
- **Goal**: Automate real user workflow verification.
- **Tasks**: Implement E2E tests for registration, host raffle creation, ticket purchase, and admin winner draw.

#### Phase 9 — Final QA & Build Verification
- **Goal**: Validate production build readiness.
- **Tasks**: Run `npm run build` on both frontend and backend; verify linting, environment variables, and bundle size.

#### Phase 10 — Production Delivery
- **Goal**: Execute final client delivery handover.
- **Tasks**: Final deployment verification, seed verification, and handover documentation.

---

## 5. OpenSpec Workflow

OpenSpec will govern all proposed changes, specifications, and test implementations during the project lifecycle.

```
       /openspec-explore ──► /openspec-propose ──► /openspec-update-change
                                                          │
                                                          ▼
       /openspec-archive-change ◄── /openspec-sync-specs ◄┘
```

| Phase | Recommended OpenSpec Command | Purpose in Project |
|---|---|---|
| **Phase 1** | `/openspec-explore` | Investigate current project structure, missing test setup, and API gaps |
| **Phase 2** | `/openspec-propose` | Create specification proposals for test suites and security hardening |
| **Phase 3-4** | `/openspec-update-change` | Track progress on backend security fixes and test implementation |
| **Phase 5-8** | `/openspec-sync-specs` | Synchronize completed implementation delta specs into main specs |
| **Phase 9-10** | `/openspec-archive-change` | Archive completed changes upon passing final QA verification |

---

## 6. OpenSpec Commands

Ready-to-use OpenSpec commands for execution:

### 1. Exploration Command
```bash
/openspec-explore
```
* **Prompt**: `"Investigate backend service test coverage and identify missing unit test files for RafflesService, TicketsService, PaymentService, and AuthService."`

### 2. Proposal Command
```bash
/openspec-propose
```
* **Prompt**: `"Propose a new change 'backend-unit-and-e2e-testing-suite' to create complete unit test specs for all NestJS services and controllers with >85% coverage."`

### 3. Update Change Command
```bash
/openspec-update-change
```
* **Prompt**: `"Update change 'backend-unit-and-e2e-testing-suite' with progress on TicketsService atomic transaction tests."`

### 4. Sync Specs Command
```bash
/openspec-sync-specs
```
* **Prompt**: `"Sync delta specs from 'backend-unit-and-e2e-testing-suite' into main openspec specs."`

### 5. Archive Change Command
```bash
/openspec-archive-change
```
* **Prompt**: `"Archive change 'backend-unit-and-e2e-testing-suite' following successful test execution."`

---

## 7. Backend Development Plan

### Overview
The NestJS backend in `backend/` handles database management, auth, payment, and cron scheduling.

### Implementation Tasks

```
  ┌─────────────────────────────────────────────────────────────┐
  │                    BACKEND TASK DEPENDENCIES                │
  └─────────────────────────────────────────────────────────────┘
    [B1: Transaction Locking] ──► [B2: Ticket Purchase Testing]
               │
               ▼
    [B3: Cashflows Webhook Fix] ──► [B4: Payment Service Tests]
               │
               ▼
    [B5: Cron Scheduler Audit] ──► [B6: E2E Integration Suite]
```

#### Task B1: Transaction Isolation in Ticket Allocation (High Priority)
* **File**: [tickets.service.ts](file:///Users/syedrakibhasan/projects/charity-draws/backend/src/tickets/tickets.service.ts)
* **Action**: Wrap ticket count checks and creation in Prisma `$transaction` with row-level locks or strict sequential validation to prevent over-selling.
* **Dependencies**: None. Can run immediately.

#### Task B2: Cashflows Webhook Signature Hardening (High Priority)
* **File**: [payment.service.ts](file:///Users/syedrakibhasan/projects/charity-draws/backend/src/payment/payment.service.ts)
* **Action**: Ensure SHA-512 signature comparison is strict in production while maintaining test-mode compatibility.
* **Dependencies**: None.

#### Task B3: Unit Test Suite for RafflesService (Medium Priority)
* **File**: `backend/src/raffles/raffles.service.spec.ts` [NEW]
* **Action**: Create mock Prisma context and test active raffle fetching, host creation, winner draw logic, and image upload handlers.
* **Dependencies**: Task B1.

#### Task B4: Unit Test Suite for TicketsService (Medium Priority)
* **File**: `backend/src/tickets/tickets.service.spec.ts` [NEW]
* **Action**: Create unit tests for ticket purchase validation, instant win matching, and user ticket queries.
* **Dependencies**: Task B1.

#### Task B5: Unit Test Suite for PaymentService (Medium Priority)
* **File**: `backend/src/payment/payment.service.spec.ts` [NEW]
* **Action**: Test subscription checkout creation, free tier activation, test payment simulation, and webhook processing.
* **Dependencies**: Task B2.

---

## 8. Frontend Development Plan

### Overview
The Next.js 16 frontend in `frontend/` provides responsive interfaces for clients, hosts, and admins.

### Implementation Tasks

#### Task F1: Auth Form Loading & Feedback States (High Priority)
* **Files**: [page.tsx](file:///Users/syedrakibhasan/projects/charity-draws/frontend/app/register/page.tsx), [page.tsx](file:///Users/syedrakibhasan/projects/charity-draws/frontend/app/login/page.tsx), [page.tsx](file:///Users/syedrakibhasan/projects/charity-draws/frontend/app/host/register/page.tsx)
* **Action**: Add explicit loading spinners on submit buttons (`isPending` state from TanStack mutation), inline field validation errors, and clear success messages.
* **Dependencies**: None.

#### Task F2: Host Payout Modal Error Handling (Medium Priority)
* **File**: `frontend/components/dashboard/host/PayoutModal.tsx`
* **Action**: Catch backend exception responses (e.g., "Insufficient balance") and render Sonner toast alerts with clear instructions.
* **Dependencies**: None.

#### Task F3: Admin Table Mobile Overflow & Action Column Sticky Fix (Medium Priority)
* **Files**: `frontend/components/dashboard/admin/*Table.tsx`
* **Action**: Wrap all administrative table elements in horizontal scroll containers (`overflow-x-auto`) and apply `pin-right` styles for row action buttons.
* **Dependencies**: None.

#### Task F4: Frontend Unit Test Setup with Vitest (Medium Priority)
* **Files**: `frontend/vite.config.ts` [NEW], `frontend/package.json`
* **Action**: Add Vitest and `@testing-library/react` dependencies to package.json, configure test script, and create basic component render test specs.
* **Dependencies**: None.

---

## 9. Responsive Design Plan

### Screen Breakpoint Matrix

| Device Class | Viewport Range | Primary UI Components to QA | Target Outcome |
|---|---|---|---|
| **Mobile Small** | 320px – 480px | Navigation Drawer, Ticket Cards, Auth Forms, Purchase Modal | Zero horizontal overflow, single column card layouts, minimum 44px tap targets |
| **Mobile Large / Tablet** | 481px – 768px | Filter Bars, Host Profile Headers, Admin Metric Grids | 2-column grid scaling, collapsible sidebar drawers |
| **Laptop** | 769px – 1024px | Dashboard Sidebar, Multi-step Wizards, Winners Tables | Collapsed icon sidebar or full drawer, table horizontal scroll support |
| **Desktop** | 1025px – 1440px | Full Admin Dashboard, Live Raffles Grid, Dynamic Banners | 3 to 4-column raffle grids, sticky navigation headers |
| **Ultra-Wide** | >1440px | Hero Section Container, Winners Leaderboard | Centered `max-w-7xl` container constraints |

### Responsive QA Checklist
- [ ] **Mobile Drawer Navigation**: Hamburger menu expands/collapses smoothly without layout shift.
- [ ] **Data Tables**: Admin and host dashboard tables scroll horizontally without breaking screen boundaries.
- [ ] **Modals & Overlays**: Ticket purchase modal and withdrawal request modal center correctly on iOS/Android viewports.
- [ ] **Card Layouts**: Live raffle cards adjust gracefully from 1 column (mobile) to 4 columns (desktop).
- [ ] **Typography**: Headings use fluid text scaling (`text-2xl` on mobile to `text-4xl` on desktop).

---

## 10. Testing Strategy

### Multilayer Testing Matrix

```
       ┌─────────────────────────────────────────────────┐
       │              E2E Flow Tests                     │
       │       (Playwright - Critical User Paths)        │
       └────────────────────────┬────────────────────────┘
                                │
       ┌────────────────────────┴────────────────────────┐
       │          Frontend Component & Hook Tests         │
       │            (Vitest / Testing Library)           │
       └────────────────────────┬────────────────────────┘
                                │
       ┌────────────────────────┴────────────────────────┐
       │         Backend Integration & API Tests         │
       │               (Supertest / NestJS)              │
       └────────────────────────┬────────────────────────┘
                                │
       ┌────────────────────────┴────────────────────────┐
       │             Backend Unit Services Specs         │
       │                   (Jest / Mocks)                │
       └─────────────────────────────────────────────────┘
```

#### 1. Backend Service Unit Tests (Jest)
* **Scope**: Business logic functions in NestJS services.
* **Key Targets**:
  - `RafflesService.create`: Validates active subscription limits.
  - `TicketsService.allocateTicketsInDatabase`: Validates stock availability and instant win matching.
  - `PaymentService.createSubscriptionCheckout`: Validates price calculation and plan duration.

#### 2. Backend Controller Integration Tests (Supertest)
* **Scope**: Endpoint validation, DTO transformation, and Role guards.
* **Key Targets**:
  - `POST /api/v1/auth/login`: Returns set-cookie header with `accessToken`.
  - `POST /api/v1/raffles`: Returns 403 when user is not a `HOST`.
  - `POST /api/v1/tickets/purchase/:raffleId`: Rejects invalid quantities.

#### 3. Frontend Component & Hook Tests (Vitest)
* **Scope**: React component rendering, user events, TanStack Query mutations.
* **Key Targets**:
  - `LiveRaffleCard`: Displays "By [Host Name]" badge and formatted price.
  - `CreateRaffleWizard`: Form validation errors trigger on missing required fields.

#### 4. Critical E2E Workflows (Playwright)
* **Scope**: Complete real-user flows across full stack.
* **Workflow 1**: User Registration → Login → Browse Live Raffles → Purchase Ticket → Verify Ticket in Dashboard.
* **Workflow 2**: Host Registration → Subscribe to Plan → Create Raffle → Upload Cover Image → Submit for Approval.
* **Workflow 3**: Admin Login → Review Pending Raffles → Approve Raffle → Run Winner Draw.

---

## 11. Test Coverage Plan

### Coverage Targets

| Coverage Metric | Minimum Required | Critical Focus Areas |
|---|---|---|
| **Statements** | 85% | Ticket purchase algorithms, instant win matching, authorization guards |
| **Branches** | 80% | Role checks, payment status branches, stock availability checks |
| **Functions** | 85% | Service methods, controller handlers, utility helpers |
| **Lines** | 85% | Core domain logic in backend and custom hooks in frontend |

### Execution Commands
* **Backend Coverage**:
  ```bash
  cd backend && npm run test:cov
  ```
* **Frontend Coverage**:
  ```bash
  cd frontend && npm run test:cov
  ```

---

## 12. Conductor + Codex Execution Strategy

### Parallel Agent Distribution Matrix

```
  ┌───────────────────────────────────────────────────────────────────┐
  │                 AGENT TASK DISTRIBUTION STRATEGY                 │
  └───────────────────────────────────────────────────────────────────┘
    [Agent 1: Backend Security & APIs]   [Agent 2: Frontend UI & Forms]
                  │                                   │
                  ▼                                   ▼
    [Agent 3: Unit Testing & Specs]      [Agent 4: QA & Responsive UI]
```

| Agent Role | Primary Workspace Focus | Assigned Tasks | Dependencies |
|---|---|---|---|
| **Agent 1 (Backend Specialist)** | `/backend` | Transaction locks (B1), Webhook hardening (B2) | Independent |
| **Agent 2 (Frontend Specialist)** | `/frontend` | Auth loading states (F1), Payout modal error handling (F2) | Independent |
| **Agent 3 (Test Engineer)** | `/backend` & `/frontend` | NestJS Service unit specs (B3-B5), Vitest setup (F4) | Agent 1 & Agent 2 |
| **Agent 4 (QA Specialist)** | Full Stack | Responsive layout fixes (F3), E2E Workflow execution | Agent 1, 2 & 3 |

### Workspace & Branching Guidelines
- **Main Branch**: `main`
- **Agent Branches**:
  - `feature/backend-hardening` (Agent 1)
  - `feature/frontend-ui-polish` (Agent 2)
  - `test/unit-test-coverage` (Agent 3)
  - `qa/responsive-e2e-fixes` (Agent 4)

---

## 13. Agent Prompts

Ready-to-copy prompts for subagents or Codex executions:

### Prompt 1 — Backend Hardening (Agent 1)
```text
Task: Harden Backend Ticket Purchasing & Webhook Processing
Workspace: /Users/syedrakibhasan/projects/charity-draws/backend

Instructions:
1. Inspect `src/tickets/tickets.service.ts` and `src/payment/payment.service.ts`.
2. Wrap ticket count verification and ticket insertion inside a Prisma transaction (`this.prisma.$transaction`) to guarantee atomic stock deduction.
3. Ensure Cashflows webhook processing in `PaymentService` safely parses signatures while preserving test payment compatibility.
4. Do NOT alter database schemas or existing route paths.
5. Run `npm run build` in backend to verify zero compilation errors.
```

### Prompt 2 — Frontend Form UX & Validation (Agent 2)
```text
Task: Enhance Frontend Form Loading States & Error Feedback
Workspace: /Users/syedrakibhasan/projects/charity-draws/frontend

Instructions:
1. Inspect `/app/register/page.tsx`, `/app/login/page.tsx`, and `/app/host/register/page.tsx`.
2. Ensure submit buttons display a disabled loading state (`Loader2` spinner icon) when `isPending` or submission is active.
3. Add toast notifications via `sonner` for successful actions and handle API exception messages gracefully.
4. Do NOT change layout styling structure or existing routes.
5. Run `npm run build` in frontend to verify clean compilation.
```

### Prompt 3 — Backend Unit Test Suite Creation (Agent 3)
```text
Task: Create Unit Test Specs for Core NestJS Services
Workspace: /Users/syedrakibhasan/projects/charity-draws/backend

Instructions:
1. Create unit test spec files for `src/raffles/raffles.service.spec.ts`, `src/tickets/tickets.service.spec.ts`, and `src/payment/payment.service.spec.ts`.
2. Use `@nestjs/testing` and mock `PrismaService` calls.
3. Test key service methods: raffle creation, ticket allocation, instant win identification, subscription checkout generation.
4. Run `npm run test` to ensure all newly created specs pass cleanly.
```

### Prompt 4 — Responsive Layout QA & Fixes (Agent 4)
```text
Task: Perform Responsive QA and Fix Dashboard Table Overflows
Workspace: /Users/syedrakibhasan/projects/charity-draws/frontend

Instructions:
1. Inspect all administrative tables in `/components/dashboard/admin` and host tables in `/components/dashboard/host`.
2. Wrap table markup in `div className="w-full overflow-x-auto scrollbar-thin"`.
3. Verify menu drawer toggle behavior on viewports under 768px.
4. Run `npm run build` to confirm no build regressions.
```

---

## 14. Definition of Done

Before declaring the project complete, every requirement in this checklist must be satisfied:

- [ ] **Backend Build & Verification**: `backend` compiles without TypeScript errors (`npm run build` passes).
- [ ] **Frontend Build & Verification**: `frontend` compiles without Next.js or TypeScript errors (`npm run build` passes).
- [ ] **Database Integrity**: Prisma schema matches production database state (`npx prisma validate` passes).
- [ ] **Authentication & Security**: HttpOnly JWT cookie auth works seamlessly across register, login, logout, and role guards (`CLIENT`, `HOST`, `ADMIN`).
- [ ] **Raffle Lifecycle**: Host can create a raffle -> Admin can approve -> Client can purchase tickets -> Admin/Scheduler can draw winner.
- [ ] **Instant Win Calculation**: Tickets matching instant win numbers automatically create `Winner` records.
- [ ] **Payment Flow**: Cashflows checkout redirection and test mode purchase bypass function correctly.
- [ ] **Responsive Design**: App renders flawlessly across 375px, 768px, 1024px, 1440px viewports with zero breaking overflow.
- [ ] **Backend Test Suite**: Unit tests pass with >85% coverage on core services (`npm run test:cov`).
- [ ] **Frontend Test Suite**: Component test specs pass cleanly without errors.
- [ ] **E2E Critical Flow**: End-to-end user purchase journey verified end-to-end.
- [ ] **OpenSpec Compliance**: All OpenSpec changes synced and archived.

---

## 15. Final Delivery Checklist

Prior to final client handover:

- [ ] Clear database seed scripts populated with initial categories and subscription plans (`npm run prisma:seed`).
- [ ] Environment variable template (`.env.example`) present and verified for both frontend and backend.
- [ ] Production build verification completed (`npm run build` clean in both folders).
- [ ] API documentation verified on Swagger (`/api/docs` on backend).
- [ ] Admin demo account credentials verified (`seed-demo.ts`).
- [ ] Client documentation & deployment instructions up to date in `README.md`.

---

## 16. Execution Order

Master step-by-step sequential path from today until final delivery:

```
  STEP 1 ──► STEP 2 ──► STEP 3 ──► STEP 4 ──► STEP 5
    │                                           │
  STEP 10 ◄── STEP 9 ◄── STEP 8 ◄── STEP 7 ◄── STEP 6
```

### STEP 1: Verify Environment & Core Builds
* **Tool**: Terminal / `run_command`
* **OpenSpec**: N/A
* **Action**: Run `npm run build` in both `backend` and `frontend` to verify clean baseline builds.
* **Expected Output**: Both builds output success logs with 0 errors.
* **Executed By**: User / Developer

---

### STEP 2: Initialize OpenSpec Baseline Spec
* **Tool**: OpenSpec CLI / Slash Command
* **OpenSpec**: `/openspec-propose`
* **Prompt**: `"Propose change 'master-production-delivery' covering backend transaction security, test suite implementation, and responsive UI polish."`
* **Expected Output**: Proposed spec change directory generated under `openspec/changes/master-production-delivery`.
* **Executed By**: OpenSpec

---

### STEP 3: Harden Backend Ticket Transactions (Agent 1)
* **Tool**: Agent / Conductor Prompt
* **OpenSpec**: `/openspec-update-change`
* **Prompt**: `"Apply atomic transaction locks to TicketsService.allocateTicketsInDatabase in backend/src/tickets/tickets.service.ts."`
* **Expected Output**: Updated `tickets.service.ts` using Prisma `$transaction`.
* **Executed By**: Agent 1 (Codex / Conductor)

---

### STEP 4: Enhance Frontend Auth Forms & UX (Agent 2)
* **Tool**: Agent / Conductor Prompt
* **OpenSpec**: `/openspec-update-change`
* **Prompt**: `"Add loading state spinners and field error feedback to registration and login forms in frontend."`
* **Expected Output**: Polished auth form components with loading indicators and Sonner toast alerts.
* **Executed By**: Agent 2 (Codex / Conductor)

---

### STEP 5: Create Backend Unit Test Suites (Agent 3)
* **Tool**: Agent / Conductor Prompt
* **OpenSpec**: `/openspec-update-change`
* **Prompt**: `"Create Jest unit test spec files for RafflesService, TicketsService, and PaymentService in backend/src."`
* **Expected Output**: New test files created and passing under `npm run test`.
* **Executed By**: Agent 3 (Codex / Conductor)

---

### STEP 6: Execute Responsive Layout QA & Fixes (Agent 4)
* **Tool**: Agent / Conductor Prompt
* **OpenSpec**: `/openspec-update-change`
* **Prompt**: `"Fix mobile table overflow and verify navigation drawer responsiveness across admin and host dashboards."`
* **Expected Output**: All dashboard tables wrapped in responsive containers with zero horizontal screen clipping.
* **Executed By**: Agent 4 (Codex / Conductor)

---

### STEP 7: Run Full Test Coverage Audit
* **Tool**: Terminal / `run_command`
* **OpenSpec**: `/openspec-update-change`
* **Action**: Execute `npm run test:cov` in `backend`.
* **Expected Output**: Coverage report displaying >85% coverage on core services.
* **Executed By**: User / Developer

---

### STEP 8: Sync & Archive OpenSpec Specifications
* **Tool**: OpenSpec CLI / Slash Commands
* **OpenSpec**: `/openspec-sync-specs` followed by `/openspec-archive-change`
* **Prompt**: `"Sync delta specs to main specs and archive change 'master-production-delivery'."`
* **Expected Output**: Specs synchronized and change moved to `openspec/changes/archive`.
* **Executed By**: OpenSpec

---

### STEP 9: Production Build & QA Verification
* **Tool**: Terminal / Browser
* **OpenSpec**: N/A
* **Action**: Perform full production build (`npm run build` in backend and frontend) and test end-to-end user flow.
* **Expected Output**: Zero build warnings, clean bundle generation, working end-to-end user flow.
* **Executed By**: User / QA Lead

---

### STEP 10: Final Client Handover
* **Tool**: Manual Delivery
* **OpenSpec**: N/A
* **Action**: Verify final delivery checklist items and deliver production package to client.
* **Expected Output**: Fully functional, tested, responsive, production-ready Charity Draws platform.
* **Executed By**: User / Developer
