# Running SpendZero Locally

This is the complete guide to running the full stack — backend, database,
cache, and the Flutter app — on your own machine, including on a real
Android phone or iPhone over USB/wifi. No manual config editing required
for the default local-dev path.

---

## 1. Prerequisites

| Tool | Why | Install |
|---|---|---|
| Docker + Docker Compose | Postgres + Redis | https://docs.docker.com/get-docker/ |
| Python 3.11+ | Backend | https://www.python.org/downloads/ |
| Flutter SDK (3.24+) | Mobile app | https://docs.flutter.dev/get-started/install |
| Android Studio | Android SDK, emulator, `adb` | https://developer.android.com/studio |
| Xcode (macOS only) | iOS simulator, device builds, TestFlight | Mac App Store |
| `adb` (Android platform-tools) | Device detection | Bundled with Android Studio; add `platform-tools/` to your `PATH` |

Run `flutter doctor` after installing Flutter — fix anything it flags
before continuing. You don't need Android Studio *or* Xcode to start, only
the one matching the phone you're testing on first.

---

## 2. One-time setup

```bash
git clone <repo>
cd spendzero

# Scaffold mobile/android and mobile/ios (this repo ships without them —
# they're machine-specific build artifacts, generated once via `flutter create`)
./scripts/setup_mobile_platforms.sh
```

That's it. Nothing else needs manual editing — `backend/.env.development`
already ships in the repo with values that match `docker-compose.yml`.

---

## 3. The one-command dev stack

```bash
./scripts/dev.sh
```

This single command:
1. Starts Postgres + Redis via `docker compose up -d db redis`.
2. Waits for both to report healthy.
3. Creates a Python venv in `backend/.venv` and installs dependencies.
4. Runs `alembic upgrade head`.
5. Runs `python -m app.db.seed` — populates ~150 fictional listings across
   12 categories *and* a fully-populated demo guest user (goals, a 10-day
   streak, realistic stats — see [Demo Mode](#7-demo-mode)).
6. Starts the backend with `uvicorn --reload`, bound to `0.0.0.0:8000` (not
   `127.0.0.1` — this is what lets a phone on the same wifi reach it).
7. Polls `/api/v1/health` until it responds, then prints the right base
   URL for each target (emulator/simulator/physical phone).

Leave it running in a terminal. Stop everything with:

```bash
./scripts/stop.sh
```

Logs: `.run/backend.log`. The backend has hot reload — editing any file
under `backend/app/` restarts it automatically.

### Variants

```bash
./scripts/dev.sh --android   # also launches `flutter run` on a detected Android target
./scripts/dev.sh --ios       # also launches `flutter run` on a detected iOS target
./scripts/dev.sh --no-backend  # skip infra, just print instructions (backend already running)
```

Or via `make`: `make dev`, `make dev-android`, `make dev-ios`, `make stop`.

---

## 4. Running the Flutter app

Once the backend is up (`./scripts/dev.sh`), in a second terminal:

```bash
./scripts/run_mobile.sh android   # or: ios
```

This detects whatever's connected (`adb devices` / `flutter devices`) and
launches `flutter run` with the **correct API base URL already wired in**
— see [Base URL resolution](#5-base-url-resolution-no-hardcoded-localhost)
below. Hot reload works exactly as normal: press `r` in the terminal, or
save a file if your editor is wired to `flutter attach`.

If you'd rather run Flutter manually:

```bash
cd mobile
flutter run -d <device-id> --dart-define-from-file=env/development.json
```

(`flutter devices` lists available `<device-id>` values.)

---

## 5. Base URL resolution — no hardcoded localhost

`mobile/lib/core/config/env.dart` is the single source of truth. Resolution
order:

1. **Explicit `--dart-define=API_BASE_URL=...`** — highest priority.
   `scripts/run_mobile.sh` sets this automatically for physical devices.
2. **`--dart-define-from-file=env/<name>.json`** — `mobile/env/development.json`,
   `staging.json`, `production.json`. Carries `ENV_NAME` and a default
   `API_BASE_URL` per environment.
3. **Runtime per-platform fallback** if neither flag is passed: `10.0.2.2`
   (Android emulator's host alias) on Android, `localhost` everywhere else.

| Target | Base URL | How it's set |
|---|---|---|
| Android Emulator | `http://10.0.2.2:8000/api/v1` | Automatic (step 3) |
| iOS Simulator | `http://localhost:8000/api/v1` | Automatic (step 3) |
| Physical Android phone | `http://<your LAN IP>:8000/api/v1` | Auto-detected + injected by `scripts/run_mobile.sh` (step 1) |
| Physical iPhone | `http://<your LAN IP>:8000/api/v1` | Same |
| Staging build | whatever's in `env/staging.json` | `--dart-define-from-file` |
| Production build | whatever's in `env/production.json` | `--dart-define-from-file` |

To find your LAN IP manually: `./scripts/lan_ip.sh`.

**Your phone and your dev machine must be on the same wifi network** for
the physical-device case — corporate/guest networks that isolate clients
from each other will block this.

---

## 6. Connecting a real Android phone

1. On the phone: Settings → About phone → tap "Build number" 7 times to
   unlock Developer Options.
2. Settings → Developer Options → enable **USB debugging**.
3. Plug the phone in via USB. Accept the "Allow USB debugging?" prompt on
   the phone screen.
4. Verify it's detected: `adb devices` should list it as `device` (not
   `unauthorized` — if so, re-check the on-phone prompt).
5. Run `./scripts/run_mobile.sh android`. It auto-detects this is a
   physical device (not `emulator-*`) and wires in your LAN IP.

No USB cable available? You can also connect over wifi with `adb pair`
(Android 11+) — see Android's
[wireless debugging docs](https://developer.android.com/studio/run/device)
— then the same script works unchanged.

### Connecting a real iPhone (when you get to it)

1. Plug the iPhone into your Mac, open Xcode once, and trust the computer
   on the phone when prompted.
2. In Xcode → Settings → Accounts, sign in with your Apple ID (free
   personal team is fine for local device testing).
3. Open `mobile/ios/Runner.xcworkspace` in Xcode, select your phone as the
   run destination, and set the signing team under Runner → Signing &
   Capabilities.
4. Run `./scripts/run_mobile.sh ios` — same auto-detection applies.

---

## 7. Demo Mode

Every fresh `python -m app.db.seed` run (which `scripts/dev.sh` does for
you) creates:

- **~150 listings** across 12 categories (Food, Shopping, Grocery,
  Fashion, Beauty, Electronics, Travel, Hotels, Movies, Vehicles, Gaming,
  Gifts), each with a real-sounding fictional brand and product name (no
  "Product 1" placeholders) — e.g. "Zwigato Hyderabadi Biryani Tub",
  "TechBazaar Noise Cancelling Headphones".
- **A demo guest user** (`X-Device-Id: demo-device-001`) with:
  - 3 goals (Goa Trip, New Phone, Emergency Fund) at realistic targets,
    each with real progress from genuine `GoalContribution` rows.
  - A 10-day consecutive save streak (`current_streak_days` =
    `longest_streak_days` = 10).
  - ~₹15,000 in total self-reported savings, spread believably across 4
    categories.

Your own app install always gets its own fresh, empty guest identity
(`mobile/lib/core/network/device_id.dart` generates and persists a random
UUID on first launch) — that's intentional, real beta testers should see
zero state, not someone else's demo data. To inspect what a populated
account looks like server-side, `curl` the API directly with
`-H "X-Device-Id: demo-device-001"` instead of going through the app.

Turn it off for staging/production by setting `SPENDZERO_SEED_DEMO_USER=false`
(already the default in `.env.staging.example` / `.env.production.example`).

---

## 8. Development modes (dev / staging / production)

**Backend** — set `SPENDZERO_ENV` before starting uvicorn:

```bash
SPENDZERO_ENV=development uvicorn app.main:app --reload   # default if unset
SPENDZERO_ENV=staging uvicorn app.main:app
SPENDZERO_ENV=production uvicorn app.main:app
```

This picks `.env.<name>` (falling back to `.env` for anything not
overridden). Copy `backend/.env.staging.example` → `.env.staging` and
`backend/.env.production.example` → `.env.production`, fill in real
DB/Redis URLs and `SPENDZERO_CORS_ORIGINS`, and never commit the filled-in
versions (`.gitignore` already excludes them).

**Mobile** — `mobile/env/{development,staging,production}.json` carry
`ENV_NAME` and `API_BASE_URL` per environment:

```bash
flutter run --dart-define-from-file=env/development.json
flutter run --dart-define-from-file=env/staging.json
flutter build apk --release --dart-define-from-file=env/production.json
```

`Env.isProduction` / `Env.isStaging` / `Env.isDevelopment` (in
`lib/core/config/env.dart`) are available anywhere in the app if behavior
needs to branch by environment (e.g. disabling verbose logging in prod).

---

## 9. Building release artifacts

```bash
# Release APK — install directly on a phone, or for Play "internal testing" sideload checks
./scripts/build_release.sh apk production
# -> mobile/build/app/outputs/flutter-apk/app-release.apk

# Android App Bundle — required for Google Play (Internal/Closed testing, production)
./scripts/build_release.sh appbundle production
# -> mobile/build/app/outputs/bundle/release/app-release.aab

# iOS archive (macOS + Xcode only) — feeds TestFlight
./scripts/build_release.sh ios-archive production
# -> mobile/build/ios/archive/Runner.xcarchive
```

Or via `make`: `make apk ENV=production`, `make aab ENV=production`,
`make ios-archive ENV=production`.

### Installing the APK on your phone

```bash
adb install mobile/build/app/outputs/flutter-apk/app-release.apk
```

(Or copy the `.apk` file to the phone and open it — you'll need to allow
"install unknown apps" for whichever app you copied it through.)

### Generating an iOS Archive / TestFlight build

1. `./scripts/build_release.sh ios-archive production`, **or** in Xcode:
   Product → Archive (after opening `mobile/ios/Runner.xcworkspace`).
2. Window → Organizer → select the archive → "Distribute App" →
   App Store Connect → Upload.
3. In App Store Connect, add the build to a TestFlight group once
   processing finishes.

You'll need an Apple Developer Program membership ($99/yr) for TestFlight
distribution — a free personal team is enough for local device testing
only (step 6 above).

---

## 10. Troubleshooting

| Symptom | Fix |
|---|---|
| `flutter run` hangs on "Waiting for connection" | Re-check `adb devices` / `flutter devices`; re-plug USB; re-accept the debugging prompt on the phone. |
| App loads but every screen shows a network error | Phone and dev machine aren't on the same wifi, or a firewall is blocking port 8000. Try `curl http://<LAN IP>:8000/api/v1/health` from another device on the same network. |
| `docker compose up` fails with port already in use | Something else is using 5432/6379 locally. Stop it, or change the published port in `docker-compose.yml` (and update `backend/.env.development` to match). |
| `alembic upgrade head` fails with a connection error | Postgres isn't healthy yet — `docker compose ps` should show `healthy`; wait a few more seconds and retry. |
| Backend returns CORS errors in a browser-based test | Check `SPENDZERO_CORS_ORIGINS` in your active `.env.*` file — `*` (the dev default) allows everything; tighten for staging/prod and make sure your origin is listed. |
| `adb: command not found` | Add Android SDK's `platform-tools/` directory to your `PATH` (Android Studio installs it under `~/Library/Android/sdk/platform-tools` on macOS, `~/Android/Sdk/platform-tools` on Linux). |
| iOS build fails with a signing error | Open the project in Xcode once, select your phone/team under Runner → Signing & Capabilities, and let Xcode auto-manage signing. |
| Demo user data doesn't show up | Make sure you're sending `X-Device-Id: demo-device-001` — your own app install gets a fresh random device id by default and starts empty (by design, for real beta testers). |
| `flutter create` step fails / platform dirs missing | Re-run `./scripts/setup_mobile_platforms.sh` — it's idempotent. Make sure `flutter doctor` is clean first. |

---

## 11. Beta-testing readiness checklist

- [x] Backend, DB, Redis, and seed data start with a single command
      (`./scripts/dev.sh`), no manual config editing.
- [x] Mobile app connects automatically to the right backend URL for
      emulator, simulator, and physical device — no hardcoded localhost.
- [x] Dev/staging/production are fully separated configs on both backend
      (`.env.*`) and mobile (`env/*.json`) sides.
- [x] No secrets/URLs/keys are hardcoded in source — everything routes
      through `Settings` (backend) or `Env` (mobile).
- [x] Demo data makes a fresh install feel alive (catalog + a populated
      demo account) without requiring manual setup.
- [x] Release APK / AAB / iOS archive all buildable via one script each.
- [ ] Mobile platform folders scaffolded on *your* machine — run
      `./scripts/setup_mobile_platforms.sh` once (can't be pre-generated
      in this repo; it's machine/SDK-specific).
- [ ] Signing keys for Play Console (`upload-keystore.jks`) and an Apple
      Developer account for TestFlight — both still need to be created by
      you when you're ready for closed/internal testing; nothing in the
      architecture blocks this.

Once the two unchecked items are done on your machine, the project is
ready for Android Internal Testing, Google Play Closed Testing, and Apple
TestFlight with no further architectural changes.
