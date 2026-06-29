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
| Categories/brands/listings API | ✅ | read-only, no pagination/search yet ⬜ |
| Goals API | ✅ | create/list; update/delete/archive ⬜ |
| Checkout → Craving Completed → outcome API | ✅ | prices from real listings; cart persistence (`carts`/`cart_items`) not yet wired ⬜ |
| Stats aggregation | ✅ | total saved, cravings completed; streaks ⬜ |
| Tests | 🚧 | smoke tests only (`tests/test_smoke.py`); needs a Postgres-backed integration suite in CI |
| Rate limiting / Redis caching | ⬜ | |
| Analytics events table + ingestion | ⬜ | |
| Admin dashboard API | ⬜ | |
| CI (GitHub Actions) | ⬜ | |

## Mobile (Flutter)

| Area | Status | Notes |
|---|---|---|
| App shell, theme, go_router | ✅ | |
| Networking layer (http client, device id, repositories) | ✅ | `lib/core/network/`, `lib/core/data/` |
| Home screen (categories + savings banner) | ✅ | loading/error/empty states wired |
| Goals screen | ✅ | loading/error/empty states wired; create-goal UI ⬜ |
| Category browsing (per-category product grid) | ✅ | `CheckoutScreen` lists real `/categories/{id}/listings`, multi-select cart |
| Cart / customization | 🚧 | quantity-1 multi-select only; options/customization, persisted `carts` table ⬜ |
| Real checkout wired to `/craving-sessions/checkout` | ✅ | |
| Craving Completed screen wired to outcome API | ✅ | goal picker chips call `/outcome` with `saved`/`maybe_later` |
| Account creation / Supabase auth | ⬜ | |
| Push notifications | ⬜ | |
| Tests | 🚧 | `test/money_test.dart` only |

## Immediately next (priority order)

1. GitHub Actions CI: backend pytest + ruff, mobile `flutter analyze`
   + `flutter test`.
2. Goal creation UI (bottom sheet) calling `POST /goals`.
3. Persist the cart (`carts`/`cart_items`) instead of building the
   checkout payload client-side only, so an abandoned cart can be
   resumed.
4. Replace per-listing `CheckboxListTile` with a real product card +
   image, matching `docs/07-design-system.md` / `08-component-library.md`.
