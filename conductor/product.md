# Product Definition: Charity Draws

## Vision
Charity Draws is a full-stack charity raffle and competition platform connecting hosts (charities, businesses, individuals) with ticket buyers. The platform empowers causes to raise funds transparently and engagingly through timed draws, instant-win prizes, automated ticket allocation, multi-tier host subscriptions, and administrative oversight.

## Target Audience & Personas
1. **Ticket Buyers / Entrants (`CLIENT`):** Users looking to support charitable causes and participate in raffles with transparent odds, instant-win opportunities, and automated draw outcomes.
2. **Hosts & Charities (`HOST`):** Organizations, non-profits, and independent hosts seeking a turn-key platform to launch, market, and manage compliant raffles, track sales in real-time, and withdraw earnings.
3. **Platform Administrators (`ADMIN`):** Operators responsible for reviewing raffle submissions, verifying host identities, approving payout withdrawals, managing raffle categories, and ensuring legal compliance.

## Core Features & Modules
- **Authentication & Authorization:** Secure JWT session management via HttpOnly cookies, email verification, password reset flows, and strict role-based access control (`CLIENT`, `HOST`, `ADMIN`).
- **Raffle & Competition Lifecycle:** Multi-step wizard for raffle creation, image banner uploads, dynamic instant-win prize allocations, category tagging, and automated draw execution via NestJS cron schedules.
- **Ticket Allocation & Instant Wins:** Real-time ticket purchase engine with automated number assignment and instant-win prize detection.
- **Payments & Subscriptions:** Seamless host subscription billing (tiered plans) and ticket payment processing via the Cashflows gateway with webhook verification and test mode fallback.
- **Host Wallet & Payout Management:** Real-time earnings ledger tracking ticket sales, platform commission deductions, and withdrawal request processing.
- **Trust & Compliance:** Verified host badges, free postal entry compliance flows, public winner showcases, and transparent draw history.
- **Multi-Tenant Dashboards:** Specialized portal views tailored for Entrants (ticket tracking, win notifications), Hosts (analytics, raffle management, wallet), and Admins (approvals, user controls, payouts).

## Success Metrics & Quality Standards
- Fast, responsive server-side rendered pages with Next.js 16 and Tailwind v4.
- Concurrency-safe ticket purchasing and ledger updates using PostgreSQL & Prisma transactions.
- Zero-downtime automated draw execution with verifiable winner logs.
