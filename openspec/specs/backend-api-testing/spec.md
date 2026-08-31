# backend-api-testing Specification

## Purpose
Provides a comprehensive automated test framework covering unit, integration, and end-to-end API validations for the Charity Draws NestJS backend platform.

## Requirements

### Requirement: Authentication and Authorization Verification
The system testing suite SHALL verify that user registration, login, JWT token issuance in cookies, email verification checks, and role-based access control guards operate according to security specifications.

#### Scenario: Unauthenticated request to protected route
- **WHEN** a client makes an HTTP request to a protected endpoint without an `accessToken` cookie
- **THEN** the system MUST reject the request with HTTP 401 Unauthorized

#### Scenario: Insufficient role access to restricted endpoint
- **WHEN** an authenticated user with role `CLIENT` attempts to access an endpoint protected by `@Roles('HOST')` or `@Roles('ADMIN')`
- **THEN** the system MUST reject the request with HTTP 403 Forbidden

#### Scenario: Unverified host login rejection
- **WHEN** a user with role `HOST` attempts to login before their host profile is verified by an admin
- **THEN** the system MUST reject the login with HTTP 401 Unauthorized and an informative message

### Requirement: Ticket Purchase and Allocation Integrity
The system testing suite SHALL verify that ticket purchasing accurately prevents overselling, randomly allocates available ticket numbers without duplicates, awards instant wins, and updates host wallet balances.

#### Scenario: Purchase exceeding remaining capacity
- **WHEN** a user requests to purchase a ticket quantity exceeding `totalTickets - ticketsSold`
- **THEN** the system MUST reject the purchase with HTTP 400 Bad Request and not allocate any tickets

#### Scenario: Instant win prize matching
- **WHEN** an allocated ticket number matches an unclaimed instant win prize in an active competition
- **THEN** the system MUST mark the instant win as claimed and generate a Winner record with `winType: 'INSTANT_WIN'`

#### Scenario: Host wallet balance crediting
- **WHEN** a ticket purchase transaction succeeds
- **THEN** the system MUST increment the hosting host's `walletBalance` by `ticketPrice * quantity` inside the database transaction

### Requirement: Winner Drawing and Competition Lifecycle
The system testing suite SHALL verify that winner draws transition competitions to ended state and prevent invalid draws.

#### Scenario: Drawing winner with zero tickets sold
- **WHEN** an admin attempts to draw a winner for a competition with zero tickets sold
- **THEN** the system MUST reject the draw with HTTP 400 Bad Request

#### Scenario: Preventing duplicate winner draw
- **WHEN** a winner draw is requested for a competition that already has a main draw winner
- **THEN** the system MUST reject the draw with HTTP 400 Bad Request

#### Scenario: Auto draw execution on sold out
- **WHEN** an auto-draw competition sells all available tickets
- **THEN** the system MUST automatically trigger the winner draw and update the competition status to `ENDED`

### Requirement: Host Financials and Withdrawal Lifecycle
The system testing suite SHALL verify that withdrawal requests accurately deduct available balances, calculate 10% platform fees, and refund balances upon administrative rejection.

#### Scenario: Withdrawal exceeding wallet balance
- **WHEN** a host requests a withdrawal amount greater than their `walletBalance`
- **THEN** the system MUST reject the request with HTTP 400 Bad Request

#### Scenario: Withdrawal rejection balance refund
- **WHEN** an admin rejects a pending withdrawal request
- **THEN** the host profile `walletBalance` MUST be refunded by the gross withdrawal amount in a single database transaction

### Requirement: Administrative Operations and Auditing
The system testing suite SHALL verify that administrative controls for user blocking, order refunds, host approvals, and system audit logs function correctly.

#### Scenario: User account suspension
- **WHEN** an admin toggles a user's block status to true
- **THEN** all subsequent login attempts and authenticated requests by that user MUST be rejected with HTTP 401 Unauthorized

#### Scenario: Completed order refund
- **WHEN** an admin processes a refund for a completed ticket purchase transaction
- **THEN** the transaction status MUST transition to `REFUNDED` and subsequent refund attempts on the same transaction MUST be rejected
