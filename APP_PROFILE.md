# APP_PROFILE.md — SELFly

Evidence-based profile for portfolio decisions. Paths are relative to the repo
root; the application lives in `webapp/`. Verifications in this file were run on
2026-11-01 against commit `d373282` (branch `claude/spendzero-mobile-app-vudvnb`).
Unverifiable items are marked **UNKNOWN**.

---

## 1. Identity
- **Name:** SELFly (repo/dir name: `spendzero`; the active app is `webapp/`).
- **One-line purpose:** put a conscious pause between a craving and a purchase, and
  turn money "not spent" into visible progress toward a personal goal.
- **Target user:** India-first mobile-web consumer who impulse-shops and wants to
  curb it. Intended open-frequency is **UNKNOWN** (no retention design/instrument
  in code). Locale cues are concrete: Indian English, ₹ with Indian digit grouping
  (`src/lib/money.ts`), India-first catalogue (`src/lib/market.ts`,
  `src/lib/catalog.ts`), default city Hyderabad.
- **Core JTBD:** "When I feel the urge to buy something I didn't plan, help me pause
  and consciously redirect that money toward a goal I care about."
- **Platforms:** **Web only** (responsive, mobile-first). SSR web app; no iOS/Android
  build in `webapp/`. (Legacy, unmaintained native variants exist elsewhere in the
  monorepo — see §3; the APK/native path is not part of this app.)

## 2. Tech stack
Source: `webapp/package.json`.
- **Framework/lang:** React `19.2.0`, TanStack Start `1.168.26` (SSR) + TanStack
  Router `1.170.16`, TypeScript `5.8.3`, Vite `8.0.16`. Nitro build (`NITRO_PRESET`).
- **Backend/DB/auth:** Supabase (`@supabase/supabase-js 2.117.2`) — Auth
  (email/password), Postgres (RLS), Storage. One Edge Function
  (`webapp/supabase/functions/delete-account/index.ts`).
- **Hosting/deploy:** Vercel (`NITRO_PRESET=vercel`); production = `main` branch;
  live URL `spendzero-five.vercel.app`.
- **Key third-party:** Supabase only. `recharts 2.15.4` (charts), `react-hook-form
  7.71.2` + `zod 3.24.2` (forms/validation, present as deps), `sonner`/`vaul`/`cmdk`
  (shadcn UI deps). Lovable platform integration (`webapp/AGENTS.md`,
  `src/lib/lovable-error-reporting.ts`). No analytics/payments/push SDKs.
- **State:** React Context + `useReducer`-style store in `src/lib/store.tsx`
  (836 lines) backed by localStorage, with Supabase sync in `src/lib/cloud.ts`.
  `@tanstack/react-query` is a dependency; primary app state is the custom store.
- **Navigation:** file-based routes in `src/routes/` (TanStack Router).
- **Styling:** Tailwind CSS `4.2.1` + shadcn/ui (26 `@radix-ui/*` packages;
  46 generated components in `src/components/ui/`); `tailwind-merge`, `cva`.

## 3. Architecture

### Directory tree (depth 3; excludes node_modules/.output)
```
spendzero/
├── CLAUDE.md
├── APP_PROFILE.md
├── spendzero/              # legacy/earlier variants (mobile, mobile-rn, web) — NOT the active app
└── webapp/                 # ACTIVE APP
    ├── AGENTS.md
    ├── package.json  smoke.mjs  index.html  vite.config.ts
    ├── .env.example
    ├── docs/               # PRODUCT_BIBLE, DECISIONS, PROJECT_STATUS, FEATURE_BACKLOG,
    │                       # REGRESSION_CHECKLIST, LAUNCH_RUNBOOK, image briefs, manifests
    ├── scripts/            # image-audit, register-local, gen-manifest, gen-prompts, fetch-pexels
    ├── public/
    │   ├── brand/          # logo PNGs, app icon, categories/, onboarding/
    │   └── products/       # electronics/ food/ grocery/ shopping/ beauty/ home/ travel/ entertainment/
    ├── supabase/functions/delete-account/   # Edge Function (service-role, server-side)
    └── src/
        ├── routes/         # 24 route files (see map)
        ├── components/     # app components + onboarding/ + brand/ + ui/ (shadcn)
        ├── lib/            # store, cloud, assessment, catalog, electronics, market, money, tracking, …
        └── hooks/
```

### Entry points & routing map (`src/routes/`)
- `__root.tsx` — root shell, meta/OG, StoreProvider + ExperienceGate (onboarding gate).
- `index.tsx` — Home ("Today") dashboard: active Dream, streak, tracker card.
- `today.tsx` — category hub (Food/Electronics/Grocery/Shopping/Travel/Entertainment/Beauty/Home tiles).
- `food.index.tsx` → `food.$appId.index.tsx` → `food.$appId.$restaurantId.tsx` — food delivery sim (apps → restaurants → menu).
- `electronics.index.tsx` → `electronics.$productId.tsx` — electronics store + product detail.
- `market.$vertical.index.tsx` → `market.$vertical.$productId.tsx` — generic vertical store + detail (grocery/shopping/travel/entertainment/beauty/home).
- `cart.tsx` → `checkout.tsx` → `pause.tsx` → `continue.tsx` — cart → checkout → **decision moment** → reward/continue.
- `future.tsx` — Dreams list/management ("My Future").
- `savings.tsx` — "Money You Kept" (redirected totals by category).
- `consumption.tsx` — Consumption Intelligence (attention/time).
- `learn.index.tsx` → `learn.$lessonId.tsx` — Future Intelligence lessons.
- `journey.tsx` — journey/timeline. `achievements.tsx` — achievements.
- `profile.tsx` — profile (photo, name). `settings.tsx` — data export, account deletion, privacy.
- `feedback.tsx` — feedback submit + history. `wishlist.tsx` — wishlist.

### Data model
**Cloud (Supabase Postgres; columns from `src/lib/cloud.ts` + applied migration). RLS owner-scoped on all tables.**
- `profiles`: user_id (PK→auth.users), name, email, photo_path, spending_profile (jsonb), onboarding_done (bool), prefs (jsonb), created_at, updated_at.
- `dreams`: id (text), user_id, name, emoji, target (numeric), saved (numeric), cover_path, created_at.
- `decisions`: id (text), user_id, category, amount, choice ('enjoyed'|'redirected'), trigger, dream_id, created_at.
- `achievements`: id, user_id, key, unlocked_at (unique user_id+key).
- `consumption_sessions`: id, user_id, category, seconds, viewed, started_at.
- **Storage bucket** `user-media` (private): `{uid}/profile/*`, `{uid}/dreams/*`.

**Device-local (localStorage; `src/lib/store.tsx`) — not all mirrored to cloud:**
- `project_future_state_v1` (name, account, dreams, events, cart, profile, decisionLog, address, wishlist, engagement, sessionLog, flags), `project_future_creds_v1` (local fallback creds), `project_future_images_v1` (data-URI images), `project_future_feedback_v1`, `selfly_sim_ack_v1`.
- Client types: `Dream`, `Decision`, `SaveEvent`, `CartItem`, `WishItem`, `Address`, `DayEngagement`, `SessionLog` (`src/lib/store.tsx`). `Profile`/archetype in `src/lib/assessment.ts`.

### Auth model
- Supabase email/password (`src/lib/cloud.ts`). **No roles/RBAC** — every user is an
  end user; access is per-row via RLS `auth.uid() = user_id`. Sessions = Supabase JWT
  with `persistSession`/auto-refresh (`src/lib/supabase.ts`). Password reset + email
  verification supported in code. **Fallback:** if `VITE_SUPABASE_*` is absent, the app
  runs local-only with a homemade `hash()` credential store explicitly labelled
  "obfuscation, not real security" (`src/lib/store.tsx:139`).

### External integrations
- **Supabase** — auth, per-user data, photo storage, account-deletion Edge Function.
- **Vercel** — hosting/deploy.
- **Lovable** — low-code platform synced to this branch; error reporting hook
  (`src/lib/lovable-error-reporting.ts`), constraint on git history (`AGENTS.md`).
- **Pexels** — optional, dev-only image fetch script (`scripts/fetch-pexels.mjs`,
  gated on `PEXELS_API_KEY`); not used at runtime.

## 4. Features — status table

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| 3-screen intro / onboarding gate | Done | `components/ExperienceGate.tsx`, `onboarding/Story.tsx`; smoke asserts screens 1–3 | Traced by smoke. |
| Scenario assessment (10) + archetype scoring | Done | `lib/assessment.ts` (SCENARIOS, `computeProfile`, 5 archetypes), `onboarding/Assessment.tsx`; smoke asserts auto-advance + no Continue | Scoring is pure-function, traceable. |
| Profile reveal | Done | `onboarding/ProfileResult.tsx`; smoke asserts "Your pattern" | |
| Signup / signin / signout | Partial | `lib/cloud.ts`, `components/AuthGate.tsx` | Code complete incl. verify/reset/duplicate handling, BUT **never verified against live Supabase** (smoke runs cloud-OFF local fallback). Real email delivery not configured. |
| Local→cloud migration | Partial | `lib/store.tsx` (`migrateUp`), `lib/cloud.ts` | Logic present; not exercised by smoke (cloud off); unverified end to end. |
| First Dream + Dreams CRUD | Done | `onboarding/FirstGoal.tsx`, `routes/future.tsx`; smoke renames/edits/deletes a dream | |
| Decision moment (micro-transition) | Done | `routes/pause.tsx`; smoke asserts amount + two directions + "closer" | No standalone pause page; auto-continues. |
| Simulated marketplaces (food/electronics/market) | Done | `routes/food.*`, `electronics.*`, `market.$vertical.*`; `lib/catalog.ts`, `electronics.ts`, `market.ts`; smoke traces food+electronics+grocery | Fictional brands. |
| Simulation disclosure notice | Done | `components/SimDisclaimer.tsx`; smoke asserts first-entry notice | Persists per-vertical. |
| Cart / checkout | Done | `routes/cart.tsx`, `checkout.tsx`; smoke adds→checks out | Simulated; no payment. |
| Search / sort / filters / wishlist | Done | `market.$vertical.index.tsx`, `electronics.index.tsx`, `routes/wishlist.tsx`; smoke covers | |
| Money You Kept | Done | `routes/savings.tsx`, store `keptByCategory` | |
| Consumption Intelligence (time/attention) | Done | `lib/tracking.tsx`, `routes/consumption.tsx`; smoke renders | |
| Future Intelligence / lessons | Done | `lib/learn.ts`, `routes/learn.*`; smoke opens a lesson | Content-driven. |
| Achievements | Partial | `lib/achievements.ts` (32 lines), `routes/achievements.tsx` | Renders (smoke), but `achievements` cloud table is **not written by the client** (no upsert in `cloud.ts`); likely derived/local only. |
| Profile photo upload + persistence | Partial | `components/ImagePicker.tsx`, store `putImg`/`imageFor`, `cloud.ts` Storage upload | Local persistence works; Storage round-trip unverified on live. |
| Feedback (floating + screen + history) | Done | `components/FeedbackFab.tsx`, `routes/feedback.tsx`, `lib/feedback.ts`; smoke submits + sees history | Stored locally (`localFeedbackStore`); no backend sync. |
| Settings: data export | Done | `routes/settings.tsx` (JSON export of localStorage) | |
| Account deletion (data+media+auth user) | Partial | `supabase/functions/delete-account/index.ts`, `cloud.ts` `deleteAccountCloud` | Server-side function deployed earlier; **not invoked/verified in this env**. |
| Real product photography (catalogue) | Partial | `public/products/*` (34 webp on disk), `lib/productImages.ts`, `scripts/image-audit.mjs` | 34/~99 real; remaining render illustration fallback (`lib/productArt.ts`). |
| Push / re-engagement | Planned | none in code | Not implemented. |
| Analytics / instrumentation | Planned | none in code | No event logging anywhere. |

## 5. Code health
- **Tests:** **No unit tests.** One Playwright end-to-end script,
  `webapp/smoke.mjs` (493 lines), covering the full journey (onboarding →
  assessment → signup → dream → food/electronics/market → cart → decision →
  savings → consumption → learn → edit/delete dream → feedback → settings →
  persistence-after-reload). **Ran it 2026-11-01: PASS — "ISSUES: ✅ none."**
  Important caveat: smoke runs with Supabase **off** (no `.env`), so it exercises
  the **local-fallback** path, not real cloud auth/sync.
- **Build:** `NITRO_PRESET=node-server npm run build` → **PASS** (ran it).
- **Lint:** `npm run lint` → **FAIL: 1214 problems** — but **1206 are
  `prettier/prettier`** (pure formatting) and **8 are
  `react-refresh/only-export-components`** (minor). **Zero logic/correctness rules
  firing.** Cosmetic; `--fix` would clear most.
- **TODO/FIXME/HACK:** effectively **0 real** — grep finds 3 matches, all in a
  usage comment in `scripts/fetch-pexels.mjs` (dev tooling), none in app code.
- **Known bugs / broken flows:** (a) live signup unverified / likely blocked until
  SMTP is configured (silent-failure risk); (b) catalogue count mismatch —
  `scripts/image-audit.mjs` reports 100 products, `docs/product-image-manifest.json`
  reports 99 (documented in `webapp/docs/PROJECT_STATUS.md`); (c) `achievements`
  table defined but not written by client.
- **Secrets / mock / dev shortcuts:** **No real secrets committed.** `.env.example`
  holds placeholders; the only committed key historically was the browser-safe
  publishable/anon key (RLS-protected); the **service-role key is server-side only**
  (`supabase/functions/delete-account`). Dev-only: homemade `hash()` auth fallback
  (`store.tsx:139`, explicitly "not real security", unused when cloud is on); offline
  SVG image fallbacks (`lib/localImage.ts`, `lib/productArt.ts`) by design.
- **Dependencies:** 53 deps / 18 devDeps. `@tanstack/react-query`, `react-hook-form`,
  `zod`, `recharts` are installed; usage is light (primary state is the custom
  store) — candidates to audit for actual use. 26 `@radix-ui/*` ship the shadcn kit;
  not all 46 UI components are necessarily used. No obviously deprecated packages
  observed; versions are current (React 19, Vite 8, Tailwind 4).
- **Git:** **50 commits total.** Last 10 (all 2026-10-04): domain-switch prep;
  final logo PNG variants; sh-shoes → 34/34; 33 real photos; image audit+gate;
  signup-after-survey; scenario assessment auto-advance; auth hardening; real
  Supabase accounts + migration; image-led Today tiles + Supabase plan.

## 6. Effort estimate
- **~75% to a shippable v1.** Reasoning: the product surface (onboarding, assessment,
  all shopping verticals, decision flow, dreams, insight screens, settings) is built
  and passes an end-to-end smoke; auth/persistence code is complete. The missing 25%
  is **verification + ops + content**, not new features: real cloud auth has never
  been proven on live, email delivery isn't configured, ~65 catalogue photos are
  illustrations, and there's no analytics to know if the core behavior-change bet
  works. "Feature-complete" ≠ "shippable/validated" here.
- **Top 5 to v1 (rough):**
  1. Configure SMTP + run real live signup→verify→persist→delete test, fix anything found — **4–8 h**.
  2. Supply/integrate remaining ~65 product photos → audit 99/99 → verify surfaces — **3–5 h** integration (excludes photo creation).
  3. Connect production domain + Supabase redirect URLs + OG recheck — **1–2 h**.
  4. Add minimal opt-in analytics/instrumentation (loop + D2 return) — **6–10 h**.
  5. Reconcile catalogue count, wire `achievements` persistence (or remove table), `lint --fix` cosmetics — **3–5 h**.
- **Biggest technical risk:** the cloud layer (auth/migration/photo round-trip) is
  coded but **never verified against live Supabase** — the only test runs with cloud
  off. A silent failure here (e.g. SMTP, RLS edge case, migration overwrite) would
  surface only with real users. Second: product-market risk — zero instrumentation
  means the central behavior-change hypothesis is unmeasured.

## 7. Reusability
- **Lift-with-little-change (domain-agnostic):**
  - `src/lib/supabase.ts`, `src/lib/cloud.ts` — Supabase client + auth/sync/migration
    + Storage + delete-account patterns (generic, lightly coupled to table names).
  - `src/components/ui/*` (46 shadcn components) — standard kit.
  - `src/lib/money.ts` — INR formatting + amount-in-words (Indian numbering).
  - `src/lib/tracking.tsx` — active-time/attention tracking (vertical-agnostic).
  - `src/lib/feedback.ts` + `components/FeedbackFab.tsx` — drop-in feedback widget.
  - `src/lib/localImage.ts`, `lib/productArt.ts`, `components/Img.tsx`,
    `ProductImage.tsx`, `ImagePicker.tsx` — offline-safe image fallback + picker.
  - `supabase/functions/delete-account/index.ts` — reusable GDPR-style deletion fn.
- **Would NOT transfer (SELFly-domain coupled):**
  - `src/lib/assessment.ts` (craving archetypes/scoring), `onboarding/*`
    (Story/Assessment/ProfileResult/FirstGoal/GoalTransition), `routes/pause.tsx`
    (decision moment), `routes/savings.tsx`, `routes/consumption.tsx`,
    `routes/learn.*` + `lib/learn.ts`, `lib/catalog.ts`/`electronics.ts`/`market.ts`
    (sim catalogue), `lib/productImages.ts` + manifest, `src/lib/store.tsx` (the
    SELFly domain model).
- **Shared concerns present & how built:** **Auth** — Supabase email/password + RLS
  (no roles). **User profile** — `profiles` table + localStorage mirror. **Photos** —
  Supabase Storage (private, per-user). **Feedback** — local store (no backend).
  **Notifications** — none. **Payments** — none (simulated only).

## 8. Overlap signals
- **Needs login?** Yes (optional-but-primary; works guest/local without env).
  **Stores:** name/email, spending archetype/profile, dreams + progress (virtual ₹),
  per-decision spend log (category/amount/choice), attention/time sessions, wishlist,
  (simulated) address, feedback. All per-user, RLS-scoped.
- **Would its users want features from…**
  - **Budgeting / savings app — YES.** Direct adjacency: Dreams are savings goals,
    the decision log is a spend/impulse ledger, "Money You Kept" is a savings metric.
    The real-money version of SELFly *is* a budgeting/savings app.
  - **Community / networking app — NO.** Single-player, introspective, no social
    graph, sharing, or messaging anywhere in code.
  - **Event / tournament management — NO.** No events, scheduling, brackets, or
    multi-party coordination; domain is personal spending.
- **If its screens became tabs in a larger app, what breaks / feels wrong:**
  - The **onboarding gate** (`ExperienceGate`) assumes it owns the whole first-run and
    hard-sequences intro→assessment→signup→dream; as a tab it would hijack the host.
  - **Auth is app-level** (its own Supabase project/tables); nesting under another
    app's auth needs reconciliation (shared user id, RLS, migration).
  - The **"this is a simulation" framing** and virtual-tally semantics are load-bearing
    trust claims; mixed into a real-commerce or real-money host they'd be confusing or
    misleading. The **decision-moment interception** only fires inside SELFly's own
    simulated checkout — as a tab beside real shopping it intercepts nothing.

## 9. Open questions (for you to answer)
- Which promise is SELFly defending — "practice noticing in a sandbox" vs "intercept
  real spend"? Not decided in code/docs. Changes the merge/absorb calculus most.
- Has any real user (besides you) completed the loop / returned day 2? No way to know
  from code (no analytics). **UNKNOWN.**
- Is the Supabase project ("SpendSense") shared with any of your other apps, or
  dedicated? Affects merge/auth-consolidation.
- Are `react-query`, `react-hook-form`, `zod`, `recharts` actually used, or leftover
  scaffolding? (Light/no usage observed — confirm before counting them as assets.)
- Is the native/APK path dead (legacy dirs) or intended to resume? Affects platform
  strategy if you merge.
- Intended open-frequency / core success metric for v1? Undefined.
