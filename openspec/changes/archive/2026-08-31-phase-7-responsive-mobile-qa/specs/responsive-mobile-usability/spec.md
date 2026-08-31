## Purpose

Defines responsive layout requirements, mobile drawer usability, horizontal table scrolling, and modal viewport adaptation across standard device breakpoints.

## ADDED Requirements

### Requirement: Bottom Dock Clearance on Small Devices
The system SHALL ensure page content, table pagination controls, and action buttons provide sufficient bottom clearance on viewports under 1024px to prevent occlusion by the fixed mobile bottom dock.

#### Scenario: User navigates dashboard on smartphone viewport
- **WHEN** a user views a dashboard page on a mobile device under 1024px wide
- **THEN** a minimum of 80px (`pb-24`) bottom padding is applied to the main content container, leaving all pagination controls and footer actions fully visible above the dock

#### Scenario: User scrolls to bottom of public website footer
- **WHEN** a user reaches the bottom of the public website on a mobile device
- **THEN** the regulatory legal copy and SSL badge remain fully legible above the mobile bottom dock

### Requirement: Horizontal Scrolling for Data Tables
The system SHALL wrap all tabular data structures in scrollable container elements with minimum width constraints, preventing page-level horizontal overflow on viewports under 768px.

#### Scenario: Administrator views orders table on mobile
- **WHEN** an administrator views the orders or withdrawals table on a screen narrower than 768px
- **THEN** the table scrolls smoothly horizontally inside its rounded container while the outer page maintains a fixed vertical scroll layout

### Requirement: Constrained Modal Form Viewports
The system SHALL constrain interactive modal dialogs to responsive dimensions with scrollable internal body content and pinned action footers.

#### Scenario: Host opens withdrawal request modal on mobile device
- **WHEN** a host opens the withdrawal request modal on a 375px viewport
- **THEN** the modal width fits within 95% of the viewport width, the form body scrolls within an 85vh maximum height, and the submit button remains accessible without being cut off

### Requirement: Responsive Navigation Drawer Usability
The system SHALL provide smooth slide-in drawer navigation with high-contrast active route indicators and a minimum 44px tap target size on mobile viewports.

#### Scenario: User toggles mobile dashboard menu
- **WHEN** a user taps the menu toggle icon on mobile
- **THEN** the sidebar drawer animates smoothly into view with a semi-transparent backdrop blur, and tapping the backdrop closes the drawer
