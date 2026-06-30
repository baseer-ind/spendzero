# SpendZero Milestones — Product Quality Bar

A prior "V1 complete" declaration was rejected as premature — it measured implemented
features, not real-user delight. Milestones are now redefined around the experience, not an
engineering checklist.

## Milestone definitions

- **Experience Alpha** — Core user journeys work end-to-end (navigation, data, no crashes,
  no dead ends). No claim of polish or delight. **Status: done.**
- **Experience Beta** — Premium UI, motion, imagery, and emotional design. A real user would
  describe individual screens as "nice," even before the whole app feels fully cohesive.
  **Status: in progress.**
- **Launch Candidate** — Confident enough to hand the APK to 20–50 testers without caveats. A
  first-time Indian consumer, given 30 minutes unsupervised: feels genuinely delighted,
  understands the purpose immediately, creates a dream, browses multiple fictional apps and
  enjoys it, uses the cart naturally, feels emotionally rewarded after checkout, and wants to
  come back tomorrow. **Status: not started.**
- **Public V1** — Ready for Play Store/App Store submission. **Status: not started.**

## Current milestone: Experience Beta

### Ruthless review (panel: Apple HIG / Airbnb / CRED / OneCard / first-time Indian consumer)
### — what still feels unfinished

- [x] **Product/menu item thumbnails were a generic shopping-bag icon on a flat color block**
      for every single item — the textbook placeholder-card failure. Fixed: thumbnails now
      show a keyword-matched emoji glyph (pizza → 🍕, kurta → 👘, phone → 📱, etc.) on a
      two-tone gradient, so items read as recognizable products instead of interchangeable
      blocks. (`product_card.dart`)
- [ ] Restaurant/store banners and the "similar items" rail still use single-letter-on-
      gradient identity. Functional, but reads as a placeholder rather than a designed brand
      mark — needs a richer treatment.
- [ ] Generic browsing screens read as a "catalog," not a "discovery surface" — weak visual
      hierarchy (uniform grid, no featured/hero items).
- [ ] No onboarding moment — first-time users land straight on the home grid with only a
      one-time dismissible hint. CRED/Airbnb-caliber apps frame the core loop ("skip a
      craving → fund a dream") before dropping users into the grid.
- [ ] Achievements screen hasn't had the storytelling pass the other four journeys got — still
      statistical rather than celebratory.
- [ ] No "return tomorrow" hook beyond streak counting — nothing proactively nudges a user
      back the next day (e.g. a daily check-in moment, "your dream needs you" framing).
- [ ] Cart screen hasn't been reviewed yet against the same "feels premium" bar as checkout
      and craving-completed.

Experience Beta is done when the unchecked items above are resolved or consciously deferred
with stated reasoning — not when a feature checklist is ticked.

## Engineering quality bar (necessary, not sufficient on its own)

- [x] `flutter analyze --no-pub` clean on every commit
- [x] `flutter test` green on every commit (money_test.dart, 3 tests)
- [x] Everything persists locally via SharedPreferences; nothing lost on restart
- [x] No real brand names/logos/trademarks; all fictional apps original
- [x] No network calls for content; fully offline simulation
- [x] No real money ever spent (simulation-only checkout)
- [x] Personalization is local/rule-based only — no AI/cloud calls
- [x] CI green with a downloadable release APK at every meaningful checkpoint

## Out of scope (still standing)

Books, Gaming, Sports, Healthcare, Finance, Pets, Jewellery, Automotive, Real Estate, Hotels,
backend/cloud sync, authentication, or any new vertical/infrastructure.
