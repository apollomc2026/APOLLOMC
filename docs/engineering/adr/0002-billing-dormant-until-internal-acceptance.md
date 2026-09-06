# ADR 0002: Billing remains dormant until internal acceptance

- Status: Accepted
- Date: 2026-09-06

## Decision

APOLLO 3.0 establishes provider-neutral billing contracts and activation gates now, but it does not contact a payment provider, create customers or intents, accept webhooks, gate artifacts on payment, or collect money during internal operation.

`BILLING_MODE=internal` is the secure default. Provider credentials do not override it. Checkout returns a controlled unavailable response and Stripe webhooks return unavailable before the Stripe client is initialized.

## Activation gate

Moving to test or live billing requires a separate reviewed change after the mission-to-artifact journey passes internal acceptance. That change must implement idempotent checkout and webhook processing, amount/currency/customer reconciliation, an event ledger, notification outbox, refunds/support policy, privacy terms and explicit owner approval.

## Consequences

- Internal product work is not blocked by payment plumbing.
- Existing Stripe code remains dormant lineage, not an active integration.
- UI must not promise payment, subscriptions, invoices or payment-gated delivery.
- Delivery and custody for internal users are governed separately from commercial entitlement.
