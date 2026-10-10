# SELFly — Feature Backlog

Single list of work, grouped by state. **Ideas and proposals are NOT approved
requirements** until the owner approves them and a `DECISIONS.md` entry is added.

States: `Idea` · `Proposed` · `Approved` · `In progress` · `Blocked` · `Done`.

_Last updated: 2026-10-10._

---

## Ideas / open questions (unapproved — do not build without sign-off)
- **Define the core promise:** "practice noticing cravings" vs "intercept real
  spend." Changes retention model, metrics, and roadmap. (Owner decision needed.)
- **Behavioral instrumentation:** lightweight, opt-in, privacy-safe event log
  (e.g. intro_done, assessment_done, dream_created, decision_made, return_visit,
  day_N_active) written to the existing Supabase — to learn whether anyone
  completes the loop and returns. Currently there is **no analytics/instrumentation.**
- **Small real-user cohort test (5–10 people, ~2 weeks)** to check D2 return and
  self-reported behavior change before expanding catalogue/features.
- **Re-engagement at craving time:** PWA install + web push and/or native app;
  "about-to-buy" capture (share target / notification). Moves the product closer
  to the point of real spending.
- **Native app / Play Store** (an APK pipeline exists in the repo).
- Expansion ideas raised in chat: milestones/reminders, richer personalized Future
  Intelligence, social/accountability, read-only bank/UPI insight, more verticals,
  founder analytics dashboard.

> These originate from owner/reviewer discussion. They are recorded here as ideas,
> not commitments.

## Proposed (direction stated, not yet scheduled/approved to build)
- **Real SMTP / email provider** for Supabase (email confirmation ON for public
  launch). See `DECISIONS.md` D-20261010-13. Founder/ops task.

## Approved (agreed; may or may not be started)
- Complete the **real product-photo catalogue** to 99/99 (launch-34 done; 65
  remaining). See `DECISIONS.md` D-20261010-11 and the audit list below.

## In progress
- _None recorded._ (This docs/process setup is tracked as D-20261010-01, Done on merge.)

## Blocked (needs founder/ops action or external input)
- **Public launch** blocked on: (a) real SMTP + verified signup on live, (b) a
  real end-to-end account test on the live URL, (c) production domain connected.
  See `webapp/docs/LAUNCH_RUNBOOK.md`.
- **65 remaining product photos** — blocked on the owner supplying the images
  (cannot be generated in the build environment). Drop-in pipeline is ready:
  `public/products/<vertical>/<id>.webp` → `node scripts/register-local.mjs` →
  `node scripts/image-audit.mjs`.

## Done (high level — see git history for detail)
- Onboarding (intro, scenario assessment, profile reveal, first Dream).
- Decision moment as fast micro-transition.
- Simulated marketplaces (food, electronics, market verticals) with search / sort
  / filters / wishlist / cart / checkout and per-vertical simulation notice.
- Consumption Intelligence, Future Intelligence / lessons, Money You Kept,
  achievements, feedback (floating control + screen).
- Supabase auth + per-user data (RLS) + Storage + local→cloud migration +
  server-side account deletion.
- Final brand logo (dark/light variants), app icon, OG metadata, env-configurable
  site URL.
- Launch product photos **34/99** real (electronics 8, food 10, grocery 8,
  shopping 8).

## Remaining product photos (audited 2026-10-10 — 65 missing)
Beauty 8, Home 9, Travel 7, Entertainment 7, Food 22 (long-tail), Electronics 4,
Grocery 4, Shopping 4. Exact IDs and expected paths: run
`node scripts/image-audit.mjs` (it prints the full "need:" list), or see the audit
delivered in chat on 2026-10-10. Expected path per item:
`webapp/public/products/<vertical>/<id>.webp`.
