# Launch Readiness Checklist

Legend: **PASS** · **FAIL** · **N/A** · **BLOCKED (owner action)**. Nothing is
marked PASS without being exercised (code + Playwright `smoke.mjs`, prod build
served locally). Live-URL phone tap-through is the one remaining human check.

## PRODUCT
- Core loop (Explore → Pause → Decide → Build) end-to-end — **PASS**
- Two deep verticals (Food, Electronics) — **PASS**
- Dreams, covers, multiple goals — **PASS**
- Decision Moment with opportunity cost — **PASS**
- Money You Kept, Consumption, Future Intelligence — **PASS**

## UX
- No dead interactions; "Soon" clearly marked — **PASS** (see LAUNCH_AUDIT)
- Empty states (wishlist, feedback, consumption, goals, cart) — **PASS**
- Error/fallback states for images — **PASS**
- Copy tone (no shame, no dopamine claims) — **PASS**

## FUNCTIONALITY
- Search / filters / sort (Electronics) work and change results — **PASS**
- Wishlist add/remove/persist + destination — **PASS**
- Cart qty/remove/persist/totals; no duplicate checkout — **PASS**
- Checkout (address/PIN/payment sim, GST) — **PASS**
- Feedback + suggestions + micro-feedback — **PASS**

## IMAGES
- Core imagery local, offline, never broken — **PASS** (IMAGE_LAUNCH_AUDIT)
- Photographic asset upgrade — **N/A for RC** (documented path; licensing gated)

## PERFORMANCE
- Local catalogue data, lazy images, SVG tiles ~1KB — **PASS**
- Build output sane; no per-second global re-render (nudge isolated) — **PASS**
- Formal Lighthouse run — **BLOCKED** (run on live URL post-deploy)

## ACCESSIBILITY
- Semantic buttons/links, aria-labels on icon controls, alt text — **PASS (basic)**
- Tap targets ≥ ~40px, dark-theme contrast on gold/foreground — **PASS (basic)**
- Full screen-reader / keyboard-nav / font-scaling audit — **BLOCKED** (dedicated pass recommended)

## PRIVACY
- No real payment; no card capture — **PASS**
- User photos on-device only; never uploaded — **PASS**
- Feedback local; email optional — **PASS**
- Savings is a virtual tally, never "held funds" — **PASS**
- Formal privacy policy document — **BLOCKED** (owner/legal before store listing)

## SECURITY
- Device-local auth is beta-only (documented as not real security) — **PASS (disclosed)**
- No secrets in frontend; image search provider replaceable server-side — **PASS**
- Real auth/backend hardening — **N/A for RC** (future backend)

## ANALYTICS
- In-app consumption analytics (own data) — **PASS**
- Third-party product analytics — **N/A for RC** (none shipped by choice)

## FEEDBACK
- Submit, categorise, history, status, micro-feedback — **PASS**
- Backend sync — **N/A for RC** (abstraction ready)

## ERROR HANDLING
- Image failure fallback — **PASS**
- Not-found product/lesson/restaurant → graceful "back" — **PASS**
- localStorage quota/private-mode guarded (try/catch) — **PASS**

## OFFLINE
- After load, catalogue + state + images work offline (local) — **PASS**
- First load requires network (SSR) — **expected**; PWA/offline-first — **N/A for RC**

## DATA
- All user data in localStorage, SSR-safe hydration — **PASS**
- Export/delete-my-data controls — **BLOCKED** (add before wide launch)

## RELEASE
- Production build clean; deploys to Vercel (main) — **PASS**
- Live-URL phone tap-through — **BLOCKED** (founder, post-deploy)

## LEGAL
- Terms, Privacy Policy, fictional-brand disclaimer page — **BLOCKED** (owner/legal)

## STORE (if wrapping as app)
- TWA/Capacitor wrapper, Play listing, icons, privacy URL — **BLOCKED** (owner)

---
**Summary:** No critical broken user journeys. All in-app functionality is PASS.
Remaining items are BLOCKED on owner/legal/store actions or are post-RC
(photographic assets, backend, formal a11y/perf/legal) — none block a usable
first version.
