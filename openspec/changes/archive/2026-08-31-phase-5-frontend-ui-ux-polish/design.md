## Context

See `proposal.md` for motivation. The Next.js 16 (React 19) App Router frontend uses Tailwind CSS v4, Lucide React icons, and TanStack Query v5. Sonner is mounted in `app/layout.tsx`. Current UI state handling lacks cohesive button loading indicators, standardized toast error mapping, empty state components for tables, and App Router error boundaries.

## Goals / Non-Goals

**Goals:**
- Centralize submit button loading and mutation states via enhanced `PrimaryButton` and `SecondaryButton` components using `Loader2` from `lucide-react`.
- Unify all user notifications across auth flows and dashboard actions using `sonner` toasts and `extractApiError()`.
- Create a modular, accessible `<EmptyState />` component for dashboard tables, search filters, and collection views.
- Implement hierarchical Next.js App Router error boundaries (`app/global-error.tsx`, `app/error.tsx`, `app/dashboard/error.tsx`).

**Non-Goals:**
- Rewriting backend API response formats or database schema.
- Replacing Tailwind CSS or Sonner with another component library.
- Modifying underlying routing or authentication business logic.

## Decisions

### Decision 1: Extend Shared Button Components with `isLoading` and `Loader2`
- **Rationale**: Adding `isLoading?: boolean` and `loadingText?: string` to `PrimaryButton` and `SecondaryButton` ensures uniform spinner styling, accessible `aria-busy` attributes, and automatic `disabled` state handling across every form.
- **Alternatives considered**: Inline SVG spinners in each individual form (rejected: causes code duplication and inconsistent icon sizes).

### Decision 2: Standardize on Sonner with `extractApiError` Helper
- **Rationale**: Sonner is already installed and styled to match the dark lime brand theme. Replacing legacy custom `useState` toast divs in auth forms consolidates notification behavior into a single, predictable queue.
- **Alternatives considered**: Maintaining inline alert divs (rejected: inconsistent timeout behavior and clutter in form components).

### Decision 3: Reusable `<EmptyState />` UI Primitive
- **Rationale**: Creating a centralized `frontend/components/ui/EmptyState.tsx` component with preset configurations (e.g. `icon`, `title`, `description`, `action`) allows tables (`TicketsTable`, `HostRafflesTable`, `PayoutHistoryTable`, `AdminCompetitionsTable`) to render polished zero-state messaging with minimal boilerplate.
- **Alternatives considered**: Hardcoding bespoke empty state divs in every table component (rejected: inconsistent visuals).

### Decision 4: Tiered Next.js Error Boundaries
- **Rationale**:
  - `app/global-error.tsx`: Replaces the root layout when catastrophic HTML/layout crashes occur.
  - `app/error.tsx`: Handles public page SSR / runtime crashes while preserving the global navbar and footer.
  - `app/dashboard/error.tsx`: Catches dashboard errors while keeping dashboard navigation active.
- **Alternatives considered**: Single global error boundary only (rejected: breaks navigation context when an isolated subpage fails).

## Risks / Trade-offs

- **[Risk] Multiple toasts firing on fast user clicks** → *Mitigation*: Submit buttons auto-disable when `isLoading` is true to prevent duplicate mutation triggers.
- **[Risk] Error boundary swallowing errors in development** → *Mitigation*: Ensure `error.tsx` logs the error object to the console and includes a `reset()` trigger button.
- **[Risk] Styling regressions in existing button callers** → *Mitigation*: Keep existing props backwards-compatible by defaulting `isLoading` to `false`.
