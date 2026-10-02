# Google Play Release Checklist — Project Future

## The packaging decision (blocker)
The approved product is a **web app**. Play needs an Android **AAB**. Chosen path must be one of:

- **A. TWA / Bubblewrap (recommended).** Wrap the deployed PWA. Pros: keeps this exact design, tiny app, auto-updates with the site. Cons: needs an installable PWA (manifest + service worker), a Play-listed domain + Digital Asset Links (`assetlinks.json`) hosted on the Vercel domain.
- **B. Capacitor.** Bundle the web build in a native shell. More control (native plugins), larger app.
- **C. Flutter app** (`spendzero/mobile`). Has the Android pipeline already, but not this design.

> AAB generation needs Android SDK + JDK. Not available in this sandbox — must run in CI (GitHub Actions) or a local machine.

## PWA prerequisites (for path A) — owned by us
- [ ] `manifest.webmanifest` (name, short_name, theme/background color `#0A0B0E`, display `standalone`, start_url `/`).
- [ ] Maskable + standard icons (192, 512).
- [ ] Service worker for offline cold-start.
- [ ] `.well-known/assetlinks.json` served on the production domain (needs the app signing SHA-256).

## Android config (for the wrapper) — owned by us
- [ ] Package id: `com.projectfuture.app` (matches existing Flutter id).
- [ ] App name: **Project Future**.
- [ ] versionName / versionCode.
- [ ] Target SDK 35, min SDK 24+.
- [ ] Adaptive launcher icon + splash.
- [ ] Release signing keystore (upload key).
- [ ] No debug flags / dev URLs / secrets in the shipped bundle.

## Play Console / store listing — needs FOUNDER input (do not fabricate)
- [ ] Google Play developer account ($25 one-time).
- [ ] App name, short description (≤80 chars), full description.
- [ ] Feature graphic (1024×500), phone screenshots (≥2).
- [ ] **Privacy policy URL** — required. (Founder to host; data is device-local so disclosure is minimal.)
- [ ] Data safety form — what's collected (currently: nothing leaves the device; email/name stored locally).
- [ ] Content rating questionnaire.
- [ ] App category (Finance or Lifestyle), contact email.
- [ ] "No real money is processed" note — this is a simulation/intentional-spending app; make that explicit to avoid finance-policy confusion.

## Status
- Product (web): in progress, flows green.
- PWA: not started.
- Android wrapper/AAB: not started (blocked on decision + CI Android tooling).
- Store assets: not started (several items need founder input, flagged above).
