## Context

See `proposal.md` for motivation. The application is built with Next.js 16 (App Router) and Tailwind CSS v4. Standard breakpoints used are `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), and `2xl` (1536px). Fixed bottom elements (e.g. `MobileBottomDock` height 64px) and high-density tabular data currently cause overlap or horizontal overflow on smaller screens.

## Goals / Non-Goals

**Goals:**
- Eliminate bottom dock overlap on viewports `< 1024px` by enforcing responsive bottom padding across `DashboardShell.tsx` and public layouts.
- Standardize all administrative and host data tables to use responsive scroll wrappers (`overflow-x-auto scrollbar-thin`) with `min-w` table constraints.
- Ensure all interactive modals adapt to small screens (`w-[95vw] sm:max-w-[540px] max-h-[85vh]`) with pinned action headers/footers and scrollable form bodies.
- Verify touch targets meet WCAG 2.1 AA accessibility standards (minimum 44px by 44px).

**Non-Goals:**
- Removing or redesigning the desktop multi-column layouts.
- Changing core brand colors or typography hierarchy.

## Decisions

### Decision 1: Responsive Bottom Clearance Standard (`pb-24 lg:pb-8`)
- **Rationale**: The fixed `MobileBottomDock` has a height of 64px (`h-16`) and `z-50`. Applying `pb-24` on mobile and `lg:pb-8` on desktop in `DashboardShell.tsx` and `WebsiteFooter.tsx` guarantees that pagination bars, CTA buttons, and legal copy remain completely unobstructed across all device viewports.
- **Alternatives considered**: Hiding the bottom dock on table views (rejected: disrupts user navigation between public pages and user portal).

### Decision 2: Standardized Scrollable Table Container Pattern
- **Rationale**: Applying `w-full bg-surface border border-border rounded-card overflow-x-auto scrollbar-thin` with an inner table `min-w-[900px]` to `min-w-[1100px]` allows data-rich tables to scroll horizontally without breaking the outer page container.
- **Alternatives considered**: Hiding table columns on mobile (rejected: vital administrative metadata like transaction IDs and status pills would be lost).

### Decision 3: Pinned Header/Footer Modal Pattern
- **Rationale**: Setting `max-w-[95vw] sm:max-w-[540px]` on modal dialog cards and splitting them into a pinned header, a scrollable body (`max-h-[65vh] overflow-y-auto`), and a pinned footer ensures that users on shorter viewports (e.g., landscape orientation or iPhone SE) can always see form context and the submit button.
- **Alternatives considered**: Allowing the entire modal to grow unbounded (rejected: causes buttons to render below the viewport fold).

## Risks / Trade-offs

- **[Risk] Horizontal scrollbars appearing on wide desktop screens** → *Mitigation*: Set container to `w-full overflow-x-auto` so scrollbars only appear when the viewport width is narrower than the table `min-w`.
- **[Risk] Sticky headers jumping during mobile address bar collapse** → *Mitigation*: Use standard viewport units (`dvh` or `h-screen`) and avoid nested fixed positioning hacks.
