# SELFly — Launch runbook

Development is done. These are the remaining founder/ops steps, in order. The
app code is ready; none of these require code changes except where noted (all
already prepared to be env-var switches).

Supabase project: **SpendSense** (ref `jnnnqkuwyuyrjcjobeit`).
Current URL: `https://spendzero-five.vercel.app`.

---

## 1. Email delivery (SMTP) — required for public launch 🔴

Keep email confirmation ON; give Supabase a real sender so verification/reset
emails actually arrive and aren't rate-limited.

1. Create an email provider account (Resend recommended; Postmark/SES fine) and
   verify your sending domain (add the DKIM/SPF DNS records they give you).
2. Supabase → **Authentication → Emails → SMTP Settings** → enable custom SMTP:
   - Host / port / username / password from the provider.
   - Sender email on your verified domain (e.g. `hello@selfly.app`), sender name
     "SELFly".
3. Supabase → **Authentication → Rate Limits** → raise the email rate limit from
   the tiny default now that real SMTP is set.
4. Keep **Authentication → Providers → Email → Confirm email = ON**.

## 2. Real production account test 🔴 (proves the architecture, not just the code)

On the **live URL**, fresh browser, real email:

1. Sign up → receive verification email → verify → land in app.
2. Complete survey → profile → create a Dream → upload a profile photo.
3. Reload → data persists. Sign out → sign in → data persists.
4. Open on your **phone** → sign in → same data appears (cross-device).
5. Password reset: "Forgot password? Reset it" → email arrives → reset works.
6. Settings → Delete my account → confirms, signs out, data gone.

All six pass = cloud architecture proven.

## 3. Connect the real domain 🟠 (after 1 & 2 pass)

1. **Vercel → Project → Settings → Domains** → add `selfly.app` (and `www`),
   set the DNS records Vercel shows.
2. **Vercel → Settings → Environment Variables** → set
   `VITE_SITE_URL=https://selfly.app` → redeploy. (Canonical + OG/Twitter URLs
   update automatically — no code change.)
3. **Supabase → Authentication → URL Configuration**:
   - Site URL = `https://selfly.app`
   - Redirect URLs = `https://selfly.app/**` (covers verification + password
     reset redirects).
4. Re-check OG preview (share the URL in a chat / use a card validator).

## 4. Launch ✅

When 1–3 are green, SELFly is ready for real users.

---

### Env vars (Vercel, Production)
```
VITE_SUPABASE_URL=https://jnnnqkuwyuyrjcjobeit.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_2rzIl0dgoqAJYvbSjlvn6w_JnqJL9rV   # browser-safe
VITE_SITE_URL=https://selfly.app                                        # after domain
```
Service-role key stays server-side only (Supabase Edge Function env) — never here.
