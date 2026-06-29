# Backend APIs (FastAPI, REST, `/api/v1`)

Auth model: guest sessions identified by a `device_id` header (no
account required); optional Supabase JWT for signed-in users. All catalog
reads work for both. Writes (goals, contributions, history) work for
guests too, keyed to `device_id`, and merge into a `user_id` on sign-in.

## Guest & identity

```
POST   /guest/session                 # register device_id, returns guest token
POST   /auth/session/exchange         # Supabase token -> app session; merges
                                       # guest data into account if present
GET    /me
PATCH  /me
DELETE /me
```

## Catalog

```
GET  /categories
GET  /categories/{slug}/brands
GET  /brands/{slug}
GET  /listings?category=&brand=&q=&filters=&sort=&page=
GET  /listings/{id}
GET  /listings/{id}/reviews
POST /search
POST /search/voice
POST /search/ai
```

## Cart & craving sessions (simulation core)

```
GET/POST    /carts/{category}
POST/DELETE /carts/{id}/items
POST        /carts/{id}/apply-offer
POST        /carts/{id}/checkout          # -> creates craving_session
GET         /craving-sessions/{id}        # includes tracking_stage
POST        /craving-sessions/{id}/advance
GET         /craving-sessions/{id}/summary  # "Craving Completed" data:
                                             # amount, today/month totals,
                                             # active goal progress
POST        /craving-sessions/{id}/outcome  # body: {outcome: "saved"|
                                             # "maybe_later", goal_id?}
GET         /craving-sessions               # history, paginated
```

## Goals

```
GET/POST          /goals
GET/PATCH/DELETE  /goals/{id}
GET               /goals/presets
POST              /goals/{id}/set-active
GET               /goals/{id}/contributions
```

## Stats & achievements

```
GET /me/stats
GET /achievements
GET /me/achievements
```

## Analytics

```
POST /events    # batched client event ingest
```

## Admin (separate router, role-gated)

```
CRUD /admin/categories
CRUD /admin/brands
CRUD /admin/listings
CRUD /admin/offers
GET  /admin/analytics/overview
GET  /admin/analytics/funnels
GET  /admin/users
```

## Conventions

- Money fields: integer paise; client formats as ₹.
- Idempotency-Key required on `/checkout` and `/outcome` to prevent
  duplicate craving-session or contribution records on client retry.
- `POST /craving-sessions/{id}/outcome` is the only write path that can
  create a `goal_contributions` row — enforced server-side, never
  trusts a client-supplied amount beyond the session's recorded
  `total_price_paise` (prevents inflated self-reported savings via a
  tampered client).
- No endpoint anywhere accepts a bank account, UPI ID, or card field —
  there is no schema support for it (see `04-database-schema.md`).
