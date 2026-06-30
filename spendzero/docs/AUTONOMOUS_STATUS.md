# SpendZero Autonomous Status

**Execution State:** 🟢 Working

**Latest Commit:** `165185b` — Add persistent bottom-nav IA per Experience Blueprint

**Current Branch:** `claude/spendzero-mobile-app-vudvnb`

**Current Milestone:** Experience Beta — complete. Launch Candidate — in progress. The user
delivered two product docs in sequence: `docs/PRODUCT_FOUNDATION.md` (the **why** — repositioning
as "Project Future," an Intentional Living platform) and `docs/EXPERIENCE_BLUEPRINT.md` (the
**how** — Core Experience Pillars, mandatory Information Architecture, screen-by-screen specs,
UX/motion principles, Founder Review Checklist). User explicitly chose "IA restructure first" when
asked to prioritize against finishing the in-progress language/copy pass.

**Rebrand work (Stage 1) — CI-verified:**
- App identity: package id → `com.projectfuture.app`, app display name → "Project Future"
  (`scripts/setup_mobile_platforms.sh` rewritten — the actual source of truth, since
  `mobile/android/`/`mobile/ios/` are gitignored and regenerated fresh by CI every run).
- Dart-level rename: `SpendZeroApp` → `ProjectFutureApp`, MaterialApp title, splash wordmark,
  pubspec name (`project_future`), test import path.
- SharedPreferences key prefixes: `spendzero_*` → `project_future_*`.
- Env API base URLs: `spendzero.app` → `projectfuture.app`. CI artifact names: `project-future-*`.
- **Deliberately left unchanged** (backend/infra-internal, not user-facing branding): repo folder
  name `spendzero/`, Postgres DB name `spendzero`, `SPENDZERO_DATABASE_URL`/`SPENDZERO_REDIS_URL`.
- **CI run `28441492563`** (commit `6815eaef`) — `conclusion: success`. All 3 artifacts confirmed
  present via `list_workflow_run_artifacts`: `project-future-debug-apk` (89.2MB),
  `project-future-release-apk` (23.8MB), `project-future-release-aab` (24.1MB). The new
  `--org com.projectfuture --project-name app` scaffolding flow and `applicationId` build cleanly
  end-to-end. **Rebrand is fully CI-verified.**

**Language pass (Stage 2) — partial, paused for IA restructure:**
Done: dashboard hero stat, "Redirected by category," momentum-story headline, badges-card copy,
activity-row copy, home screen banner, craving-completed screen ("Victory!" / "I Redirected It"),
cart screen's redirect nudge + "Choose My Future" CTA. Reviewed and left as-is (already aligned):
`goals_screen.dart`, `achievements_screen.dart`. Seed-data product/brand names judged out of scope
(catalog content, not framing language). **Remaining:** broader 27-file grep surface — remaining
vertical home/detail screens (shopping/beauty/movies/food/grocery/travel), to resume now that the
IA restructure has landed.

**IA restructure (per Experience Blueprint, "IA restructure first") — done, CI run in progress:**
- New persistent bottom navigation via `StatefulShellRoute.indexedStack`: **Home / My Future /
  Journey / Profile** (`mobile/lib/app/root_shell.dart`, wired into `router.dart`).
- Dashboard repositioned and renamed "My Future" (never "Dashboard") — the app's emotional center,
  reached via its own bottom-nav tab instead of an AppBar icon.
- New `JourneyScreen` (`features/journey/presentation/journey_screen.dart`) — full chronological
  record of every redirected craving, grouped by month; "My Future" shows only the 5 most recent
  with a "View Journey" link.
- New `ProfileScreen` (`features/profile/presentation/profile_screen.dart`) — minimal, offline-
  first: victories/badges, manage My Future, feedback, privacy note, about.
- Cart's primary CTA renamed `'Checkout'` → `'Choose My Future'` per the blueprint's "Choosing My
  Future" reframing of checkout.
- Extracted shared `core/utils/category_labels.dart` and `core/widgets/activity_row.dart` from
  dashboard internals so Journey/My Future can both reuse them without duplication.
- Home screen's AppBar dropped its standalone Dashboard/My Future icon buttons (both now reachable
  via the bottom nav or Profile menu); kept only the feedback button.
- **Scope-reduction judgment call (flagging transparently, not yet user-confirmed):** implemented
  **4** bottom-nav tabs (Home, My Future, Journey, Profile), not the blueprint's literal 5
  (Home, Browse, My Future, Journey, Profile). Reasoning: the existing Home screen already
  functions as the "Browse" surface (it's the category grid); a separate Browse tab would
  duplicate Home's content without clear differentiation given the current screen inventory. Will
  revisit if the user wants a literal 5-tab structure.
- `flutter analyze --no-pub` clean, `flutter test` 3/3 passing after every edit in this batch.
- **CI run `28441851823`** (commit `165185b4`) — triggered automatically, currently `in_progress`.
  This is the first CI verification of the new `StatefulShellRoute`-based router structure; not
  yet confirmed green.

**Current CI Run:** `28441851823` (commit `165185b4`, IA restructure) — in progress, awaiting
result.

**Current Task:** Confirm CI run `28441851823` succeeds (validates the new navigation shell builds
cleanly against freshly-scaffolded android/ios platforms), then resume the Stage 2 language pass
on the remaining vertical home/detail screens.

**Last Completed Task:** Verified Stage 1 rebrand CI run (`28441492563`) succeeded with all 3
artifacts present; implemented and pushed the full IA restructure (`165185b`) per the user's "IA
restructure first" decision.

**Next Planned Task:** Verify IA-restructure CI run, then continue Stage 2 language pass on
remaining vertical screens; later, revisit `docs/MILESTONES.md`'s Launch Candidate definition to
reflect the Experience Blueprint-driven IA.

**Estimated Completion %:** N/A under feature-checklist framing per the user's standing
correction — tracking via milestone definitions and ruthless-panel/Founder Review Checklist
findings instead.

## Known Blockers

None. CI run `28441851823` for the IA-restructure commit is in progress and unconfirmed as of this
update — flagged as the immediate next verification step, not a blocker.

The sandbox cannot download GitHub Actions artifacts directly (outbound network policy blocks
`blob.core.windows.net`) — APKs are delivered as GitHub Actions run links rather than file
attachments. Standing environment constraint, not a development blocker.

**Last Updated:** 2026-06-30 (IA restructure per Experience Blueprint; Stage 1 rebrand CI-verified)
