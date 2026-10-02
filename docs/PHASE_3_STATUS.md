# Phase 3 — Status (Realistic Craving Sandbox)

## Milestone: creating a dream now begins the journey, and Food feels like a real food app
Browser-verified end-to-end (`webapp/smoke.mjs`).

### Post-goal
- New **GoalTransition** ("Your future has a name" → EXPLORE TODAY / VIEW MY FUTURE). The user is never
  dropped onto a bare dashboard after creating a goal.
- Home has a **"Today's opportunity"** card → the hub; center nav → `/today`.

### Today hub (`/today`)
- "What are you in the mood for?" — 8 categories. **Food live**; others show a clear "Soon" state (no dead buttons).

### Food vertical (deep, live)
- `/food` chooser: Zwigato / Tomato / YumRush (distinct accents/identities).
- `/food/$app`: restaurant discovery — **search** (restaurants + dishes) + **cuisine filter chips** + rich
  cards (image, rating, ETA, distance, fee, offer, veg indicator, price-for-two).
- `/food/$app/$restaurant`: hero + info card + **Veg-only toggle** + sectioned menu (Popular/Biryani/…),
  veg/non-veg marks, bestseller tags, MRP strike-through, **item detail sheet with add-ons**, add to cart,
  sticky cart bar.
- Cart (real: qty/remove/total) → **"Take a moment"** → `/pause`.

### Pause → Decide → Redirect (enhanced)
- `/pause`: "What are you feeling?" → "Spend ₹X or build your future?"
- **Enjoy path**: "Enjoy it. You decided consciously." (no guilt; records a decision).
- **Redirect path**: **goal picker** when multiple goals → moves the amount → `/continue` reward → updates
  goal balance, journey event, decision count, achievements.

### Achievements
- `/achievements`: First Pause, First Redirection, ₹1,000 Built, 7-Day Momentum, First Milestone — each links
  to Journey/Future (never a dead "unlocked").

## Reused / preserved
Store (dreams, redirections, cart, accounts), Journey, Continue reward, Lovable design language, Phase-2
onboarding (Story/Assessment/Profile).

## Data & architecture
- `src/lib/catalog.ts` — structured, extensible catalogue (food deep; pattern ready for other verticals).
- `src/components/Img.tsx` — image with graceful fallback.
- Savings stays **virtual** (no custody); real "Move to Savings" remains the documented future partner step.

## Tests
`webapp/smoke.mjs`: story→register→assessment→profile→goal→**transition→today→Food→app→search→restaurant→
menu→add-on sheet→cart→Take a moment→pause→redirect→continue**; plus quick-resist pause (both paths),
achievements, persistence, all routes. **All pass, 0 issues.** node + vercel builds clean.

## Remaining (next iterations)
- Build Shopping, Grocery, Travel, Entertainment to the same depth (infra + data ready).
- Checkout realism (address/payment simulation screen) before the Pause.
- Behavioural insights over time ("this month you redirected ₹X across N decisions / by category").
- Edit/archive goal.
- Production image pack (see ASSET_STRATEGY.md).
- Google Play: TWA/Capacitor wrapper + founder-owned items (unchanged).

## Next action
Generalise the Food discovery/detail/cart components into vertical-agnostic primitives, then build Shopping next.
