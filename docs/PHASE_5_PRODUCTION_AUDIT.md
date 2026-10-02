# Phase 5 — Production Audit

Honest account of how the app was verified, what passed, and what remains a
caveat. Principle: do not claim "everything works" because automated tests pass.

## How it was verified
- **Production build, served locally.** The app is built with
  `NITRO_PRESET=node-server` (the same source/bundle Vercel deploys with the
  `vercel` preset) and run at `127.0.0.1:3000`. This exercises the real SSR +
  client bundle, not the dev server.
- **Playwright end-to-end** (`webapp/smoke.mjs`) drives the full journey on a
  mobile viewport (420×880).
- **Live-URL tap-through from this environment was not possible:** the sandbox's
  outbound proxy does not reach `spendzero-five.vercel.app` (returns 000), so a
  human tap-through on the hosted URL is still recommended as the final check.

## Verified (build + Playwright, issues: none)
- Fresh user: Story → Assessment → Spending Profile → Create Dream (with cover
  image picker) → post-goal transition → Today.
- Food: ZaikaGo → Deccan Zaika → search "biryani" → menu → add (incl. add-on
  sheet) → cart → Indian checkout (address + PIN + payment sim) → Place order.
- Decision Moment: dreams shown with amount; "One choice. Two directions.";
  Build my future → goal before→after; Enjoy it → no-shame path.
- Multiple dreams: both shown; redirect routes to the chosen goal.
- Electronics (TechBazaar): deals rail, category chips, search, product detail
  (gallery, variants, specs, reviews, bank offer, scarcity), wishlist toggle,
  add to cart → checkout → decision carrying the Electronics category.
- Money You Kept (`/savings`) with category breakdown; Consumption dashboard
  (`/consumption`) with attention-by-vertical/app and attention-vs-money insight.
- Future Intelligence hub + Discount Trap lesson with research.
- Persistence: session + onboarding survive reload. All live routes return 200.

## Caveats / known issues
1. **Remote images in the sandbox** fail via the proxy
   (`ERR_CERT_AUTHORITY_INVALID` / `ERR_TUNNEL_CONNECTION_FAILED`). They resolve
   in a real browser; the `Img` component falls back to gradient+emoji regardless.
   Recommend confirming real imagery on the live site.
2. **Pre-existing TS nuance** in `__root.tsx` error-component typing
   (`ErrorComponentProps.error: unknown`) — tolerated by the bundler; not from
   Phase 5. Worth a cleanup pass later; does not affect runtime.
3. **Pause-nudge timing** (120s active) is not asserted in the smoke test (would
   require a 2-minute wait); verified by build + manual reasoning. Confirm feel on
   device.
4. **Manual checks still worth doing on device:** browser restart persistence,
   true offline, camera capture for photos, and the live-URL tap-through.

## Recommendation
Founder should tap through the live URL on a phone once the deploy completes,
focusing on the Decision Moment and the Consumption dashboard. Everything
automatable is green; these remaining checks are environment/device-specific.
