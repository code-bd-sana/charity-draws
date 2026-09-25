## Why

The Charity Draws web platform is accessed across a diverse set of devices ranging from small mobile viewports (375px) to ultra-wide displays (>1440px). Several mobile usability gaps exist, including fixed bottom dock occlusion of content/pagination controls, horizontal overflow in multi-column admin/host data tables, and modal clipping on small smartphone displays. Delivering a flawless responsive experience across all standard device breakpoints is vital for conversion and accessibility.

## What Changes

- **Mobile Bottom Clearance & Dock Integration**:
  - Enforce `pb-24 lg:pb-8` bottom clearance across dashboard pages (`DashboardShell.tsx`) and public footers (`WebsiteFooter.tsx`) to prevent interactive controls from being covered by `MobileBottomDock`.
- **Responsive Table Containers & Horizontal Scroll**:
  - Ensure all data tables across Host and Admin dashboards (`AdminOrdersTable`, `WithdrawalsTable`, `UsersTable`, `WinnersTrackingTable`, `LogsActivityTable`, `HostRafflesTable`) are wrapped in `overflow-x-auto scrollbar-thin` containers with explicit `min-w` constraints to eliminate viewport clipping.
- **Modal Overlay Usability on Mobile**:
  - Constrain all dashboard and confirmation modals to `w-[95vw] sm:max-w-[540px]` with `max-h-[85vh] overflow-y-auto` scrollable forms, pinned headers/footers, and minimum 44px tap targets.
- **Drawer Navigation & Breakpoint Tuning**:
  - Polish `MobileDashboardMenu` drawer animations, z-index hierarchy, and touch backdrop dismissal.

## Capabilities

### New Capabilities
- `responsive-mobile-usability`: Defines responsive layout requirements, mobile drawer usability, horizontal table scrolling, and modal viewport adaptation across standard device breakpoints.

### Modified Capabilities
<!-- None: No existing specs in openspec/specs/ are being modified -->

## Impact

- **Frontend Code**: `frontend/components/dashboard/DashboardShell.tsx`, `frontend/components/dashboard/MobileDashboardMenu.tsx`, `frontend/components/website/layout/WebsiteFooter.tsx`, `frontend/components/dashboard/admin/*Table.tsx`, `frontend/components/dashboard/host/*Table.tsx`, `frontend/components/dashboard/admin/*Modal.tsx`, `frontend/components/dashboard/host/payouts/RequestWithdrawalModal.tsx`.
- **Dependencies**: Uses existing Tailwind CSS v4 breakpoint utilities without new package dependencies.
- **API/Contracts**: Zero backend schema or API modifications.
