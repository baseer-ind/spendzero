# Final UX Realism Audit

Standard: "Would a normal Indian consumer believe they're browsing a real
shopping experience?" Honesty rule honoured: generated imagery is **not** marked
PASS as photography.

Legend: **PASS** · **IMPROVE** · **BLOCKER**.

## 1. Product imagery
- Emoji-on-dark-gradient tiles **removed** from product grids. Products now
  render as clean vector illustrations on a **light studio background** with a
  soft shadow (`lib/productArt.ts`) — headphones, phones, watches, shoes, bags,
  bottles, grocery packs, cookware, etc. — offline, stable, legal (no brand
  imagery). → **IMPROVE→PASS for "looks like a catalogue," IMPROVE for photoreal.**
- **Photographic realism:** still illustration, not photos. Shipping real photos
  needs a licensed asset set (or an image pipeline) the founder provides; the
  `ProductImage` `src` accepts them per-product with zero component change. →
  **IMPROVE (BLOCKER for "indistinguishable from Amazon/Myntra photos").**
- Food dishes still use the warmer glyph art (not vector dishes). → **IMPROVE.**

## 2. ProductImage system
- Reusable `components/ProductImage.tsx`: light frame, loading state, graceful
  fallback (vector art), fixed aspect, `object-cover`, no broken icons, no layout
  jump. Used in Electronics + all market grids. → **PASS.**

## 3. Product cards
- Larger image area (h-36), light product tile as the anchor, clear price
  hierarchy (price + struck MRP), discount badge, rating, brand, unit. → **PASS.**

## 4. Product detail
- Gallery (dots), title, brand, rating + count, price/MRP/discount, bank offer,
  scarcity, delivery/availability, variants (electronics), specs, reviews,
  recommendations, wishlist, add-to-cart / book. → **PASS** (content believable,
  imagery IMPROVE as above).

## 5. Decision Moment (redesigned)
- Now **leads with the amount** ("You're about to spend ₹X") and the two
  directions (Build my future / Enjoy it) as the primary action; the trigger
  question is **secondary and optional**, with **conversational, vertical-adaptive**
  options (Food shows "I'm hungry"; Electronics shows "I'm comparing options";
  Travel shows "I'm planning ahead"; etc.). No food questions on non-food.
  Dreams shown with before→after. Empowering tone, agency preserved. → **PASS.**

## 6. Consumption visibility (was hidden)
- **Home "Your day" card** (exploring time · redirected · conscious decisions) →
  taps into `/consumption`. → **PASS.**
- `/consumption` reads as a real feature: **Today** tiles, "your decisions today"
  (paused / enjoyed / redirected), attention-vs-money insight, weekly attention
  map by vertical, time-by-app. → **PASS.**
- (No fake minute-by-minute timeline — we only store daily aggregates, so a
  timeline would be invented. Honest omission.) → **IMPROVE** (needs per-session
  events to be truthful).

## 7. Active-time correctness
- Counts only visible + non-idle time; flushes on nav/unmount; single timer per
  mount; idle timeout 30s. Covered by the attention architecture and exercised in
  smoke. → **PASS.**

## 8. India-first
- ₹ Indian grouping, Indian catalogue/brands (fictional), cities, addresses, PIN,
  UPI/COD, natural Indian English. → **PASS.**

## 9. Mobile-first
- Max-width 440 container, 2-col grids at 360–412px, light tiles, touch targets.
  → **PASS** (recommend a founder device pass; formal a11y/Lighthouse still
  BLOCKED per LAUNCH_READINESS).

## Remaining visual weaknesses (honest)
1. **Photographic product imagery** — biggest gap; needs licensed assets. IMPROVE/BLOCKER.
2. **Food dish imagery** — still glyph-based. IMPROVE.
3. **Consumption timeline** — omitted rather than faked. IMPROVE.

## Verdict
The shopping surfaces now read as a real catalogue (light product tiles, proper
card hierarchy), the Decision Moment feels natural and Indian, and the tracker is
a visible part of the main loop. The one honest caveat remains **true photography**,
which is architecturally ready to drop in but requires licensed assets — so it is
**not** marked PASS.
