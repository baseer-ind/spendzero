# SpendZero — Live Changelog

Append-only log of meaningful feature work, newest first. Each entry maps to a commit.

## 2026-06-30 — V1 sign-off

- **V1 complete.** Final commit `5d19e6d`, CI run `28435140150` (success). All four core
  journeys (Home, Food, Dream, Dashboard) have a complete storytelling/redesign pass; the
  V1 Definition of Done checklist (`docs/V1_CHECKLIST.md`) is fully satisfied.

## 2026-06-30

- **Dashboard Journey**: Added `_KeepGoingCard` CTA at the end of the dashboard — closes the
  "return to browsing" leg of the journey with a tappable gradient card routing back to `/`.
- **Dashboard Journey**: Added `_MomentumStory` banner — compares this-week vs last-week
  savings to generate a dynamic headline, plus surfaces the next locked achievement via
  `progressLabel`. Replaces pure statistics with narrative framing.
- **Dream Journey**: Craving Completed screen's goal picker now supports inline "+ New dream"
  creation via the existing `create_goal_sheet.dart` bottom sheet — no more dead end for
  first-time users at the highest-leverage emotional moment in the app.
- **Food Journey**: Added "You might also like" recommendations rail to the restaurant detail
  screen — cuisine-based similarity, sorted by rating, using `pushReplacement` to avoid back-
  stack growth.
- **Home Journey**: Hero banner is now dream-aware — shows "Saving for {dream}" with a live
  progress bar and amount-to-go when an active goal exists, falling back to "Total saved so
  far" otherwise.
- **Home Journey**: Added first-dream nudge card for users with zero active goals.
- **Home Journey**: Per-category gradient identity system (8-color palette mapped by category
  slug) replacing flat gray category tiles.
- **Home Journey**: Fixed duplicate/washed-out app-name rendering on vertical-launcher
  fictional-app cards (name was rendered twice — once in the banner, once in the body).
- CI run `28432781569` (commit `72dad34`) — green. Release APK/AAB + debug APK artifacts
  produced.
