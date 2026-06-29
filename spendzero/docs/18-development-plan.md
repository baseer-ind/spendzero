# Development Plan & Milestones

Each milestone has an explicit exit criterion.

## Milestone 0 — Foundations (Weeks 1–2)
- Repo scaffolds (this commit): backend skeleton, mobile skeleton, docs.
- Supabase project + auth providers (Google + Email) configured.
- Postgres schema migrated (Alembic), Redis provisioned.
- CI: lint + type-check + test pipeline for backend and mobile.
- **Exit criteria**: `docker-compose up` brings up API + DB + Redis
  locally; `/api/v1/health` returns 200; mobile app builds and shows
  splash screen.

## Milestone 1 — Guest Mode & Goals Foundation (Weeks 3–4)
- Guest device-session model, `goals`/`goal_contributions` tables live,
  Goals tab (presets + custom creation), legal/financial disclaimer.
- **Exit criteria**: a fresh install with zero signup can create a goal
  and see it persist across app restarts (local + guest-token backed).

## Milestone 2 — Food Category Full Loop (Weeks 5–8)
- Catalog seeded (2–3 brands, ~30 listings), browse/detail/cart/checkout/
  tracking/Craving-Completed screens, outcome recording wired to goals.
- **Exit criteria**: guest user goes Home → Food → browse → cart →
  checkout → tracking → Craving Completed → "I Saved It" → sees goal
  progress bar update, with all funnel events firing per
  `10-analytics-events.md`.

## Milestone 3 — Shopping Category + History (Weeks 9–10)
- Generalize commerce flow to a second category; History tab lists past
  sessions with outcomes.
- **Exit criteria**: MVP scope (`12-mvp-scope.md`) fully met; closed
  beta ready to ship.

## Milestone 4 — Closed Beta (Weeks 11–12)
- Ship to 500–1000 invited users, instrument dashboards, daily metrics
  review against MVP exit criteria.

## Milestone 5 — V2 Build-out (Weeks 13–22)
- Per `13-v2-features.md`: remaining core categories, Discover/AI search,
  contextual sign-in + account merge, achievements/streaks, admin
  analytics dashboard.
- **Exit criteria**: each feature ships behind a flag, staged rollout,
  measured against its own success metric before full rollout.

## Milestone 6 — Hardening & Launch Prep (Weeks 23–26)
- Security review against `17-security-architecture.md`, load testing
  against `16-scalability-plan.md` growth triggers, financial-claims
  copy audit across every screen, store submission with compliance
  checklist from `legal-and-branding-safety.md`.
- **Exit criteria**: store approval obtained on at least one platform;
  zero open P0/P1 security or compliance findings.

## Milestone 7 — GA Launch (Week 27+)
- Phased rollout per `15-launch-strategy.md`.

## Ongoing
- V3 features (`14-v3-features.md`) prioritized post-GA based on observed
  usage data.
- Technical debt log maintained in `docs/TECH_DEBT.md`, created when the
  first real debt item is incurred.
