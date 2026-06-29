# Security Architecture

## Authentication & authorization

- Guest mode: device-bound opaque token, no PII required, scoped to that
  device's goals/history only.
- Signed-in mode: Supabase Auth (Google/Apple/email/phone). JWT validated
  on every request (signature, expiry, audience). Role claims
  (`user`/`content_editor`/`admin`) checked server-side; admin routes on
  a separate router, never reachable via the consumer-app audience.
- Guest-to-account merge: single-use, short-lived merge token, rate-
  limited, audit-logged — prevents account-takeover-via-merge abuse.
- Session revocation: Redis denylist for immediate logout-everywhere.

## API security

- Rate limiting (Redis token bucket) per-user/per-device/per-IP on auth,
  search, AI, and outcome-recording endpoints.
- Idempotency keys required on `/checkout` and `/craving-sessions/{id}/
  outcome` to prevent duplicate sessions or double-counted savings from
  client retries.
- Pydantic schemas with `extra="forbid"` on every endpoint.
- Parameterized queries only (SQLAlchemy) — no raw SQL string
  interpolation.
- CORS locked to known origins (mobile app + admin dashboard only).

## Data protection

- **No real payment instrument is ever collected, transmitted, or
  stored** — by schema design (see `04-database-schema.md`), eliminating
  PCI-DSS scope and most payment-fraud surface entirely.
- PII minimization: phone/email never logged in plaintext; structured
  logs scrub known PII fields.
- TLS everywhere, including Postgres/Redis connections in production.
- Account deletion hard-deletes PII; anonymizes historical
  `craving_sessions`/`analytics_events` rows needed for aggregate
  product analytics.

## Application security

- Dependency scanning (Dependabot) on backend and mobile.
- Secrets via environment/secret manager, never committed.
- XSS: admin dashboard sanitizes all user-generated content (reviews) on
  render.

## Abuse specific to this product

- `craving_session_placed`/`outcome` endpoints are unauthenticated-
  write-adjacent (guest mode) — rate-limited per device to prevent
  automated savings-stat farming or goal-completion gaming.
- Goal-contribution amounts are always re-derived server-side from the
  session's recorded price, never trusted from the client, even though
  it's "only" a self-reported tally — keeps the core metric meaningful.
- Streak/achievement logic runs server-side only.

## Compliance posture (India-specific)

By never storing, transferring, or moving real money or payment
credentials, SpendZero is designed to fall outside RBI's Payment and
Settlement Systems Act / PPI guidelines and SEBI investment-advisory
scope. This is a product-design constraint, not just a legal disclaimer
— engineering must treat any proposed feature that touches real payment
rails as a hard stop requiring fresh legal review, not an incremental
change.

## Incident response

Structured logging + alerting on auth failure spikes, rate-limit
trigger spikes, abnormal admin-route access, and any anomalous spike in
`goal_contributions` amounts (potential tampering signal even though no
real money is at stake — protects data integrity/trust).
