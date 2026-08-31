## Why

The Charity Draws frontend currently lacks consistent visual loading feedback on critical mutation actions (e.g. auth form submission, payout requests, ticket purchases), uses fragmented toast mechanisms (bespoke `setTimeout` floating divs instead of Sonner toasts), exhibits blank frames on empty table views, and lacks Next.js App Router error boundaries. Delivering a polished, resilient, and responsive client experience is essential before public launch.

## What Changes

- **Form Loading Spinners & Submit State Hardening**:
  - Enhance `PrimaryButton` and `SecondaryButton` to support `isLoading` state, rendering animated `Loader2` spinners from `lucide-react` and automatically locking buttons against duplicate submissions.
  - Fix submission mutation states in `UserLoginForm`, `UserRegistrationForm`, `HostLoginForm`, `HostRegistrationForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `VerifyEmailForm`, and `RequestWithdrawalModal`.
- **Unified Toast Notification System**:
  - Replace all custom inline floating toast divs across user and host auth forms with Sonner `toast.success()`, `toast.error()`, and `toast.info()`.
  - Standardize error extraction via `extractApiError()` so backend HTTP exceptions are cleanly presented to users.
- **Empty State Indicator Framework**:
  - Create a reusable `<EmptyState />` UI primitive with presets for tickets, raffles, wins, payouts, and search filter resets.
  - Implement `<EmptyState />` across `TicketsTable`, `HostRafflesTable`, `PayoutHistoryTable`, `UserWinnersPage`, and Admin tables.
- **Next.js App Router Error Boundaries**:
  - Add `app/global-error.tsx` for catastrophic root layout failures with reset triggers.
  - Add `app/error.tsx` for public route runtime errors while preserving layout header/footer.
  - Add `app/dashboard/error.tsx` for isolating dashboard widget crashes without breaking the main navigation shell.

## Capabilities

### New Capabilities
- `frontend-ux-feedback`: Defines requirements for unified toast notifications, accessible form submit loading states, reusable empty state displays across data tables, and tiered Next.js error boundaries.

### Modified Capabilities
<!-- None: No existing specs in openspec/specs/ are being modified -->

## Impact

- **Frontend Code**: `frontend/app/layout.tsx`, `frontend/app/error.tsx`, `frontend/app/global-error.tsx`, `frontend/app/dashboard/error.tsx`, `frontend/components/ui/EmptyState.tsx`, `frontend/components/website/shared/PrimaryButton.tsx`, `frontend/components/user-auth/*`, `frontend/components/host-auth/*`, `frontend/components/dashboard/*`.
- **Dependencies**: Uses existing `sonner`, `lucide-react`, and `@tanstack/react-query` dependencies in `frontend/package.json` without requiring new package installations.
- **API/Contracts**: Zero backend schema or API contract changes required.
