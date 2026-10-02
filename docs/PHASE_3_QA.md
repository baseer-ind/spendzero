# Phase 3 — QA

Automated via `webapp/smoke.mjs` (Playwright + bundled Chromium) against a local Node build.

## Latest run — ALL PASS, 0 issues
| Check | Result |
|-------|--------|
| Story → Register → Assessment → Profile → First goal | ✅ |
| Post-goal transition ("your future has a name") | ✅ |
| Explore today → Today hub ("in the mood for") | ✅ |
| Today → Food → choose app (Zwigato) | ✅ |
| Restaurant discovery search ("biryani" → Nizam's) | ✅ |
| Restaurant menu renders (sections, veg marks, bestseller) | ✅ |
| Dish with add-ons opens detail sheet → Add to cart | ✅ |
| Item appears in cart | ✅ |
| Cart → "Take a moment" → Pause | ✅ |
| Pause feeling → redirect → Continue (goal updated) | ✅ |
| Quick resist (/order) → Pause → not today → Continue | ✅ |
| Pause → buy → "Enjoy it" (no guilt) | ✅ |
| Achievements screen | ✅ |
| Persistence after reload (session + onboarding) | ✅ |
| All routes 200 | ✅ |

## Final quality test (mandate) — Food
Create future → understand next (transition + hub) → open Food → choose app → browse restaurants (search/filter)
→ open restaurant → browse menu → open item → customise (add-ons) → add to cart → modify cart → checkout (cart)
→ Pause → choose Enjoy OR Build My Future → see result → return to My Future → see progress. **Verified.**

## Notes
- Console shows `ERR_TUNNEL_CONNECTION_FAILED` / cert warnings for external images — **sandbox proxy only**;
  real browsers load `<img>` fine, and the `Img` fallback covers failures regardless.
- Shopping/Grocery/Travel/Entertainment: not yet built to depth → not claimed complete (marked "Soon" in-app).

## To automate when built
Repeat the full quality test for Shopping, Grocery, Travel, Entertainment.
