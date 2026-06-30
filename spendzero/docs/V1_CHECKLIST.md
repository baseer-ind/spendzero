# SpendZero V1 — Definition of Done

A checklist of what "Version 1.0" means for this project. V1 is complete when every mandatory
item below is checked and a fresh green CI build with APK exists for the final commit.

## Core journeys (must each feel complete end-to-end, not just functional)

- [x] **Home Journey** — Open app → Discover → Choose fictional app → Browse → Feel excited.
  - [x] Dream-aware hero banner (shows active goal progress, not just a raw total)
  - [x] First-dream nudge for users with no goals yet
  - [x] Distinct per-category gradient identity on category tiles
  - [x] Distinct per-app branding on fictional app cards (no duplicate/washed-out naming)
- [x] **Food Journey** — Choose Zwigato → Browse restaurants → Open restaurant → Products →
      Images → Reviews → Recommendations → Add to cart → Checkout.
  - [x] Restaurant browse + detail screens
  - [x] Reviews section
  - [x] "You might also like" recommendations rail
  - [x] Cart + checkout flow
- [x] **Dream Journey** — Checkout → Craving Completed → Choose Dream → Create Dream →
      Dashboard updated → Achievement → Progress animation.
  - [x] Craving Completed celebration screen (confetti, haptics, affirmation)
  - [x] Goal picker with inline "+ New dream" creation (no dead end for first-time users)
  - [x] Live dream-progress preview before confirming
  - [x] Achievement unlock + streak milestone dialogs
- [x] **Dashboard Journey** — Open dashboard → Immediately understand progress → Feel
      motivated → Return to browsing.
  - [x] Hero header with totals + streaks + top dream
  - [x] Momentum story banner (weekly trend + next achievement, not raw stats)
  - [x] Stat grid, weekly chart, category breakdown, dreams summary, recent activity
  - [x] "Keep going" CTA back into browsing (closes the loop)

## Cross-cutting quality bars

- [x] Full click-through of all four journeys back-to-back feels cohesive (one pass, no
      regressions introduced by later journeys) — verified all navigation targets used by the
      new journey work (`/goals`, `/cart`, `/food/:categoryId/restaurant/:restaurantId`, `/`)
      resolve to real routes in `app/router.dart`; no dangling links introduced.
- [x] `flutter analyze --no-pub` clean on every commit
- [x] `flutter test` green on every commit (money_test.dart, 3 tests)
- [x] Everything persists locally via SharedPreferences; nothing lost on restart
- [x] No real brand names/logos/trademarks; all fictional apps original
- [x] No network calls for content; fully offline simulation
- [x] No real money ever spent (simulation-only checkout)
- [x] Personalization is local/rule-based only — no AI/cloud calls

## Release artifacts

- [x] CI green on `claude/spendzero-mobile-app-vudvnb` with latest journey work
- [x] Release APK artifact produced and downloadable from GitHub Actions
- [ ] Final V1 tag/commit identified once the latest CI run (for commit `5d19e6d`) is
      confirmed green

## Out of scope for V1 (do not start)

Books, Gaming, Sports, Healthcare, Finance, Pets, Jewellery, Automotive, Real Estate, Hotels,
backend/cloud sync, authentication, or any new vertical/infrastructure.
