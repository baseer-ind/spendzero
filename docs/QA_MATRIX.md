# QA Matrix — Project Future (web app)

Status key: ✅ works (verified) · ⚠️ partial · ❌ missing · 🔁 automated in `webapp/smoke.mjs`

## Core journeys
| # | Journey | Status | Notes |
|---|---------|--------|-------|
| 1 | First launch → registration gate shown | ✅ 🔁 | Create account / sign in |
| 2 | Register → land in app (home/setup) | ✅ 🔁 | Name shows in greeting |
| 3 | Sign in (returning) | ✅ | Validates device-local creds |
| 4 | Sign out (profile) | ✅ | Returns to auth gate |
| 5 | Create a dream (emoji/name/target) | ✅ 🔁 | Persists |
| 6 | Dream persists across reload | ✅ 🔁 | localStorage |
| 7 | Select active dream | ✅ | Tap a dream on /future |
| 8 | Home shows active dream (saved/target/%) | ✅ 🔁 | Empty state when none |
| 9 | Quick resist: /order → amount → Move → /continue | ✅ 🔁 | applySaving once |
| 10 | Browse: /order → /restaurants → /restaurant | ✅ 🔁 | Reachable now |
| 11 | Add to cart (qty increments) | ✅ 🔁 | Sticky cart bar |
| 12 | Cart: change qty / remove | ✅ | setCartQty / remove |
| 13 | Checkout: Resist & save → moves cart total → /continue | ✅ 🔁 | Clears cart |
| 14 | Cart cleared after checkout (no double-save) | ✅ 🔁 | |
| 15 | Continue screen shows real amount + progress | ✅ 🔁 | Reads last event |
| 16 | Journey shows real save history + stats | ✅ | Empty state → /order |
| 17 | Profile stats real; rows navigate | ✅ | Dreams/Journey links |
| 18 | All 9 routes return 200 | ✅ 🔁 | |
| 19 | Back/escape path on every screen | ✅ | NavBar back + bottom nav |

## Persistence test (manual)
Create dream → add to cart → resist/save → reload → everything remains. ✅ (reload leg automated)

## Offline
Local-first: all state in localStorage; only external dependency is Google Fonts + bundled images (served by app). No API calls in reachable flows → works offline once loaded. PWA/service-worker for true offline cold-start: ⚠️ pending.

## Not yet built (web app)
| Area | Status |
|------|--------|
| Shopping / grocery / travel / movies / beauty / furniture verticals | ❌ (exist in Flutter only) |
| Achievements / badges screen | ❌ |
| Cloud account sync | ❌ |
| Edit / archive a dream | ⚠️ (create + select done; edit/delete pending) |
