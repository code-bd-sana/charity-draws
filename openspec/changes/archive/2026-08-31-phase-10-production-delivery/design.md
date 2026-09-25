## Context

See `proposal.md` for motivation. The project is structured as a monorepo with `backend/` (NestJS 11 + Prisma ORM + PostgreSQL) and `frontend/` (Next.js 16 + Tailwind CSS v4 + TanStack Query v5). Final delivery requires complete documentation, environment variable templates, and seed verification.

## Goals / Non-Goals

**Goals:**
- Provide clear `.env.example` templates in `backend/` and `frontend/` covering database URLs, secrets, ports, and CORS origins.
- Verify `prisma/seed.ts` and `seed-demo.ts` create all required baseline categories, subscription plans, and persona accounts.
- Document full development, testing, build, migration, and runtime commands in `README.md`.
- Verify Swagger API documentation is fully generated and accessible at `/api`.

**Non-Goals:**
- Setting up custom paid cloud hosting infrastructure accounts (runbook targets standard Node.js / Docker environments).

## Decisions

### Decision 1: Standardized `.env.example` Documentation
- **Rationale**: Providing documented `.env.example` files directly in `backend/` and `frontend/` guarantees that new developers and CI/CD pipelines can configure the application without guessing missing variable names.

### Decision 2: Persona Seed Strategy (`seed-demo.ts`)
- **Rationale**: Using `seed-demo.ts` with upserts ensures that demo accounts for `ADMIN`, `HOST`, and `CLIENT` can be re-run safely without crashing on existing unique constraints.

### Decision 3: Centralized Operations Documentation in `README.md`
- **Rationale**: A unified `README.md` containing architecture diagrams, port bindings, test execution commands, and persona credentials serves as the single source of truth for handover.

## Risks / Trade-offs

- **[Risk] Exposing sensitive demo secrets in production** → *Mitigation*: Emphasize in `README.md` and `.env.example` that `JWT_SECRET` and database passwords must be replaced with secure values in production.
