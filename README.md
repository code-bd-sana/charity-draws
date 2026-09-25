# 🎯 Charity Draws — Multi-Tenant Competition & Charity Sweepstakes Platform

A modern, high-concurrency charity raffle and tactical competition platform built with **Next.js 16**, **NestJS 11**, **Prisma ORM**, and **PostgreSQL**.

---

## 🏛️ System Architecture

```
                                ┌───────────────────────────┐
                                │   Next.js 16 (Turbopack)  │
                                │   Tailwind CSS v4 / React │
                                └─────────────┬─────────────┘
                                              │ HTTP / Cookies (JWT)
                                              ▼
                                ┌───────────────────────────┐
                                │   NestJS 11 REST API      │
                                │   Swagger / Global Pipes  │
                                └─────────────┬─────────────┘
                                              │ Prisma ORM (pg Pool)
                                              ▼
                                ┌───────────────────────────┐
                                │    PostgreSQL Database    │
                                └───────────────────────────┘
```

- **Frontend (`frontend/`)**: Next.js 16 App Router, React 19, TanStack Query v5 for resilient server-cache synchronization, Tailwind CSS v4, Lucide & Heroicons.
- **Backend (`backend/`)**: NestJS 11 modular TypeScript microservice, class-validator DTOs, custom exception filters, response transformation interceptors, Swagger OpenAPI reference.
- **Database (`backend/prisma/`)**: PostgreSQL with Prisma ORM (`@prisma/adapter-pg`), foreign key integrity, ACID transactions for atomic ticket purchases and winner draws.

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: >= 20.x
- **npm**: >= 10.x
- **PostgreSQL**: >= 15.x

---

### 2. Environment Configuration

#### Backend Setup (`backend/`)
```bash
cd backend
cp .env.example .env
```
Configure your `.env` variables:
```env
DATABASE_URL="postgresql://charity_user:your_password@localhost:5432/charity_prod"
PORT=5000
JWT_SECRET="change-this-to-a-secure-random-secret-key"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
USE_TEST_PAYMENT="true"
```

#### Frontend Setup (`frontend/`)
```bash
cd frontend
cp .env.example .env
```
Configure your `.env` variables:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BACKEND_API_URL="http://localhost:5000/api/v1"
```

---

### 3. Database Initialization & Seeding

Run Prisma migrations and initialize baseline categories, subscription tiers, and demo accounts:

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run DB Migrations
npm run prisma:migrate

# Seed Categories, Plans & Admin Account
npm run prisma:seed

# (Optional) Seed Demo Personas (Admin, Host, Client)
npm run admin:seed
```

---

### 4. Running Development Servers

#### Start Backend Service
```bash
cd backend
npm run start:dev
# Running on http://localhost:5000
# Swagger API docs available at: http://localhost:5000/api
```

#### Start Frontend Web Application
```bash
cd frontend
npm run dev
# Running on http://localhost:3000
```

---

## 🔑 Default Demo Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **System Administrator** | `admin@gmail.com` | `admin@gmail.com` | Full platform moderation, payout approval, draw execution |
| **Verified Host** | `host@gmail.com` | `host@gmail.com` | Competition creation, instant wins, host wallet, payout requests |
| **Consumer / Client** | `client@gmail.com` | `client@gmail.com` | Ticket purchases, instant win claims, order history |

---

## 🧪 Automated Testing

### Backend End-to-End Test Suite
Executes 8 comprehensive E2E integration test suites covering registration, JWT cookies, multi-ticket purchasing, instant-win claim allocation, and host payout moderation:

```bash
cd backend
npm run test:e2e
```

### Production Build Verification
Verify Next.js compilation, TypeScript type checking, and route generation:

```bash
cd frontend
npm run build
```

---

## 📖 API Documentation

Interactive Swagger OpenAPI reference is hosted directly on the backend service:
- **URL**: `http://localhost:5000/api`
- **Features**: Interactive test console, JWT Bearer authentication, request/response schema specifications.

---

## 📂 Repository Structure

```
charity-draws/
├── backend/
│   ├── src/
│   │   ├── admin/           # Admin moderation, users, orders, withdrawals
│   │   ├── auth/            # JWT authentication, registration, session guards
│   │   ├── categories/      # Public category hierarchy
│   │   ├── hosts/           # Host brand management, wallet, withdrawal API
│   │   ├── payment/         # Cashflows / simulated payment gateway
│   │   ├── raffles/         # Competition lifecycle, instant-win assignment
│   │   ├── subscriptions/   # Host tier plans & quotas
│   │   └── tickets/         # High-concurrency ticket allocation
│   ├── test/                # Supertest E2E integration test suites
│   ├── prisma/              # Prisma schema, migrations, seed scripts
│   ├── .env.example         # Documented backend environment template
│   └── package.json
│
├── frontend/
│   ├── app/                 # Next.js 16 App Router pages & layouts
│   ├── components/          # Reusable UI component library & modal dialogs
│   ├── features/            # Auth context, state guards, and query providers
│   ├── hooks/               # TanStack Query custom data hooks
│   ├── services/            # Axios API service clients
│   ├── types/               # TypeScript interface definitions
│   ├── .env.example         # Documented frontend environment template
│   └── package.json
│
└── openspec/                # OpenSpec specification governance & change history
```

---

## 📄 License
UNLICENSED — Proprietary & Confidential. All rights reserved.
