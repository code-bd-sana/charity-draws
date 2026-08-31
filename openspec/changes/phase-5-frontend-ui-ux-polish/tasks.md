## 1. UI Primitives & Loading Spinners

- [ ] 1.1 Enhance `PrimaryButton.tsx` and `SecondaryButton.tsx` with `isLoading` and `loadingText` props using `Loader2` from `lucide-react`, verifying disabled lock behavior during active loading
- [ ] 1.2 Create reusable `frontend/components/ui/EmptyState.tsx` supporting custom icons, titles, descriptions, and action buttons, verifying component renders cleanly

## 2. Auth Forms Loading & Toast Unification

- [ ] 2.1 Refactor `UserLoginForm.tsx` to use `PrimaryButton` loading state and Sonner `toast` notifications, verifying successful login redirect and error toast on failure
- [ ] 2.2 Refactor `UserRegistrationForm.tsx` to fix mutation submission state locking and replace custom toasts with Sonner `toast.success`/`toast.error`, verifying inline and toast error feedback
- [ ] 2.3 Refactor `HostLoginForm.tsx` and `HostRegistrationForm.tsx` to use Sonner toasts and button loading states across multi-step wizard, verifying step validation and submission
- [ ] 2.4 Refactor `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`, and `VerifyEmailForm.tsx` to integrate Sonner toasts and spinner states, verifying submission feedback

## 3. Dashboard Modals & Empty States Integration

- [ ] 3.1 Integrate `<EmptyState />` into `TicketsTable.tsx` for zero-ticket users, verifying empty state display with link to `/live-raffles`
- [ ] 3.2 Integrate `<EmptyState />` into `HostRafflesTable.tsx` and `PayoutHistoryTable.tsx`, verifying zero-competition and zero-withdrawal displays
- [ ] 3.3 Integrate `<EmptyState />` into Admin dashboard tables (`AdminCompetitionsTable`, `AdminOrdersTable`, `UsersTable`, `WithdrawalsTable`), verifying filter-reset behavior
- [ ] 3.4 Polish `RequestWithdrawalModal.tsx` to use Sonner error toasts with `extractApiError()`, verifying balance check error feedback

## 4. Next.js App Router Error Boundaries

- [ ] 4.1 Implement `frontend/app/global-error.tsx` for root layout exception handling with reset trigger, verifying fallback rendering
- [ ] 4.2 Implement `frontend/app/error.tsx` for public SSR route error containment while preserving navigation shell, verifying retry action
- [ ] 4.3 Implement `frontend/app/dashboard/error.tsx` for dashboard subtree error isolation, verifying dashboard shell persistence

## 5. Verification & Build QA

- [ ] 5.1 Run `npm run build` in `frontend/` and verify zero TypeScript or Next.js compilation errors
