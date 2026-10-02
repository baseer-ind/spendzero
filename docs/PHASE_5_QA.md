# Phase 5 — QA

Automated via `webapp/smoke.mjs`. Build (`NITRO_PRESET=node-server`), serve
`.output/server/index.mjs` at 127.0.0.1:3000, run `node smoke.mjs`. Expect
`ISSUES: ✅ none`.

## Covered

| Area | Assertion |
|------|-----------|
| Electronics live | Electronics card live on Today |
| Discovery | TechBazaar deals rail; category chips; search ("earbuds") |
| Product detail | specs + reviews present; gallery; wishlist toggle |
| Add → decision | add to cart → checkout → Place order → pause |
| Category carry-through | decision shows "Electronics" category |
| Consumption dashboard | "Your attention" + "What caught your attention" + a vertical listed |
| Money You Kept | total + category breakdown |
| Full prior journey | India-first food, decision moment, multi-dream routing, Future Intelligence |
| Routes 200 | incl. `/electronics`, `/consumption` |
| Persistence | session + onboarding survive reload |

## Time-tracking correctness (by design)
- Active time counts only when the tab is **visible** and the user interacted
  within 30s; background/idle time excluded (`lib/tracking.tsx`).
- "Money redirected" is computed **only** from explicit Build-my-future
  decisions, never from abandoning a page.
- "Cart value explored" counts additions regardless of purchase; "Money spent"
  comes only from Enjoy-it decisions.

## Manual checks (device)
| # | Scenario | Expected |
|---|----------|----------|
| 1 | Browse Electronics ~2 min | pause nudge appears; "Keep exploring" snoozes; "Take a pause" → Today |
| 2 | Switch tabs / lock screen | paused time not counted |
| 3 | Idle 30s+ | time not counted while idle |
| 4 | Wishlist a product, reload | wishlist persists |
| 5 | Consumption over multiple sessions | weekly totals accumulate per day |
| 6 | Mixed cart (Food + Electronics) | decision category = highest-value item's vertical |
| 7 | Broken image | gradient+emoji fallback, no layout break |

## Not yet (scoped next)
Remaining verticals (Grocery, Shopping, Fashion, Beauty, Home, Travel,
Entertainment) are "Soon" on Today — intentionally, to keep depth over breadth.
External-app usage and real-money integrations are research-only (see their docs).
