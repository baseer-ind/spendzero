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
| Seed data (fictional categories/brands/listings) | ✅ | `app/db/seed.py` |
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

## Immediately next (priority order, retention-first)

1. Shareable savings/achievement card (screenshot-ready "I saved ₹X toward
   my Goa Trip 🔥 7-day streak" card) — virality hook, lets a delight
   moment turn into word-of-mouth.
2. Monthly/weekly savings recap (Spotify-Wrapped-style) to re-engage users
   who haven't opened the app in a few days.
3. Cart item options/customization UI (size/variant pickers) — still
   useful, lower emotional leverage than the above.
4. Supabase auth: promote a guest device identity to a full account
   without losing saved progress — needed for durability, not urgent for
   delight, so behind the above.
5. Analytics event ingestion; admin dashboard API.
