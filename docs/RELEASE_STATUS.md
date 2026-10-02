# Project Future — Release Status

_Living document. Updated continuously during the productization loop._

## Current phase
**Phase 2 — Product completeness on the web app** (make every reachable flow real, no dead buttons, persistence + offline), verified with a headless-browser smoke test (`webapp/smoke.mjs`, Playwright + bundled Chromium).

## ⚠️ Architectural reality (read first)
The live, approved design is a **React web app** (`webapp/`, TanStack Start + Vite + Tailwind), deployed to **Vercel** (`spendzero-five.vercel.app`). It is **not** React Native/Expo.

Consequences:
- All product work (flows, buttons, persistence, offline, polish) applies and is testable in a browser. ✅
- **Google Play requires an Android artifact (AAB).** A website cannot be uploaded directly. Paths to Play:
  1. **TWA / Bubblewrap** — wrap the deployed PWA as an Android app (needs the app to be an installable PWA: manifest + service worker + HTTPS). Recommended; keeps this exact design.
  2. **Capacitor** — wrap the web build in a native shell.
  3. **Flutter app** (`spendzero/mobile`) — already has the Android pipeline + the 6 verticals, but NOT this design.
- Android AAB **cannot be produced in this sandbox** (no Android SDK/JDK here). It requires Android tooling in CI or a local machine. This is tracked in `PLAY_RELEASE_CHECKLIST.md`.

**Honest bottom line:** the *product* can be made excellent and shippable-as-a-web-app today; a *Play AAB* "today" depends on standing up the TWA/Capacitor Android build, which is the top release blocker.

## Completed
- Local-first store (dreams, savings, streak, cart, accounts) persisted to localStorage; SSR-safe.
- **Registration/login gate** — app starts with create-account / sign-in. Device-local accounts.
- **Dreams**: create (emoji/name/target), persist, select active, progress.
- **Craving → save loops (both):**
  - Quick resist: `/order` → set amount → Move to future → `/continue`.
  - Browse → cart → checkout: `/order` → `/restaurants` → `/restaurant` (add to cart) → `/cart` (qty/remove) → Resist & save (moves cart total, clears cart) → `/continue`.
- **Journey** — real save-event timeline + stats + empty state.
- **Profile** — real name/email, lifetime saved, cravings passed, dream count; working Sign out; rows link to Dreams/Journey (no dead rows).
- **Home** — active-dream hero (real), empty state, collection, momentum (real total + streak).
- Removed the fake "9:41 + battery" mockup status bar everywhere.
- Deployment: Vercel builds the web app via root `vercel.json` (verified build locally).

## In progress / Next
- Installable PWA (manifest + icons + service worker) → prerequisite for TWA.
- Decide + implement Android wrapper (TWA recommended) in CI.
- App icon / adaptive icon / splash (for the Android wrapper).

## Known gaps (not yet done)
- Only the **food** vertical is a complete flow. Shopping/grocery/travel/movies/beauty/furniture exist in the Flutter app but not in this web design yet.
- Accounts are **device-local** (no cloud sync).
- Achievements/badges screen not yet built in the web app.
- No app icon/splash for a native wrapper yet.

## Bugs
- Critical: none known in reachable web flows (smoke test green).
- High: none known.
- Medium: console shows a Google-Fonts cert warning + favicon 404 — **sandbox/local only**, harmless in production; add a favicon to silence.

## Tests run
`webapp/smoke.mjs` (Playwright): registration gate, all 9 routes 200, add dream + persist on reload, home active dream, quick resist → continue, browse → add → cart → resist → continue, cart cleared. **All passing.**

## Build status
- Web (node-server preset): ✅ builds.
- Web (vercel preset): ✅ builds, valid `.vercel/output`.
- Android AAB: ❌ not attempted (no Android toolchain in this environment; see checklist).

## NEXT ACTION
Make the web app an installable PWA (manifest + maskable icons + service worker), then stand up a TWA/Bubblewrap Android build in CI to produce an AAB.
