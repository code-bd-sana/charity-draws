## 1. Mobile Bottom Dock & Shell Clearance

- [x] 1.1 Update `DashboardShell.tsx` main content padding to `pb-24 lg:pb-8`, verifying table pagination bars and bottom cards remain fully accessible on mobile viewports (<1024px)
- [x] 1.2 Update `WebsiteFooter.tsx` bottom padding to `pb-24 lg:pb-16`, verifying copyright and payment security badges are visible above the mobile dock

## 2. Dashboard Data Tables Responsive Tuning

- [x] 2.1 Standardize admin data tables (`AdminOrdersTable`, `WithdrawalsTable`, `UsersTable`, `WinnersTrackingTable`, `LogsActivityTable`) with `overflow-x-auto scrollbar-thin` and `min-w-[900px]`, verifying horizontal touch scrolling on mobile
- [x] 2.2 Standardize host dashboard tables (`HostRafflesTable`, `PayoutHistoryTable`, `HostActiveRaffles`) with responsive scroll containers, verifying action columns maintain alignment

## 3. Modal Overlays Responsive Optimization

- [x] 3.1 Refactor administrative modals (`ConfirmPayoutModal`, `ReviewHostModal`, `UserDetailsModal`, `WinnerDetailsModal`, `ManualWinnerSelectModal`, `ViewSoldTicketsModal`) to `w-[95vw] sm:max-w-[540px]` with `max-h-[85vh]` scrollable bodies, verifying touch usability
- [x] 3.2 Refactor `RequestWithdrawalModal.tsx` and `TicketPurchaseSuccessModal.tsx` for small mobile screens (<480px), verifying pinned action footers and minimum 44px tap targets

## 4. Verification & Responsive QA

- [x] 4.1 Run `npm run build` in `frontend/` and verify zero TypeScript or Next.js compilation errors
