# SpendZero Milestones — Product Quality Bar

A prior "V1 complete" declaration was rejected as premature — it measured implemented
features, not real-user delight. Milestones are now redefined around the experience, not an
engineering checklist.

## Milestone definitions

- **Experience Alpha** — Core user journeys work end-to-end (navigation, data, no crashes,
  no dead ends). No claim of polish or delight. **Status: done.**
- **Experience Beta** — Premium UI, motion, imagery, and emotional design. A real user would
  describe individual screens as "nice," even before the whole app feels fully cohesive.
  **Status: done.** Two ruthless-panel review passes complete (11 findings total, all fixed and
  CI-verified as of run `28439047239`, commit `00bf7ca`). 6 lower-severity backlog items remain
  for a future pass but don't block this milestone.
- **Launch Candidate** — Confident enough to hand the APK to 20–50 testers without caveats. A
  first-time Indian consumer, given 30 minutes unsupervised: feels genuinely delighted,
  understands the purpose immediately, creates a Future, browses multiple fictional apps and
  enjoys it, uses the cart naturally, feels emotionally rewarded after choosing their Future,
  and wants to come back tomorrow. Per `docs/EXPERIENCE_BLUEPRINT.md`'s Founder Review
  Checklist: does it strengthen My Future, reduce cognitive load, and meet the Apple/CRED/
  Airbnb/Spotify bar on every screen? **Status: in progress** — Project Future rebrand and IA
  restructure (Home/My Future/Journey/Profile bottom nav, "Choose My Future" checkout reframe)
  both CI-verified; full Founder Review Checklist pass against the new IA not yet run.
- **Public V1** — Ready for Play Store/App Store submission. **Status: not started.**

## Completed milestone: Experience Beta

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
- [x] **No "return tomorrow" hook beyond streak counting.** Fixed: added a `_DailyCheckInCard`
      on the home screen — "Today's check-in: {dream} needs you today" / "keep your streak
      alive" framing, shown whenever an active dream exists, taps through to the dashboard.
      Deliberately scoped to in-app only (no push notifications/background scheduling — that
      would mean new infra, out of scope per the standing offline/no-new-infrastructure
      constraint). (`home_screen.dart`, `_DailyCheckInCard`)
- [x] **Cart screen hadn't been reviewed against the same "feels premium" bar.** Found and
      fixed the same generic-shopping-bag-icon placeholder issue on cart item thumbnails — now
      uses the same keyword-matched emoji + two-tone gradient as product cards (extracted into
      a shared `core/utils/product_emoji.dart` so cart and checkout always agree on an item's
      identity). Rest of the cart screen (coupon section, grouped-by-app headers, bill summary,
      "you're resisting this craving" framing) was already at the same quality bar as checkout.
      (`cart_screen.dart`, `product_card.dart`, `product_emoji.dart`)

All seven Experience Beta findings from the original ruthless panel review are now resolved.

### Fresh ruthless-panel pass (second review, post-7-fix)

A second review (Apple HIG / Airbnb / CRED / OneCard / first-time Indian consumer) was run
across Home, Food, Cart, Checkout, Dashboard, Goals, Achievements, and Intro to catch what the
first pass missed.

- [x] **Intro flow's final CTA was generic ("Get started"), undercutting the rich onboarding
      copy.** Fixed: now reads "Skip my first craving," echoing the core loop framed on the
      previous pages. (`intro_screen.dart`)
- [x] **Cart empty state's "Browse apps" button just popped the route — a dead end if cart was
      opened directly with nothing to pop back to.** Fixed: falls back to `context.go('/')`
      when there's no back stack. (`cart_screen.dart`)
- [x] **Checkout search "no results" state was a flat dead-end message with no recovery
      action.** Fixed: added a "Browse all {category}" button that clears the search and
      returns to the full listing. (`checkout_screen.dart`)
- [x] **Goal cards' edit action was only reachable via a hidden long-press (or burying it in
      the overflow menu) — no first-time user would discover it.** Fixed: cards now also
      respond to a single tap (in addition to long-press) with `InkWell` ripple feedback, so
      the affordance is visible and discoverable. (`goals_screen.dart`)

### Backlog for a future polish pass (found, not yet fixed — lower severity)

- [ ] Restaurant "Frequently ordered together" chips look decorative, not tappable — needs a
      proper card treatment or pressed-state styling.
- [ ] Product cards have no reserved badge slot for future sale/limited-stock treatments.
- [x] ~~Dashboard "Recent activity" hard-stops at 10 items with no "view all" link.~~ Resolved
      by the IA restructure: My Future now shows 5 most recent with a "View Journey" link to the
      new full-history Journey tab.
- [ ] Achievements unlocked cards don't show *when* a badge was unlocked.
- [ ] Cart coupon hint ("Try: ZERO10 · SAVE20 · ...") reads as static seed copy rather than
      dynamic, personalized microcopy.
- [ ] Restaurant menu "Add" sometimes opens a detail sheet and sometimes acts as an inline
      stepper — inconsistent interaction pattern versus checkout/cart.

None of these backlog items block Experience Beta — they're tracked for the next pass rather
than blocking this milestone, since none of them are placeholder-card-level failures like the
original seven.

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
