# Engineering Status (living doc)

This file tracks actual implementation status against the phases in
`11-roadmap.md` and the exit criteria in `18-development-plan.md`. Update
it at the end of every work session — it is the source of truth for
"what's actually built" vs. "what's planned."

Legend: ✅ done · 🚧 in progress · ⬜ not started

## Backend (FastAPI)

| Area | Status | Notes |
|---|---|---|
| Project scaffold, config, Docker | ✅ | |
| DB models (users, goals, catalog, commerce sim, stats) | ✅ | `app/models/` |
| Alembic migrations | ✅ | `migrations/versions/0001_initial_schema.py` — hand-written, needs a live Postgres to verify `upgrade`/`downgrade` round-trip |
| Seed data (fictional categories/brands/listings) | ✅ | `app/db/seed.py` — ~150 listings across 12 categories, plus an idempotent demo guest user (`demo-device-001`) with 3 goals, a 10-day save streak, and ~₹15k in realistic stats so a fresh install never looks empty |
| Environment config (dev/staging/prod) | ✅ | `app/core/config.py` loads `.env` + `.env.<SPENDZERO_ENV>` (default `development`); `.env.example`/`.env.staging.example`/`.env.production.example` templates, real `.env.development` committed (no secrets) for zero-config local dev |
| CORS | ✅ | `CORSMiddleware` in `app/main.py`, origins from `SPENDZERO_CORS_ORIGINS` (`*` in dev) |
| Guest-device auth | ✅ | header-based, `app/core/deps.py`; Supabase account linking still ⬜ |
| Categories/brands/listings API | ✅ | `/categories/{id}/listings` supports `q` (title search via `ilike`/trgm index), `limit`/`offset` pagination |
| Goals API | ✅ | create/list; update/delete/archive ⬜ |
| Checkout → Craving Completed → outcome API | ✅ | prices from real listings |
| Cart persistence (`carts`/`cart_items`) | ✅ | `GET /carts/{category_id}` resumes the open cart, `PUT /carts/{category_id}/items` upserts it; checkout marks the cart `converted` and a fresh open cart is created on next visit |
| Stats aggregation + streaks | ✅ | `GET /me/stats`; `current_streak_days`/`longest_streak_days` computed from `last_saved_date` on each "I Saved It", verified end-to-end (increment on consecutive days, reset after a gap) against a live Postgres instance |
| Tests | 🚧 | smoke tests only (`tests/test_smoke.py`); needs a Postgres-backed integration suite in CI |
| Rate limiting / Redis caching | ✅ | fixed-window limiter (`app/core/rate_limit.py`) on goal creation, checkout, outcome, cart save; fails open if Redis is unreachable; verified live (20-req limit on goal creation → 21st request gets 429) |
| Analytics events table + ingestion | ⬜ | |
| Admin dashboard API | ⬜ | |
| CI (GitHub Actions) | ✅ | `.github/workflows/ci.yml` — backend (Postgres service, ruff, alembic upgrade, pytest) + mobile (flutter analyze/test) jobs |

## Mobile (Flutter)

| Area | Status | Notes |
|---|---|---|
| App shell, theme, go_router | ✅ | |
| Networking layer (http client, device id, repositories) | ✅ | `lib/core/network/`, `lib/core/data/` |
| Home screen (categories + savings banner) | ✅ | banner now reads `/me/stats` (true self-reported total, not just goal-allocated savings) and shows a 🔥 streak badge; loading/error/empty states wired |
| Goals screen | ✅ | loading/error/empty states + create-goal bottom sheet (presets + custom) |
| Category browsing (per-category product grid) | ✅ | `CheckoutScreen` lists real `/categories/{id}/listings` via real `ProductCard`s (rating, MRP/discount, quantity stepper) with a debounced search box wired to the backend `q` param |
| Cart / customization | 🚧 | per-item quantity stepper, persisted server-side and resumable across restarts; options/customization UI ⬜ |
| Real checkout wired to `/craving-sessions/checkout` | ✅ | |
| Craving Completed screen wired to outcome API | ✅ | goal picker chips call `/outcome` with `saved`/`maybe_later`; confetti burst + haptics on every save, live "dream progress" preview bar (shows the linked goal's bar animating forward *before* confirming, framing the amount as "₹X closer to Goa Trip" not an abstract number), and a streak-milestone dialog at 3/7/14/30/60/100 days |
| Account creation / Supabase auth | ⬜ | |
| Push notifications | ⬜ | |
| Tests | 🚧 | `test/money_test.dart` only |
| Base URL config (no hardcoded localhost) | ✅ | `lib/core/config/env.dart` — explicit `--dart-define` > `env/*.json` file > runtime per-platform fallback (10.0.2.2 on Android, localhost elsewhere) |
| Android/iOS platform scaffolding | 🚧 | `mobile/android/` and `mobile/ios/` are not checked into this repo (machine/SDK-specific build output) — generated locally via `scripts/setup_mobile_platforms.sh`, which also sets the application id (`com.spendzero.app`), app name, and the release `INTERNET` permission |

## Developer experience / device testing

| Area | Status | Notes |
|---|---|---|
| One-command local stack | ✅ | `./scripts/dev.sh` — Postgres+Redis (docker compose) → migrate → seed → backend (`uvicorn --reload`, bound to `0.0.0.0`) → health check; verified live end-to-end including idempotent re-seed |
| Physical device base-URL detection | ✅ | `scripts/run_mobile.sh android\|ios` — detects emulator vs. physical device via `adb`/`flutter devices`, auto-injects the host LAN IP for physical devices via `scripts/lan_ip.sh` |
| Release build scripts | ✅ | `scripts/build_release.sh {apk,appbundle,ios-archive} {development,staging,production}` |
| Makefile wrapper | ✅ | `make dev`, `make android`, `make ios`, `make apk ENV=production`, etc. |
| "Running SpendZero Locally" guide | ✅ | `docs/20-running-locally.md` — prerequisites, USB debugging setup, env config, troubleshooting table, beta-readiness checklist |
| Beta distribution (Play Internal/Closed, TestFlight) | ⬜ | architecturally unblocked; still needs a Play Console upload keystore and an Apple Developer account, both of which are account/credential steps for the user, not code |

## Product direction (as of this entry)

Reframing SpendZero as a habit-forming "dreams over money" platform, not a
shopping-simulator/budgeting app. Retention/delight work is now prioritized
over backend work unless backend is literally blocking. Every new feature
is filtered through: does this make someone want to open the app again
tomorrow?

Just shipped under this lens: confetti + haptics + a live dream-progress
bar on the Craving Completed screen (the core emotional payoff moment),
plus streak-milestone celebration dialogs. Rationale: this is the single
highest-frequency, highest-emotion screen in the app — every checkout ends
here — so it had the most leverage per hour of work, ahead of any
unstarted backend item.

Devex/device-testing work above was completed as a deliberate pause on the
retention-first roadmap (per explicit instruction) so the app could be
installed and used on a real phone like an early beta tester. Resuming the
roadmap below at item 1.

## Founder QA Mode (current phase — supersedes the feature roadmap below)

Per explicit instruction, new feature work is paused. Focus is on making
the existing app feel polished and ready for real human testers:
self-test every screen/state, a 5-persona founder walkthrough, a UX
audit, App Store/Play readiness, a performance review, and a living Bug
Bash. See `docs/21-bug-bash.md` (issue log) and `docs/22-release-readiness.md`
(store readiness, performance notes, first-beta package).

Fixed this pass:
- **Critical**: double-checkout possible via Android back button from the
  Craving Completed screen (stale in-memory cart quantities weren't
  cleared after a successful checkout) — `mobile/lib/features/checkout/presentation/checkout_screen.dart`.
- **High**: `formatPaise` used Western 3-digit comma grouping instead of
  Indian lakh/crore grouping (e.g. showed "₹150,000" instead of
  "₹1,50,000") — `mobile/lib/core/utils/money.dart`, affects every money
  display in the app.

Open, not yet fixed (tracked in the Bug Bash doc): confetti/haptic firing
on screen-load rather than on the "I Saved It" decision; no app-wide
offline banner or request timeout; no crash reporting/analytics; no app
icon/native splash/privacy policy/legal disclaimer yet.

Second QA pass added: 5-persona real-user simulation, "first five
minutes" journey audit, an honest App Store gut-check, and final
validation — see `docs/23-validation-review.md`. Shipped this pass:
- A one-time, dismissible first-launch hint on Home explaining the
  concept before the first checkout (closed the biggest "what do I even
  do here" gap found across personas).
- In-app feedback flow: "Send feedback" sheet (star rating + free text)
  posting to a new `POST /api/v1/feedback` backend endpoint, plus a
  `/diagnostics` screen (app version, env, API base URL, device id, live
  API health) reachable from it — both aimed at the first 20 beta testers.
- A crash-hook placeholder (`FlutterError.onError` in `main.dart`) marking
  exactly where a real reporter (Sentry/Crashlytics) plugs in once that
  account exists.

Will resume the feature roadmap once no Critical/High items remain open
and the app is beta-ready.

## Roadmap (paused — see Founder QA Mode above; reprioritized per validation review)

1. **Push notifications** — promoted to #1. Validated across personas as
   the single biggest retention risk: nothing currently brings a user
   back if they don't remember to open the app on their own.
2. **Minimal craving history view** — promoted to #2. The data already
   exists server-side (`CravingSession` rows); surfacing a simple
   reverse-chronological list closes the "what did I resist last week"
   gap identified for the budget-conscious persona, for a small build.
3. Shareable savings/achievement card (screenshot-ready "I saved ₹X toward
   my Goa Trip 🔥 7-day streak" card) — virality hook, lets a delight
   moment turn into word-of-mouth. Still high-value, now behind the two
   retention items above.
4. Monthly/weekly savings recap (Spotify-Wrapped-style) to re-engage users
   who haven't opened the app in a few days.
5. Cart item options/customization UI (size/variant pickers) — still
   useful, lower emotional leverage than the above.
6. Goal editing/deletion — currently a permanent typo if mistyped; small
   fix, not yet done.
7. Supabase auth: promote a guest device identity to a full account
   without losing saved progress — needed for durability, not urgent for
   delight, so behind the above.
8. Analytics event ingestion; admin dashboard API.
