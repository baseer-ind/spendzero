# Database Schema (PostgreSQL)

Conventions: `id UUID PK default gen_random_uuid()`, `created_at`/
`updated_at timestamptz default now()`. **No table in this schema stores
a real payment instrument, bank/UPI identifier, or balance — by design.**

## Identity & profile

```sql
users (
  id, auth_provider text null, auth_subject text null, -- null until
  -- guest converts to an account
  is_guest bool default true,
  email text, phone text, name text, city text, state text,
  language text default 'en', interests text[],
  created_at, updated_at
)

guest_devices ( -- local-first identity before account creation
  id, device_id text unique, user_id FK -> users null,
  -- merges into users.id once the guest signs in
  created_at
)

user_settings (
  user_id PK/FK -> users, notifications_enabled bool default true,
  theme text default 'system'
)
```

## Savings goals (no money movement — tally only)

```sql
goals (
  id, user_id FK -> users, title text, icon_key text,
  is_preset bool default false, target_amount_paise bigint,
  target_date date null, status text default 'active',
  -- 'active'|'completed'|'archived'
  created_at, updated_at
)

goal_contributions ( -- one row per "I Saved It" tap
  id, goal_id FK -> goals, craving_session_id FK -> craving_sessions,
  amount_paise bigint, recorded_at timestamptz
  -- this is a ledger of user-confirmed self-reported amounts ONLY;
  -- never linked to any payment rail
)
```

## Catalog (fictional, admin-managed)

```sql
categories (id, slug, name, icon_key, sort_order, parent_id FK -> categories)

brands (id, category_id FK, name, slug, tagline, logo_asset_key,
        primary_color, secondary_color, style_tag, is_active bool default true)

listings (
  id, brand_id FK, category_id FK, type text, title, description,
  price_paise bigint, mrp_paise bigint, rating numeric(2,1),
  review_count int, images text[], attributes jsonb, is_active bool default true
)

reviews (id, listing_id FK, user_id FK, rating int, body text, photos text[])
offers (id, brand_id FK null, listing_id FK null, code text, description,
        discount_type text, discount_value numeric)
```

## Commerce simulation

```sql
carts (id, user_id FK, category_id FK, status text default 'open')
cart_items (id, cart_id FK, listing_id FK, quantity int, options jsonb,
            unit_price_paise bigint)

craving_sessions ( -- the simulated "purchase" / craving record
  id, user_id FK, category_id FK, brand_id FK, status text,
  -- 'placed'|'tracking'|'completed'
  total_price_paise bigint, -- the amount NOT spent
  fake_payment_method text, tracking_stage text,
  outcome text null, -- 'saved'|'maybe_later'|null (pending)
  goal_id FK -> goals null, -- which goal it was allocated to, if saved
  placed_at, completed_at
)
craving_session_items (id, craving_session_id FK, listing_id FK,
                        quantity, unit_price_paise, options jsonb)
```

## Stats

```sql
user_stats (
  user_id PK/FK -> users,
  total_amount_not_spent_paise bigint default 0,
  cravings_completed int default 0,
  goals_completed int default 0,
  current_streak_days int default 0,
  longest_streak_days int default 0,
  categories_explored text[] default '{}'
)
```

## Analytics

```sql
analytics_events (id, user_id FK null, session_id, event_name,
                   properties jsonb, occurred_at timestamptz)
-- partitioned by month; archive to R2 after 90 days
```

## Indexing notes

- `listings`: GIN trgm on `title`, btree on `(category_id, brand_id)`.
- `craving_sessions`: btree on `(user_id, status)`, `(user_id, outcome)`.
- `goal_contributions`: btree on `(goal_id, recorded_at)`.

## Redis usage

- Catalog read caching (60–300s TTL).
- Rate limiting on auth, search, AI endpoints.
- Guest-device → user merge lock (short-lived) during account linking to
  avoid double-merge races.
