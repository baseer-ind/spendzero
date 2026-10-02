# Release Candidate

- **Version:** 1.0.0-rc1
- **Build:** TanStack Start (SSR) + Vite + React 19 + Tailwind 4, Nitro.
  `NITRO_PRESET=vercel` for deploy; `node-server` for local verification.
- **Deployment:** Vercel, production tracks `main` → spendzero-five.vercel.app.

## Launch-ready definition
No critical broken user journeys. Met: every core journey passes (code +
Playwright), every visible control works/navigates/or is clearly "Soon".

## Fixed in this candidate
- Image reliability: removed external image host; all catalogue imagery is local
  offline SVG art; universal fallback — no broken images.
- Shopping made real: working sort + filters, wishlist with a real `/wishlist`
  destination, recommendations, delivery/availability on detail. No dead
  interactions.
- Feedback & suggestions system + micro-feedback (backend-ready abstraction).
- Empty/error states across wishlist, feedback, consumption, cart, goals.

## Test coverage (Playwright `smoke.mjs`, all green)
Onboarding → food → cart → Indian checkout → Decision Moment (enjoy + build,
multi-dream routing) → Money You Kept → Future Intelligence lesson → Electronics
(search/filter/sort/detail/recommendations/wishlist/cart → decision with category)
→ Consumption dashboard → Feedback submit + history → persistence → all routes 200
(incl. /wishlist, /feedback, /savings, /consumption). Plus assertion that
catalogue images are local data URIs.

## Image coverage
100% of catalogue + covers render locally (no network). Hero screens use bundled
JPGs. See IMAGE_LAUNCH_AUDIT.

## Feedback system
Live: report/suggest/feature/confusing/general/other + micro-feedback; My
Feedback history with status; guest-friendly; stored locally with a sync-ready
interface.

## Privacy / money
No real payments; no card capture; photos on-device; savings is a virtual tally.
Device-local auth disclosed as beta-only.

## Performance
Local data, lazy images, tiny SVG tiles, isolated timer re-renders. Formal
Lighthouse to be run on the live URL.

## Known issues / remaining (non-blocking for RC)
- Photographic assets (generated art for now).
- Formal a11y, performance (Lighthouse), privacy policy & legal pages, store
  wrapper — owner/legal/post-RC.
- Backend sync for feedback & accounts — abstractions ready.
- Live-URL phone tap-through — recommended final human check.
- Pre-existing `__root.tsx` error-component TS nuance (bundler-tolerated).

## Deployment status
Committed, pushed to `claude/spendzero-mobile-app-vudvnb` and fast-forwarded to
`main`. Vercel rebuilds on push.

**Verdict:** Release candidate — a first version a real Indian user can use
end-to-end without getting stuck. Iterate from real feedback next.
