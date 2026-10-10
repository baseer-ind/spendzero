# SELFly — Regression Checklist

Functionality and journeys that **must not break**. Check the relevant items
before and after any change; the automated full-journey smoke (`webapp/smoke.mjs`)
already exercises most of these — keep it green and add to it when you add flows.

How to run the automated pass (from `webapp/`): build with
`NITRO_PRESET=node-server npm run build`, serve `.output/server/index.mjs` on
`127.0.0.1:3000`, then `node smoke.mjs`. Report real results.

## A. First-run onboarding (order matters)
- [ ] Splash → 3-screen intro (idea → problem → transformation) with brand logo.
- [ ] Scenario assessment shows; choices **auto-advance** with a brief reaction;
      **no "Continue" button**; all 10 scenarios completable.
- [ ] Profile reveal ("Your pattern" + archetype) appears after the survey.
- [ ] Account signup appears **after** the profile reveal (not before).
- [ ] First Dream creation → lands in the app (Today).

## B. Accounts & persistence
- [ ] Sign up, sign in, sign out work.
- [ ] Password recovery entry point present.
- [ ] Duplicate email / wrong password / invalid email show clear errors.
- [ ] Returning user: data (dreams, profile, progress) restored after sign-in.
- [ ] Local→cloud migration does not wipe local data on failure.
- [ ] Guest/offline (no Supabase env) still runs via local fallback.
- [ ] Account deletion removes data + media + auth user, then signs out.

## C. Shopping simulation (every vertical a customer can reach)
- [ ] Today hub shows category tiles; each live vertical opens.
- [ ] First entry to a vertical shows the **simulation notice**; acknowledgement
      persists (doesn't nag).
- [ ] Search, sort, filters work; wishlist add/remove; cart add/update/remove.
- [ ] Checkout reaches the decision moment.
- [ ] Product imagery renders (real photo where registered; safe fallback
      otherwise — never a broken image).

## D. Decision moment
- [ ] Amount + two directions ("enjoy it" / move to a Dream).
- [ ] Choosing plays the micro-transition then **auto-continues** (no standalone
      pause page, no "Continue").
- [ ] Redirect updates the chosen Dream's virtual tally; decision is logged.
- [ ] Category carries through to the decision correctly.

## E. Dreams & insight surfaces
- [ ] Create / edit / delete a Dream; set active; amount shown with Indian grouping.
- [ ] Money You Kept reflects redirected amounts by category.
- [ ] Consumption Intelligence (attention/time) renders.
- [ ] Future Intelligence / lessons render; a lesson opens.
- [ ] Achievements screen renders.

## F. Profile, feedback, settings
- [ ] Profile photo upload persists across reload and sign-out/in.
- [ ] Home top-right shows profile photo (or initials fallback).
- [ ] Feedback: floating control opens the sheet; submit works; history visible.
- [ ] Settings: data export; account deletion; privacy copy present.

## G. Invariants (breakage = data loss or trust failure)
- [ ] localStorage keys unchanged: `project_future_state_v1`,
      `project_future_creds_v1`, `project_future_images_v1`,
      `project_future_feedback_v1`, `selfly_sim_ack_v1`.
- [ ] Supabase schema/RLS/Storage and the `delete-account` function unchanged
      (unless explicitly authorized).
- [ ] Env var names unchanged; **service-role key never in the client/repo**.
- [ ] No real brands/trademarks/packaging; ₹ with Indian grouping; simulation &
      virtual-tally framing intact; no guilt/shaming or invented stats.
- [ ] App renders on mobile widths (≈360/390/412) with no horizontal overflow.
- [ ] SSR-safe: no hydration mismatch; the app renders the splash until hydrated.

## H. Build/quality gates
- [ ] `NITRO_PRESET=node-server npm run build` succeeds.
- [ ] `node smoke.mjs` passes end-to-end (issues: none).
- [ ] `node scripts/image-audit.mjs` — launch gate passes; note total-catalogue
      count toward the 99/100 reconciliation.
- [ ] `npm run lint` clean (or no new errors introduced).
