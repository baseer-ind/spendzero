# MVP Scope

## Goal

Prove the core loop ("browse → simulate craving → Craving Completed →
allocate to a goal") is sticky, in guest mode, with minimal surface area.

## In scope

- **No signup wall** — full MVP experience works from a guest
  `device_id` alone.
- **One full category**: Food (2–3 fictional brands, ~30 seeded
  listings) — full flow including tracking and Craving Completed screen.
- **One partial category**: Shopping (browse + cart + checkout,
  simplified tracking) — validates the generic flow generalizes.
- **Goals**: preset list + custom goal creation, single active goal,
  progress bar, "I Saved It" / "Maybe Later" outcome recording.
- Home dashboard with full category grid; only Food/Shopping tappable,
  others "Coming soon" (signal-gathering on taps).
- History tab: list of past craving sessions with outcome.
- Optional sign-in (Google + Email only for MVP), triggered contextually,
  never gating entry.
- Basic text search within the two live categories.
- Full funnel analytics from `10-analytics-events.md` for the two live
  categories, wired to a dashboard from day one.
- Legal/financial disclaimer + minimal admin tool (catalog CRUD only).

## Explicitly deferred

- Discover AI/voice search, all other categories, achievements/streaks,
  push notifications, Apple/phone-OTP login, full admin analytics UI,
  configurators (cars/electronics/real-estate).

## Exit criteria (promote to Phase 2)

- D7 retention ≥ 20% in closed beta.
- ≥ 60% of completed craving sessions reach an outcome selection
  (saved or maybe_later — i.e., the screen isn't being abandoned).
- ≥ 40% of outcome selections are "I Saved It" (validates the savings
  mechanic resonates, not just the browsing).
- No P0/P1 bugs in checkout/tracking/Craving-Completed flow for 1 week.
