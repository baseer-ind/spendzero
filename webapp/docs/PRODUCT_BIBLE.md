# SELFly — Product Bible

Verified product purpose, users, approved requirements, core journeys, and design
principles. Facts are drawn from the repository and this project's history.
Anything not yet confirmed by the product owner is marked **UNKNOWN**.

_Last updated: 2026-10-10._

## 1. Purpose (as built)
SELFly is an India-first **intentional-spending** web app. The intended loop:
**notice a craving → pause → consciously decide → redirect the money you would
have spent toward a personal goal ("Dream").**

- Savings are a **virtual tally** — no real money moves; SELFly is **not** a bank
  and never holds funds.
- Shopping is a **simulation** — no real orders, bookings, tickets, or payments.

> Note on framing: the product as built lets users *practice noticing cravings in
> a simulated marketplace*. Whether this changes real-world spending is an
> **unvalidated assumption** (see PROJECT_STATUS "Open questions" and
> FEATURE_BACKLOG). The owner has not yet ratified which promise SELFly defends
> ("practice noticing" vs "intercept real spend"). **UNKNOWN / to be decided.**

## 2. Users
- Primary: **UNKNOWN** beyond "India-first consumer who wants to curb impulse
  spending." No verified persona/segment research is in the repo.
- Locale/cues observed in code: Indian English, ₹ with Indian digit grouping,
  India-first catalogue and dream categories, default city Hyderabad.

## 3. Approved requirements (observable in the shipped product)
These are implemented and have been treated as requirements in prior sessions:
- **Onboarding order:** splash → 3-screen intro → scenario assessment → profile
  reveal → **account creation** → first Dream → app. (Signup comes *after* the
  survey.)
- **Scenario assessment:** 10 real-life scenarios; tap a choice → brief reaction →
  **auto-advance** (no "Continue" button). Produces one of five archetypes:
  Spark / Soother / Scroller / Planner / Dreamer. Scoring logic must be preserved.
- **Decision moment:** amount + two directions ("enjoy it" / move to a Dream);
  choosing plays a short micro-transition then auto-continues. No standalone
  "pause" page, no guilt/shaming language.
- **Simulation disclosure:** first entry to each vertical shows a one-tap "this is
  a simulation" notice; acknowledgement persists per-vertical.
- **Dreams:** create / edit / delete; progress is the virtual tally; optional
  cover photo; one active Dream.
- **Accounts & data:** Supabase email/password auth; per-user data (profile,
  dreams, decisions, achievements, consumption) with RLS; profile/dream photos in
  private Storage; local→cloud migration on first sign-in; account deletion via a
  server-side Edge Function.
- **Catalogue realism:** launch product imagery must be **real photographs**, not
  illustrations/emoji (tracked by `scripts/image-audit.mjs`).
- **Constraints:** fictional brands only (no real trademarks/logos/packaging); no
  real card/bank credentials; no invented neuroscience/dopamine statistics.

## 4. Core user journeys (must work end-to-end)
1. **First run:** intro → assessment → profile → signup → first Dream → Today.
2. **Browse → decide:** Today → vertical (sim notice) → product → cart → checkout
   → decision moment → outcome → home.
3. **Returning user:** sign in → data restored (dreams, profile, progress).
4. **Dream management:** create / edit / delete a Dream; set active.
5. **Insight surfaces:** Money You Kept, Consumption Intelligence, Future
   Intelligence / lessons, achievements.
6. **Account:** profile photo upload; feedback; settings incl. data export and
   account deletion.

(These are enumerated operationally in `REGRESSION_CHECKLIST.md`.)

## 5. Design principles (as practiced)
- Premium, calm, gender-neutral; dark "Midnight" theme with champagne accent.
- One idea / one primary action per screen; fast, fluid transitions.
- Non-judgmental language; agency-preserving ("your choice", not "you should").
- India-first content and formatting (₹, Indian grouping, local context).
- Offline-safe imagery fallbacks; never a broken image in the customer path.
- Honesty in claims: simulation and virtual-tally nature stated plainly.

## 6. Out of scope / explicit non-goals (as built)
- No real payments, orders, or bank/UPI connectivity.
- No real third-party brands or trademarked product imagery.
- No clinical/medical framing of spending behavior.

## 7. Open product questions (not yet decided — do not treat as requirements)
- Which promise does SELFly defend: "practice noticing" vs "intercept real
  spend"? **UNKNOWN.**
- Target persona/segment and the primary success metric. **UNKNOWN.**
- Native app vs web, and re-engagement mechanism (push). **UNKNOWN.**
See `FEATURE_BACKLOG.md` → "Ideas / open questions".
