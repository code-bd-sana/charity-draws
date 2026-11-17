# ⏱️ 3-Hour High-Impact Engineering Sprint Tasks
> **Project:** Charity Draws Full-Stack Platform  
> **Duration:** 3 Hours (180 Minutes)  
> **Objective:** Concrete, hands-on tasks to harden database integrity, eliminate API spam, enhance admin features, and add essential transaction emails.

---

## 🕒 Hour 1: Database Integrity & Backend Security Hardening (60 mins)

### Task 1.1: Prevent Double-Selling on Tickets (Database Constraint)
- [ ] **File:** `backend/prisma/schema.prisma`
- [ ] Add composite unique constraint to `Ticket` model:
  ```prisma
  model Ticket {
    // ...
    @@unique([raffleId, ticketNumber])
    @@index([raffleId])
    @@index([userId])
  }
  ```
- [ ] Run migration: `npx prisma migrate dev --name add_ticket_unique_constraint`
- [ ] Verify test purchase still functions without constraint violations.

### Task 1.2: Restrict CORS & Add Rate Limiting
- [ ] **File:** `backend/src/main.ts`
- [ ] Remove wildcard `origin: true` and enforce a strict whitelist with `FRONTEND_URL`:
  ```ts
  const allowedOrigins = [
    'http://localhost:3000',
    'https://charity-draws.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  ```
- [ ] Install and configure `@nestjs/throttler` in `app.module.ts` to protect auth and checkout endpoints from brute-force spam.

---

## 🕒 Hour 2: Admin Orders Upgrade & Search Optimization (60 mins)

### Task 2.1: Add Search & Status Filters to Admin Orders Table [COMPLETED ✅]
- [x] **File:** `frontend/components/dashboard/admin/AdminOrdersTable.tsx`
- [x] Add search bar to search orders by transaction ID or user email.
- [x] Add filter pills: `All`, `Completed / Paid`, `Refunded`, `Failed`.
- [x] Add an **Export CSV** button allowing admins to download filtered orders (order ID, buyer, raffle, amount, date, status).

### Task 2.2: Add Debounce to Users Table Search
- [ ] **File:** `frontend/components/dashboard/admin/UsersTable.tsx`
- [ ] Prevent firing network requests on every single keystroke.
- [ ] Implement a 300ms debounce before setting the search query to `useAdminUsers`.
- [ ] Add a filter tab for Roles: `All`, `Clients`, `Hosts`, `Admins`.

---

## 🕒 Hour 3: Order Confirmation Email & Automated Testing (60 mins)

### Task 3.1: Ticket Purchase Confirmation Email Template
- [ ] **File:** `backend/src/mail/mail.service.ts`
- [ ] Add `sendOrderConfirmationEmail(email, { orderId, raffleTitle, ticketNumbers, totalAmount })`.
- [ ] Format a clean HTML invoice email with ticket numbers and draw date.
- [ ] Call this method in `TicketsService.checkout()` upon successful ticket allocation.

### Task 3.2: Automated Unit Testing for Tickets Service
- [ ] **File:** `backend/src/tickets/tickets.service.spec.ts`
- [ ] Write unit test verifying:
  - Error is thrown if quantity <= 0.
  - Error is thrown if quantity exceeds remaining raffle tickets.
  - Error is thrown if requested quantity exceeds `maxTicketsPerUser`.
- [ ] Run tests: `npm --prefix backend run test` and ensure all tests pass green.

---

## 🎯 Verification Checklist (At End of 3 Hours)
- [ ] `npm --prefix backend run build` passes with 0 errors.
- [ ] `npm --prefix frontend run build` passes with 0 errors.
- [ ] All tickets have guaranteed database uniqueness.
- [ ] Admin Orders page has working search and filters.
- [ ] Email service dispatches order confirmation on checkout.
