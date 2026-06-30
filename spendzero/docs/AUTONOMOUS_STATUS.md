# SpendZero Autonomous Status

**Execution State:** 🟢 Working

**Latest Commit:** pending — Project Future rebrand + language pass (this update, CI not yet
verified for the new commits)

**Current Branch:** `claude/spendzero-mobile-app-vudvnb`

**Current Milestone:** Experience Beta — complete. Launch Candidate — in progress. A new
`docs/PRODUCT_FOUNDATION.md` was delivered by the user, repositioning the product as
"Project Future," an Intentional Living platform (not a finance/budgeting/expense/shopping app).
User explicitly chose full rebrand scope (name, package id, docs, CI artifacts) plus a copy/
language pass aligning all user-facing text with the foundation doc's language table
(Savings→Redirected, Goal→My Future, Achievement→Victory/Milestone, Statistics→Progress).

**Rebrand work done this session:**
- App identity: package id / bundle id → `com.projectfuture.app`, app display name → "Project
  Future" (`scripts/setup_mobile_platforms.sh` rewritten — this is the actual source of truth,
  since `mobile/android/` and `mobile/ios/` are gitignored and regenerated fresh by CI on every
  run).
- Dart-level rename: `SpendZeroApp` → `ProjectFutureApp`, MaterialApp title, splash screen
  wordmark, pubspec name (`project_future`), test import path.
- SharedPreferences key prefixes: `spendzero_*` → `project_future_*` (device id, cart,
  personalization, wishlist, achievements-seen, intro-seen). Safe lossless rename — no
  production users yet.
- Env API base URLs (`staging.json`/`production.json`): `spendzero.app` → `projectfuture.app`.
- CI artifact names: `spendzero-*-apk/aab` → `project-future-*-apk/aab`.
- **Deliberately left unchanged** (scoped as backend/infra-internal, not user-facing app
  branding): top-level repo folder name `spendzero/`, Postgres DB name `spendzero`,
  `SPENDZERO_DATABASE_URL`/`SPENDZERO_REDIS_URL` env var names in `ci.yml`/backend config.
- Language pass (Stage 2, in progress): dashboard AppBar title, hero "Redirected toward your
  future" stat, "Redirected by category" section, momentum-story headline copy, badges-card
  "victories unlocked" copy, activity-row "Redirected ₹X from {category}" copy, home screen
  banner copy, craving-completed screen's "Victory!" headline and "I Redirected It" CTA, cart
  screen's checkout nudge copy. Remaining: goals_screen.dart and achievements_screen.dart were
  reviewed and already use dream/badge framing consistent with the foundation doc, so left as-is;
  seed-data files (product/brand names) were judged out of scope since they're catalog content,
  not framing language.

**Current APK Version:** `project-future-release-apk` — not yet built; CI has not been triggered
since the rebrand changes (package id, app name) were made. This is the next verification step:
confirm `flutter build apk`/`appbundle` succeed end-to-end with the new
`--org com.projectfuture --project-name app` scaffolding flow and the new `applicationId`.

**Current CI Run:** none triggered yet for the rebrand commits — about to trigger.

**Current Task:** Verify the rebrand builds cleanly via CI (package id change is the highest-risk
part — first time this scaffolding flow has been exercised with the new org/project-name), then
continue the language pass and Launch Candidate readiness work.

**Last Completed Task:** Committed and pushed Stage 1 (app identity) and Stage 2 (language pass,
partial) rebrand work; `flutter analyze`/`flutter test` clean throughout.

**Next Planned Task:** Trigger CI, verify all 3 artifacts build successfully with the new
package id/app name. If clean, continue Launch Candidate readiness pass per
`docs/MILESTONES.md`'s definition.

**Estimated Completion %:** N/A under feature-checklist framing per the user's standing
correction — tracking via milestone definitions and ruthless-panel review findings instead.

## Known Blockers

None. The package id / app name change via `scripts/setup_mobile_platforms.sh` is unverified by
CI as of this status update — flagged as the immediate next verification step, not a blocker.

The sandbox cannot download GitHub Actions artifacts directly (outbound network policy blocks
`blob.core.windows.net`) — APKs are delivered as GitHub Actions run links rather than file
attachments. Standing environment constraint, not a development blocker.

**Last Updated:** 2026-06-30 (Project Future rebrand + language pass, post-foundation-doc)
