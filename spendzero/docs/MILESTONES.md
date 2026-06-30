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
- [x] **Restaurant "similar items" rail used a single-letter-on-gradient identity.** Fixed:
      rail cards now show a cuisine-matched emoji glyph (biryani → 🍛, pizza → 🍕, cafe → ☕,
      etc.) via local keyword lookup, same pattern as product thumbnails. The restaurant detail
      banner was reviewed and already shows name/tagline/rating/distance — no change needed
      there. (`restaurant_screen.dart`)
- [x] **Home grid read as a flat "catalog," not a "discovery surface."** Fixed: the top
      category is now promoted to a wide "Popular today" hero card above the remaining 3-col
      grid, breaking the uniform-tile pattern and giving the home screen a clear entry point.
      (`home_screen.dart`, `_FeaturedCategoryCard`)
- [x] **No onboarding moment** — first-time users landed straight on the home grid with only a
      one-time dismissible hint. Fixed: added a 3-page first-launch intro (`intro_screen.dart`)
      framing the core loop — "skip a craving, fund a dream" → "shop freely, nothing ever
      charges you" → "watch your dream get closer" — shown once via SharedPreferences flag,
      skippable, replacing the old dismissible hint card on the home grid itself.
- [x] **Achievements screen hadn't had the storytelling pass.** Fixed: the flat "X of Y
      unlocked" counter is replaced with a dynamic-headline `_StoryBanner` ("Off to a solid
      start" → "Building real momentum" → "So close to a full cabinet" → "Every badge,
      unlocked. Legend status.") plus an animated progress bar and a "Next up: {badge} —
      {progress}" highlight, matching the narrative treatment used on Dashboard/Home.
      (`achievements_screen.dart`)
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
