# Google Play Store Release Runbook

The launch target is the **Flutter app** (`spendzero/mobile`, package
`com.projectfuture.app`). It is essentially feature-complete (26 screens)
and CI already produces a release `.aab`. This doc covers the remaining
steps to make that `.aab` **Play-uploadable and launched**.

Items are split into **Code (done in this repo)** and **You (Play Console /
account / content)** — the latter can only be done by the account holder.

---

## 0. What's already handled in the repo

- ✅ `applicationId` = `com.projectfuture.app`, app label "Project Future"
- ✅ `minSdkVersion` 23, **`targetSdkVersion` 35** (Play's requirement since Aug 2025)
- ✅ Version bumped to **`1.0.0+1`** (`versionName 1.0.0`, `versionCode 1`)
- ✅ **Release signing config** wired in `scripts/setup_mobile_platforms.sh`:
  reads `mobile/android/key.properties` when present, else falls back to
  debug signing (so local/CI-without-secrets still builds)
- ✅ CI materializes the keystore from secrets and builds a signed AAB
- ✅ `INTERNET` permission declared for release builds
- ✅ Simulation-only positioning (no real payments) — see
  `docs/legal-and-branding-safety.md`

---

## 1. Generate your upload keystore (once) — **You**

Play app-signing works with an **upload key** you hold. Generate it once and
**back it up somewhere safe** — if you lose it you can reset it with Google,
but it's friction you want to avoid.

```bash
keytool -genkey -v -keystore upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Answer the prompts (name/org/etc.) and set a store password + key password
(can be the same). Keep `upload-keystore.jks` and both passwords private.

### Local release build
Put the keystore at `mobile/android/app/upload-keystore.jks` and create
`mobile/android/key.properties` (both are gitignored):

```
storeFile=upload-keystore.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=upload
keyPassword=YOUR_KEY_PASSWORD
```

Then:
```bash
cd spendzero/mobile
flutter build appbundle --release --dart-define-from-file=env/production.json
# -> build/app/outputs/bundle/release/app-release.aab
```

### CI release build (recommended)
Add these **repository secrets** (GitHub → Settings → Secrets and variables
→ Actions):

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 upload-keystore.jks` output |
| `ANDROID_KEYSTORE_PASSWORD` | store password |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | key password |

Once set, the `mobile-build` CI job auto-signs the `project-future-release-aab`
artifact. Without them it still builds, but debug-signed (not uploadable).

To base64 the keystore:
```bash
base64 -w0 upload-keystore.jks   # Linux
base64 upload-keystore.jks | tr -d '\n'   # macOS
```

---

## 2. Backend — not required for this launch

The beta ships **local-first**: `useLocalBackend = true` in
`lib/core/providers/providers.dart`, so all data lives on-device
(SharedPreferences) and the app makes **no network calls** for its core data.
This means:

- `env/production.json`'s API URL is irrelevant for the launch build — the
  app never calls it. No backend needs to be deployed for the app to work.
- New users start with a **clean slate** (no pre-made dreams, zeroed stats —
  see `local_seed_data.dart`); the fictional catalog remains browsable.
- Trade-off: no cross-device sync. To switch to the Supabase-backed server
  later, flip `useLocalBackend = false`, deploy the backend, and point
  `env/production.json` at it — then rebuild.

---

## 3. Create the Play Console app — **You**

1. **https://play.google.com/console** → pay the **$25 one-time** developer
   fee if you haven't (one account, unlimited apps).
2. **Create app** → name "Project Future", default language, **App** (not
   game), **Free**. Accept the declarations.

---

## 4. Store listing content — **draft provided**

See `docs/41-play-store-listing.md` for ready-to-paste title, short
description, full description, and the content-rating / data-safety answers.

**Graphic assets you must produce** (Play won't accept text-only):
- App icon 512×512 PNG
- Feature graphic 1024×500 PNG
- At least 2 phone screenshots (min 320px, 16:9 or 9:16). Grab these from the
  running app — Home, a dream, the "one last pause" flow, Journey.

---

## 5. Required questionnaires — **You** (answers drafted in listing doc)

- **Privacy policy URL** — host `docs/privacy-policy.md` somewhere public
  (e.g. a `/privacy` route on your Vercel web app) and paste the URL.
- **Data safety form** — the app stores a guest device id + user-created
  goals on your backend; no ads, no third-party sharing, no real financial
  data. Drafted answers in the listing doc.
- **Content rating** questionnaire — simulation shopping, no real
  transactions/gambling/violence → expect "Everyone". Drafted in listing doc.
- **App access** — no login required (guest mode); tell them so.
- **Ads** — declare **No ads**.
- **Target audience** — 13+ (or 18+ given the financial-wellness theme; your
  call).

---

## 6. Release to a testing track first — **You**

Do **not** go straight to Production. Use **Internal testing** first:

1. Play Console → **Testing → Internal testing → Create new release**
2. Upload the signed `app-release.aab`
3. Add your own Google account as a tester → install via the opt-in link →
   verify it launches, reaches the backend, and the core loop works
4. When happy: **Production → Create new release**, promote the build, fill
   the release notes, submit for review (first review can take a few days).

---

## Launch-readiness checklist

**Code (this repo):**
- [x] Package id, app name, target SDK 35, version 1.0.0+1
- [x] Release signing infra + CI secret wiring
- [x] Simulation-only legal positioning
- [ ] Confirm `env/production.json` API URL is the live backend  ← verify before build

**You (account / content):**
- [ ] Generate + back up upload keystore; add CI secrets
- [ ] $25 Play Console account + create app
- [ ] Privacy policy hosted at a public URL
- [ ] Icon 512, feature graphic 1024×500, ≥2 screenshots
- [ ] Data safety + content rating questionnaires
- [ ] Upload AAB to Internal testing → verify → promote to Production
