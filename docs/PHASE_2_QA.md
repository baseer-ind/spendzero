# Phase 2 — QA

Automated via `webapp/smoke.mjs` (Playwright + bundled Chromium) against a local Node build of the app.
Run: build `NITRO_PRESET=node-server npm run build`, start `node .output/server/index.mjs`, then `node smoke.mjs`.

## Latest run — ALL PASS, 0 issues
| Check | Result |
|-------|--------|
| Story shown on first launch | ✅ |
| Auth shown after story | ✅ |
| Assessment shown after register | ✅ |
| Assessment → Profile result | ✅ |
| Profile → First goal | ✅ |
| Goal created → landed in app | ✅ |
| Quick resist → Pause | ✅ |
| Pause (not today) → Continue (redirect + save) | ✅ |
| Pause (buy) → "Enjoy it" (no guilt) | ✅ |
| Cart → Pause | ✅ |
| Achievements screen renders | ✅ |
| Onboarding/session persists after reload | ✅ |
| All 10 routes return 200 | ✅ |
| Console errors | only sandbox font-cert warning + favicon 404 (harmless in prod) |

## Journeys covered (per mandate Phase R)
- Fresh install → story → assessment → profile → goal → craving → pause → **decide YES** → "Enjoy it" → home. ✅
- Fresh install → … → craving → pause → **NOT TODAY** → redirect → progress → continue/journey. ✅
- App reload (persistence). ✅
- Cart add → cart → pause. ✅
- Direct route access (all routes 200). ✅

## Still to automate / manual
- Offline cold-start (needs PWA/service worker — pending).
- Edit/archive goal (feature pending).
- Multiple goals + choosing which goal a redirect funds (currently funds the active goal).
- Duplicate-checkout prevention under rapid double-tap (cart clears on decision; low risk).
