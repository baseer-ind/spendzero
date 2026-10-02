# Phase 2 — Implementation Status

## Milestone: the story-first journey is built and browser-verified
The product now opens with the behavioural story, not the sandbox.

### New first-run journey (verified end-to-end in Playwright)
`Splash → Story → Create account → Assessment (10 Q) → Spending Profile → First goal → App`
Implemented in `src/components/ExperienceGate.tsx` + `src/components/onboarding/*`.

### Core loop now includes Pause → Decide
`Discover → Crave → Pause → Decide → (Buy "Enjoy it" | Not today → Redirect → Save → Progress → Reward)`
- New `/pause` route: "What are you feeling?" → "Spend ₹X or build your future?" — both choices respected.
- Buy path shows **"Enjoy it"** (no guilt); not-today path redirects the amount to the active goal, records the
  event, clears the cart, and celebrates on `/continue`.
- Cart checkout and the quick-resist both route through the Pause.

## Rebuilt
- First-run experience (`Story`, `Assessment`, `ProfileResult`, `FirstGoal`, `ExperienceGate`).
- Craving loop now has the behavioural Pause/Decide (`/pause`).

## Added
- `src/lib/assessment.ts` — 10 original items, transparent scoring, 5 archetypes (Spark/Soother/Scroller/Planner/Dreamer).
- `src/lib/achievements.ts` + `/achievements` screen — every badge links somewhere (Journey/Future).
- Store: `storySeen`, `profile`, `decisions`; `setStorySeen/setProfile/recordDecision`.
- Profile screen shows the behaviour pattern + Achievements link.

## Preserved / reused
- Store core (dreams, redirections, cart, accounts, streak, persistence).
- Home ("My Future"), Future (dreams), Journey (real events), cart/restaurant, `continue` (now the redirect reward).
- Lovable design language (tokens, imagery, motion, serif display, gold).

## Removed
- Dead profile rows and the fake "9:41/battery" status bar (earlier). No functional loss.

## Savings / real-money architecture
- Balance remains a **virtual tally** (no custody). Append-only redirection events. "Move to Savings" remains a
  documented future bounded context (see SAVINGS_DOMAIN_ARCHITECTURE.md) — not implemented, not faked.

## Monetisation readiness
- No monetisation shipped. Architecture documented (MONETISATION_ARCHITECTURE.md): subscription + B2B buildable
  now; real-money/referrals partner-gated.

## Tests performed
`webapp/smoke.mjs` (Playwright + Chromium): story shown → register → assessment ×10 → profile → goal → app;
quick resist → pause → not-today → continue; pause → buy → "Enjoy it"; cart → pause; achievements; persistence
after reload; all 10 routes 200. **All passing, 0 issues.** node + vercel builds clean.

## Remaining blockers
- **Google Play AAB**: still requires a TWA/Capacitor wrapper + Android tooling in CI + founder-owned items
  (Play account, keystore, privacy-policy URL). Unchanged; see PLAY_RELEASE_CHECKLIST.md.
- Edit/archive goal; richer behavioural insights over time; additional verticals — next iterations.

## Exact next release step
Ship this build to Vercel (web). For Android: build the installable PWA (manifest + icons + service worker),
then a Bubblewrap TWA in CI to produce the AAB.
