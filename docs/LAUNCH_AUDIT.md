# Launch Audit — Interactive Inventory

Status of every interactive surface in the launch-candidate build. Legend:
**✅ Working** · **Partial** · **🚧 Coming soon (clearly marked)** · **❌ Broken**.
Goal: zero dead interactions. Verified via code + Playwright (`smoke.mjs`).

## Onboarding
| Element | Status |
|---|---|
| Story (skip / continue) | ✅ |
| Register / sign in / validation | ✅ |
| Assessment (10 items) → profile | ✅ |
| Profile result → first goal | ✅ |
| First goal: category pick, target, **cover image picker** | ✅ |
| Post-goal transition → Today | ✅ |

## Navigation
| Element | Status |
|---|---|
| Bottom nav (Today/Future/＋/Journey/Me) | ✅ |
| Back buttons (NavBar) | ✅ |
| Home cards → Today, Future, Future Intelligence | ✅ |

## Today hub
| Element | Status |
|---|---|
| Food card → /food | ✅ |
| Electronics card → /electronics | ✅ |
| Grocery / Shopping / Travel / Entertainment / Beauty / Home | 🚧 "Soon" badge, non-clickable, honest |

## Food vertical
| Element | Status |
|---|---|
| App chooser (ZaikaGo/KhanaNow/MealKart) | ✅ |
| Discovery: search, cuisine chips, cards (area/city/cost/veg) | ✅ |
| Restaurant menu, veg/egg/nonveg filter, dish sheet add-ons | ✅ |
| Add to cart / cart bar | ✅ |

## Electronics vertical (TechBazaar)
| Element | Status |
|---|---|
| Search (name/brand/category) | ✅ |
| Category chips | ✅ |
| Sort (popular/price↑/price↓/rating/discount) | ✅ real |
| Filters (Under ₹2,000 / 4.3★+ / Big discounts) | ✅ real |
| Deals rail, trending | ✅ |
| Product detail: gallery, variants, specs, reviews, bank offer, scarcity, delivery/availability | ✅ |
| Wishlist toggle → **/wishlist destination** | ✅ (was dead; fixed) |
| Recommendations ("More like this") | ✅ |
| Add to cart / Buy now | ✅ |

## Cart & checkout
| Element | Status |
|---|---|
| Qty +/- , remove, totals, persistence | ✅ |
| Empty state → Explore today | ✅ |
| Checkout: Indian address, mobile, PIN, payment sim (UPI/Card/NetBanking/COD), GST, delivery | ✅ |
| Place order → Decision Moment (category carried) | ✅ |

## Decision Moment
| Element | Status |
|---|---|
| Trigger step | ✅ |
| Dreams shown (cover, progress, amount) | ✅ |
| Enjoy it (no shame) | ✅ |
| Build my future → goal pick (before→after) → redirect | ✅ |
| Multiple dreams route to the chosen goal | ✅ |

## Future / money / intelligence
| Element | Status |
|---|---|
| Future: dreams, add dream, cover edit, active select | ✅ |
| Continue (reward) + micro-feedback | ✅ |
| Money You Kept (/savings) + category breakdown | ✅ |
| My Consumption (/consumption) attention vs money | ✅ |
| Future Intelligence hub + lessons + research + "Try it" | ✅ |
| Journey, Achievements | ✅ |

## Profile & feedback
| Element | Status |
|---|---|
| Profile photo (upload/camera/crop/remove, initials fallback) | ✅ |
| Rows: dreams, consumption, money kept, Future Intelligence, journey, achievements | ✅ |
| Feedback & suggestions (submit + My Feedback) | ✅ |
| Micro-feedback (continue, lessons) | ✅ |
| Sign out | ✅ |

## Known non-blocking notes
- Remote-image console noise only in the sandbox proxy; catalogue images are now
  local data-URI SVG (never broken). See `IMAGE_LAUNCH_AUDIT.md`.
- Pre-existing TS nuance in `__root.tsx` error-component typing (bundler-tolerated).
- "Soon" verticals are intentionally non-interactive with a clear badge.

**Result: no dead interactions. Every visible control works, navigates, or is
clearly marked "Soon".**
