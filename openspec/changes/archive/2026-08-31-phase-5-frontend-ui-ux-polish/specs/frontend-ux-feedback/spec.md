## Purpose

Defines requirements for unified toast notifications, accessible form submit loading states, reusable empty state displays across data tables, and tiered Next.js error boundaries.

## ADDED Requirements

### Requirement: Form Submission Loading State and Mutation Lock
The system SHALL display an animated loading spinner within form submit buttons and disable all interactive submit controls during active mutation requests to prevent duplicate submissions.

#### Scenario: User submits authentication form
- **WHEN** user clicks the submit button on any login, registration, or password reset form
- **THEN** the button displays an animated spinner, enters a disabled visual state, and ignores subsequent clicks until the request completes

#### Scenario: Form submission completes with error
- **WHEN** the backend returns an error response for a form submission
- **THEN** the button reverts to its enabled state and re-enables interactive submission

### Requirement: Unified Toast Feedback System
The system SHALL present all application alerts, mutation successes, and API exception errors through the global Sonner toast notification interface.

#### Scenario: Successful user action notification
- **WHEN** an asynchronous user action succeeds (such as registration, raffle creation, or withdrawal request)
- **THEN** a green/themed Sonner toast displays the success confirmation message

#### Scenario: API request failure notification
- **WHEN** an API mutation fails with an error payload
- **THEN** an error Sonner toast displays the extracted error message from the backend response

### Requirement: Contextual Empty State Displays
The system SHALL render dedicated empty state illustrations, contextual descriptions, and actionable call-to-action buttons when tables, collections, or search queries yield zero items.

#### Scenario: User has zero purchased tickets
- **WHEN** user navigates to the "My Tickets" dashboard and has no recorded ticket purchases
- **THEN** the system displays the empty state indicator with a message and a button linking to live draws

#### Scenario: Filter yields no competitions
- **WHEN** a host or administrator applies filters resulting in zero matching competitions
- **THEN** the system displays a filter-aware empty state with a reset filter action

### Requirement: Multi-Tiered Next.js Error Boundaries
The system SHALL catch unhandled client runtime exceptions through tiered Next.js App Router error boundaries without breaking global layout components.

#### Scenario: Public page runtime crash
- **WHEN** an unhandled runtime error occurs on a public SSR route
- **THEN** `app/error.tsx` renders a graceful recovery view with "Try Again" and "Return Home" actions while preserving the main navbar and footer

#### Scenario: Dashboard runtime crash
- **WHEN** an unhandled runtime error occurs inside the dashboard subtree
- **THEN** `app/dashboard/error.tsx` renders an isolated recovery panel while preserving dashboard sidebar and topbar navigation
