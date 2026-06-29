# SpendZero — Backend

FastAPI service implementing the simulated-commerce + goals APIs
described in `../docs/05-backend-apis.md`, against the schema in
`../docs/04-database-schema.md`.

```
backend/
  app/
    api/        # FastAPI routers (categories, goals, craving-sessions, health)
    core/       # config, auth deps (guest-device for now)
    db/         # async session factory, seed script
    models/     # SQLAlchemy models
    schemas/    # Pydantic request/response models
    services/   # business logic (checkout simulation, savings ledger)
    workers/    # arq background jobs
  migrations/   # Alembic migrations
  tests/        # pytest suite
```

## Local development

```bash
docker compose up -d db redis
pip install -r requirements-dev.txt

# apply schema
alembic upgrade head

# load fictional categories/brands/listings for local testing
python -m app.db.seed

uvicorn app.main:app --reload
```

## Tests

```bash
pytest
```

The current suite covers app wiring without requiring a live database
(`tests/test_smoke.py`). Once a docker Postgres is available in CI, add
integration tests that exercise `app.db.session` against a real
database — tracked in `../docs/18-development-plan.md`.

## Auth model (current milestone)

Guest mode is fully usable with no sign-in: the mobile app sends a stable
`X-Device-Id` header, and `app.core.deps.get_or_create_guest_user`
upserts a `users` row keyed on that id. Supabase-based account
creation/sync is a later milestone (see roadmap) and will let a device
identity be promoted to a full account without losing saved progress.

## Implemented endpoints

- `GET /api/v1/health`
- `GET /api/v1/categories`, `GET /api/v1/categories/{id}/brands`,
  `GET /api/v1/categories/{id}/listings`
- `GET /api/v1/goals`, `POST /api/v1/goals`
- `POST /api/v1/craving-sessions/checkout` — runs the simulated
  payment/tracking flow and returns the "Craving Completed" payload
- `POST /api/v1/craving-sessions/{id}/outcome` — records `saved` or
  `maybe_later`; `saved` writes a `goal_contributions` row and updates
  `user_stats`. No payment rail is ever touched.
