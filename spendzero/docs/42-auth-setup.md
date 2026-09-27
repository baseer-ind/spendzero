# Auth setup — Supabase (email + Google)

The app signs users in with **Supabase Auth** (project **SpendSense**,
`https://jnnnqkuwyuyrjcjobeit.supabase.co`). Email/password works out of the
box. Google needs a bit of dashboard config. The backend verifies the tokens
Supabase issues.

## What's already wired in the app
- `supabase_flutter` initialized in `main.dart` with the project URL + anon key
  (`lib/core/config/supabase_config.dart` — anon key is public by design).
- Login/sign-up screen (email + password, Google button, "continue as guest").
- Flow: splash → intro (first run) → **login** → app. Guests can skip.
- Profile shows the signed-in email + Sign out (or a "sign in" prompt).
- Android deep-link intent filter for the OAuth return
  (`com.projectfuture.app://login-callback`, injected by
  `scripts/setup_mobile_platforms.sh`).

## To finish EMAIL sign-in (nothing to do — already works)
Just build/install the app. New users tap "Create an account". If you turned
on email confirmations in Supabase, they'll confirm via email before signing
in (the screen tells them so).

Optional: Supabase → Authentication → Providers → Email → toggle "Confirm
email" off for faster beta testing.

## To finish GOOGLE sign-in (dashboard steps — you)
1. **Google Cloud** → create an OAuth 2.0 Client ID (Web application). Add
   the authorized redirect URI Supabase gives you:
   `https://jnnnqkuwyuyrjcjobeit.supabase.co/auth/v1/callback`.
2. **Supabase** → Authentication → Providers → **Google** → enable, paste the
   Google client ID + secret, save.
3. **Supabase** → Authentication → URL Configuration → add
   `com.projectfuture.app://login-callback` to the allowed redirect URLs.
Until this is done, the Google button shows a friendly "use email instead"
message; email sign-in is unaffected.

## To finish the BACKEND (per-account cloud data — you, at deploy)
The API already verifies Supabase tokens. When you deploy it (see
`docs/40-play-store-release.md` / `render.yaml`), set:
- `SPENDZERO_SUPABASE_JWT_SECRET` — Supabase → Project Settings → API → JWT
  Settings → **JWT Secret**.
- `SPENDZERO_DATABASE_URL` — the Supabase Postgres pooler URL (Project
  Settings → Database → Connection string → Transaction pooler), scheme
  changed to `postgresql+asyncpg://`.

## Current staging (important)
This increment adds **working sign-in** (identity). App **data is still
on-device** for now — flipping the app to read/write the deployed cloud API
per account is the next step, and it depends on the backend being deployed
with the two env vars above. So: users can create accounts and log in now;
their dreams sync to the cloud once the backend is live and the app is
switched to the remote repositories.
