# SELFly — Project Status

Verified current state, known issues, test results, and next steps. Only facts
confirmed from the repository/tooling are stated; unverified items are `UNKNOWN`.

_Last updated: 2026-10-10 (docs-only change; no application code touched)._

## Repository / deploy
- Active app: `webapp/`. Production branch `main` (auto-deploys to Vercel).
  Public URL: `https://spendzero-five.vercel.app`.
- Dev branch at time of writing: `claude/spendzero-mobile-app-vudvnb`
  (latest commit `d373282`). This docs work is on `claude/docs-working-system`.

## Implemented (verified present in code)
- Onboarding: splash → 3-screen intro → scenario assessment → profile reveal →
  signup → first Dream → app.
- Simulated marketplaces + search/sort/filter/wishlist/cart/checkout; per-vertical
  simulation notice; decision micro-transition; Dreams CRUD; Money You Kept;
  Consumption & Future Intelligence; achievements; feedback.
- Supabase auth + per-user tables with RLS + private Storage; local→cloud
  migration; `delete-account` Edge Function.
- Final brand logo (dark/light PNG), app icon, OG metadata; `VITE_SITE_URL`
  configurable.

## Verification results
- **Image audit (`node scripts/image-audit.mjs`), run 2026-10-10:**
  - Launch catalogue: **34/34** real photographs — launch gate **passes (exit 0).**
  - Total catalogue: **34 real / 66 illustration** per the audit script's product
    list (reports **100** products).
  - ⚠️ **Discrepancy to reconcile:** the manifest cross-check
    (`docs/product-image-manifest.json`) reports **99** products and **65**
    missing. The two tools enumerate the catalogue slightly differently
    (100 vs 99 / 66 vs 65). Treat "~65–66 real photos missing" as the figure and
    reconcile the two sources before relying on an exact count.
- **Build + full smoke:** last verified **green at commit `d373282`** in the prior
  (code) session via `NITRO_PRESET=node-server npm run build` + `node smoke.mjs`.
  **Not re-run in this docs-only change** (no code changed). Re-run before any
  future code deploy.
- **Live-site end-to-end (real signup → verify → persist → delete):** **NOT DONE /
  UNVERIFIED.** Cannot be performed from this environment (no email inbox; the
  build sandbox cannot reach Supabase). Owner action.

## Known issues / risks
1. **Signup on live is unverified.** Supabase email confirmation is ON with the
   built-in (rate-limited) mailer; without real SMTP, verification emails may not
   deliver — a silent launch failure. (Blocker; founder/ops.)
2. **No behavioral instrumentation.** There is no analytics/event logging, so
   whether any real user completes the loop or returns is currently unknowable.
3. **~65–66 customer-facing products still render the illustration fallback**
   (all non-launch long-tail + some verticals). Audit-count discrepancy noted above.
4. **Catalogue count discrepancy** between `image-audit.mjs` (100) and
   `product-image-manifest.json` (99). Low severity; reconcile.
5. **Local (no-cloud) auth fallback** still uses a non-cryptographic hash in
   `localStorage` — only active when Supabase env is absent; not used in production
   but present. Do not rely on it for security.
6. **Cross-device photo URLs:** on re-push after a cloud pull, the durable Storage
   path is reused via an in-memory cache; a long-lived signed URL could be stored
   in edge cases. Documented limitation; acceptable for current scale.
7. **Leftover test users** existed in Supabase `auth.users` from early setup
   (status now UNKNOWN; verify before launch metrics).
8. **Leaked-password protection** (Supabase advisor) was disabled — optional
   hardening, not a blocker.

## Next steps (ordered; none change product features)
1. Owner: run the **real live end-to-end account test** (see `LAUNCH_RUNBOOK.md`).
2. Owner: configure **SMTP** and re-verify signup/verification/reset on live.
3. Decide the **core promise** and add **instrumentation** if validating behavior
   (see `FEATURE_BACKLOG.md`).
4. Supply the **remaining ~65 product photos** → `register-local.mjs` → audit to
   full → verify across surfaces → deploy.
5. Connect the **production domain** (`VITE_SITE_URL` + Supabase redirect URLs).

## UNKNOWN / needs owner confirmation
- Primary user persona and the single success metric.
- Current Supabase `auth.users` contents and whether any real user exists.
- Whether anyone other than the owner has completed the full loop / returned D2.
