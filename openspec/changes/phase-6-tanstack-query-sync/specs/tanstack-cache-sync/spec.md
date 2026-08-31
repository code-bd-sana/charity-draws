## Purpose

Defines requirements for automated cache invalidation, prefix-based query key synchronization, and zero stale state across all multi-tenant roles.

## ADDED Requirements

### Requirement: Cross-Role Ticket Purchase Cache Invalidation
The system SHALL automatically invalidate and refresh ticket inventory, user ticket lists, instant win records, and host revenue caches upon successful ticket purchases.

#### Scenario: Client completes ticket order
- **WHEN** a client successfully purchases tickets for a raffle
- **THEN** the client's ticket collection (`['tickets', 'my']`), raffle details (`['raffles', 'detail']`), public live cards (`['raffles', 'public']`), and host dashboard stats (`['hosts', 'overview']`) are immediately invalidated and refetched

#### Scenario: Ticket purchase matches instant win prize
- **WHEN** a ticket purchase contains an instant-win prize match
- **THEN** the client's prize history (`['winners', 'my']`) and the raffle instant-win list (`['raffles', 'detail']`) are refreshed immediately

### Requirement: Host and Admin Raffle Lifecycle State Synchronization
The system SHALL synchronize raffle approval, modification, and deletion states across host, administrator, and public consumer interfaces.

#### Scenario: Host creates new competition
- **WHEN** a host creates a new raffle
- **THEN** the host competitions table (`['raffles', 'host']`), host overview (`['hosts', 'overview']`), and admin approval queue (`['raffles', 'admin', 'pending']`) are invalidated

#### Scenario: Administrator approves pending competition
- **WHEN** an administrator approves a competition
- **THEN** the admin approval queue (`['raffles', 'admin', 'pending']`), admin all raffles (`['raffles', 'admin', 'all']`), host competitions (`['raffles', 'host']`), and public live raffles (`['raffles', 'public']`) are invalidated

#### Scenario: Host or administrator executes winner draw
- **WHEN** a winner draw is executed for a completed raffle
- **THEN** the raffle detail status (`['raffles', 'detail']`), public winners showcase (`['winners', 'public']`), host competitions (`['raffles', 'host']`), and admin stats (`['admin', 'stats']`) are invalidated

### Requirement: Bidirectional Withdrawal Status Synchronization
The system SHALL synchronize host balance deductions, pending withdrawal logs, and administrator approval queues when payouts are requested or processed.

#### Scenario: Host submits withdrawal request
- **WHEN** a host requests a payout withdrawal
- **THEN** the host wallet metrics (`['hosts', 'wallet', 'stats']`), withdrawal history (`['hosts', 'wallet', 'history']`), and administrator withdrawal queue (`['admin', 'withdrawals']`) are invalidated

#### Scenario: Administrator approves or rejects withdrawal
- **WHEN** an administrator updates a withdrawal status
- **THEN** the admin withdrawal table (`['admin', 'withdrawals']`), host wallet metrics (`['hosts', 'wallet', 'stats']`), and host withdrawal history (`['hosts', 'wallet', 'history']`) are invalidated
