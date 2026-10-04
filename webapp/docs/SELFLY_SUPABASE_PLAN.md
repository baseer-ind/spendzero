# SELFly — Supabase auth + cloud data plan (FOR APPROVAL, not yet deployed)

Per your instruction: this schema + RLS + env model is presented for verification
**before** any database/auth change is deployed. Nothing below has been created yet.

Target: a NEW dedicated project **`selfly-production`** (not SpendSense / Dawat
Diary / storylume). ⚠️ Supabase Free orgs allow **2 active projects**; this org
already has 2 active (SpendSense, Dawat Diary). Creating a 3rd active project will
require pausing one or upgrading the org to Pro — please confirm which.

## Security model (non-negotiables)
- Auth handled entirely by **Supabase Auth** (email/password). No passwords or
  password hashing in our code or localStorage ever again.
- **Only** the `anon`/publishable key ships to the browser. The **service-role
  key is never in the frontend, never in the Vite bundle, never in a
  `VITE_`-prefixed var, never in client-readable Vercel env.** It is server-only
  (and we don't need it for this client-side app at all).
- **RLS enabled on every table**, default deny. Every policy keys off
  `auth.uid()` so a user can read/write only their own rows.
- Storage buckets are **private**; access via per-user path policies + signed URLs.

## Tables (all under `public`, all `id uuid` PK, all RLS on)

Every table has `user_id uuid not null references auth.users(id) on delete cascade`
and `created_at timestamptz default now()`. Standard policy on each:
`using (auth.uid() = user_id) with check (auth.uid() = user_id)`.

1. **profiles** — `user_id` (PK = auth uid), `name`, `email`, `photo_path`
   (Storage path, nullable), `spending_profile jsonb`, `onboarding_done bool`,
   `prefs jsonb`, `updated_at`.
2. **dreams** — `id`, `user_id`, `name`, `emoji`, `target numeric`,
   `saved numeric`, `cover_path` (Storage path, nullable), `created_at`.
3. **decisions** — `id`, `user_id`, `category`, `amount numeric`,
   `choice text` ('redirected'|'enjoyed'), `trigger text`, `dream_id uuid null`,
   `created_at`.  (feeds "Money You Kept" + Future Intelligence)
4. **achievements** — `id`, `user_id`, `key text`, `unlocked_at timestamptz`.
5. **consumption_sessions** — `id`, `user_id`, `category`, `seconds int`,
   `viewed int`, `started_at` — only the aggregate history we already track.

> Device-local / temporary data that does NOT go to the cloud: the simulator-
> disclaimer acks, cart contents, transient UI state, session browse timers
> before aggregation. These stay in localStorage by design.

## Storage
- Bucket **`user-media`** (private). Path convention: `=
  {auth.uid()}/profile/<uuid>.jpg` and `{auth.uid()}/dreams/<uuid>.jpg`.
- Policies: a user may `select/insert/update/delete` only objects whose first
  path segment equals their `auth.uid()`.

## Local → cloud migration (one-time, on first authenticated load)
1. User creates account / signs in.
2. If a local SELFly state exists and `profiles.onboarding_done` is absent for
   this account → upload local dream/profile photos to Storage, insert
   profile/dreams/decisions/achievements rows, set a local
   `selfly_migrated_v1=<uid>` flag.
3. Mark complete only after all writes succeed. On failure: keep local data,
   surface a recoverable "couldn't sync yet — retry" state. Never delete local
   data on failure.
4. After successful migration the app reads/writes the cloud as source of truth,
   with localStorage as an offline cache.

## Guest / offline fallback
- The current local-first experience stays intact. Auth becomes "Keep your
  journey" (create account / sign in). If offline or auth fails, the app keeps
  working locally and syncs later.

## Required environment variables
Client (safe to expose, set in Vercel + `.env`):
```
VITE_SUPABASE_URL=https://<selfly-production-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable anon key>
```
Server-only (NOT in the browser bundle; only if we later add edge functions):
```
SUPABASE_SERVICE_ROLE_KEY=<never shipped to client>
```

## Rollout order (after you approve this doc)
1. Create `selfly-production` (confirm active-project cap first).
2. Apply schema + RLS + storage policies via migration.
3. Add `@supabase/supabase-js`, a typed client reading only the two `VITE_` vars.
4. Build auth UI (sign up / in / out / password recovery / duplicate handling)
   replacing the localStorage creds + homemade hash.
5. Wire data layer + migration + offline cache.
6. Update Settings/Privacy copy to distinguish cloud vs device vs photos vs
   simulated activity.
7. Full founder QA journey, then deploy.
