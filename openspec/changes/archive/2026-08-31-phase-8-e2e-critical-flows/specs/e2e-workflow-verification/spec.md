## Purpose

Defines requirements for automated multi-role end-to-end workflow testing, transactional database isolation, and contract verification across customer, host, and admin personas.

## ADDED Requirements

### Requirement: Consumer Authentication & Ticket Purchase Verification
The system SHALL verify the complete consumer workflow from registration and session initialization to live ticket purchasing, instant-win claim allocation, and order history reflection.

#### Scenario: Consumer registers, logs in, and acquires raffle tickets
- **WHEN** a new consumer creates an account, authenticates, and purchases 5 tickets for an active competition
- **THEN** 5 ticket records are generated with unique numbers, the raffle remaining ticket count decrements by 5, and the tickets appear in `/tickets/my-tickets`

#### Scenario: Consumer purchases ticket matching instant win
- **WHEN** a purchased ticket matches a pre-allocated instant-win number
- **THEN** a `Winner` record with status `CLAIMED` is created and displayed in the consumer's prize inventory

### Requirement: Host Competition Lifecycle & Payout Verification
The system SHALL verify host business registration, multi-step raffle creation with instant win prize tables, and payout withdrawal execution.

#### Scenario: Host creates and submits new competition
- **WHEN** a verified host creates a competition with prize metadata and instant-win tiers
- **THEN** the competition is saved in `PENDING` state and appears in the host's competition management list

#### Scenario: Host requests earnings withdrawal
- **WHEN** a host submits a withdrawal request against accumulated ticket revenue
- **THEN** the host wallet available balance decreases by the gross request amount and a pending withdrawal record is created

### Requirement: Administrator Moderation & Draw Execution Verification
The system SHALL verify administrator review queues, competition approval / rejection, winner draw execution, and withdrawal processing.

#### Scenario: Administrator approves pending raffle
- **WHEN** an administrator approves a pending competition
- **THEN** the competition status transitions to `ACTIVE` and becomes publicly discoverable in the live raffle marketplace

#### Scenario: Administrator executes random winner draw
- **WHEN** an administrator triggers a winner draw for an ended competition
- **THEN** a random ticket is selected, a grand prize `Winner` record is created, and the raffle status updates to `ENDED`
