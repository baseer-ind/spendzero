# SELFly — Decision Log

Dated, uniquely-IDed decisions with status and rationale. Newer decisions that
replace older ones link back to what they superseded. **Do not delete superseded
entries** — mark them `Superseded` and keep the history.

Status values: `Approved` · `Proposed` · `Superseded` · `Rejected`.
ID format: `D-YYYYMMDD-NN`.

> Scope note: entries below are **reconstructed from the repository and session
> history** on 2026-10-10. Where the original approval context is not verifiable
> from the repo, status is marked `Approved (observed in shipped code)` — meaning
> it is implemented and was treated as approved, but the explicit approval moment
> is not independently recorded here. The owner can correct any entry.

---

### D-20261010-01 — Documentation & process system
- **Status:** Approved
- **Decision:** Maintain permanent project docs (`CLAUDE.md`, `PRODUCT_BIBLE.md`,
  `DECISIONS.md`, `FEATURE_BACKLOG.md`, `PROJECT_STATUS.md`,
  `REGRESSION_CHECKLIST.md`) and work under the rules in `CLAUDE.md`.
- **Rationale:** Stable ground truth across sessions; separate approved
  requirements from ideas; prevent accidental regressions.

### D-20261010-02 — Active app is `webapp/`; deploy via `main`
- **Status:** Approved (observed)
- **Decision:** `webapp/` is the live SELFly app; `main` is production (Vercel);
  `claude/spendzero-mobile-app-vudvnb` is the active dev branch. Legacy
  `spendzero/*` variants are not maintained.

### D-20261010-03 — Real cloud accounts on Supabase ("SpendSense" project)
- **Status:** Approved (observed)
- **Decision:** Use the existing Supabase project (name: SpendSense; ref in
  `VITE_SUPABASE_URL`) for Auth + Postgres (RLS) + Storage; account deletion via a
  server-side Edge Function; only the publishable/anon key is client-side.
- **Supersedes:** the earlier device-local homemade credential store (still
  present as an offline/no-cloud fallback).

### D-20261010-04 — Signup AFTER the survey
- **Status:** Approved
- **Decision:** Onboarding order is intro → assessment → profile reveal → signup
  → first Dream.
- **Supersedes:** D-20261010-05.

### D-20261010-05 — Signup BEFORE the survey
- **Status:** Superseded by D-20261010-04
- **Decision (historical):** Account creation happened before the assessment.

### D-20261010-06 — Scenario-based assessment with auto-advance
- **Status:** Approved
- **Decision:** 10 real-life scenarios, tap-to-choose, brief reaction, auto-
  advance; no "Continue" button; archetype scoring preserved.
- **Supersedes:** D-20261010-07.

### D-20261010-07 — Questionnaire-style assessment (agree-scale + Continue)
- **Status:** Superseded by D-20261010-06

### D-20261010-08 — Decision moment as a fast micro-transition
- **Status:** Approved
- **Decision:** Fold the standalone "pause" page into an inline amount + two-
  directions choice that plays a ~1.3s micro-transition then auto-continues.
- **Supersedes:** D-20261010-09.

### D-20261010-09 — Standalone "Pause" page with explicit Continue
- **Status:** Superseded by D-20261010-08

### D-20261010-10 — Final brand-board logo (PNG), dark + light variants
- **Status:** Approved
- **Decision:** Use the supplied PNG logo (dark-UI light-ink variants on the dark
  app) as the single source of truth; the S symbol for app icon/favicon.
- **Supersedes:** earlier SVG/CSS logo approximations (removed).

### D-20261010-11 — Launch catalogue must use real product photographs
- **Status:** Approved
- **Decision:** Customer-facing product imagery must be real photos; illustration
  fallback is not acceptable for launch. `scripts/image-audit.mjs` is the gate.

### D-20261010-12 — Site URL is env-configurable (`VITE_SITE_URL`)
- **Status:** Approved
- **Decision:** Canonical + absolute OG/Twitter URLs derive from `VITE_SITE_URL`
  so connecting a domain is a Vercel env change, not a code change.

### D-20261010-13 — Email confirmation ON for public launch; needs real SMTP
- **Status:** Proposed (owner-stated direction; not yet configured/verified)
- **Decision (direction):** Keep Supabase email confirmation ON and configure a
  real SMTP/email provider before public launch (built-in mailer is test-only).
- **Note:** Not implemented/verified in this environment; a founder/ops task.

---

## How to add a decision
Append a new `D-YYYYMMDD-NN` entry with Status, Decision, Rationale, and (if it
replaces one) a `Supersedes:` link; flip the old entry's status to `Superseded`.
Never rewrite history in place.
