# Release Readiness — App Store Prep, Performance, First Beta

Companion to `docs/21-bug-bash.md`. Covers Founder QA Mode phases 4
(App Store Readiness), 5 (Performance Review), and 7 (First Beta).

## 1. App Store / Play Store readiness checklist

| Item | Status | Notes |
|---|---|---|
| App icon (adaptive + all sizes) | ⬜ | Not generated — `mobile/android`/`mobile/ios` aren't scaffolded in this repo (machine-specific, via `scripts/setup_mobile_platforms.sh`); default Flutter icon ships until a real icon asset + `flutter_launcher_icons` (or manual per-size export) is run. |
| Native splash screen | ⬜ | Currently only an in-Dart `SplashScreen` widget (900ms, shows after the OS's default white/blank launch screen). No native `flutter_native_splash` config yet — first paint will show a blank screen on slower devices. |
| Permissions | ✅ | Only `android.permission.INTERNET` is added (by `setup_mobile_platforms.sh`); no camera/location/storage requested anywhere in the app — nothing to disclose beyond network access. |
| Privacy policy / data disclosures | ⬜ | No privacy policy exists yet. Required by both stores. App's actual data footprint is small and worth disclosing precisely: a random per-install device UUID (no PII), goal titles/targets, and self-reported "I Saved It" events — no real payment data is ever collected since checkout is fully simulated. |
| In-app legal disclaimer | ⬜ | Nothing in the UI currently states "this is a savings simulator — no real purchases or payments occur." Given the app shows realistic prices/brands/checkout flow, a first-launch or persistent disclaimer is worth adding before public beta, to avoid any confusion with a real shopping app. |
| Store listing metadata (title, short/long description, category) | ⬜ | Not drafted. |
| Screenshots | ⬜ | Can't be captured from this sandbox (no Flutter/device). Needs to be done on a real device/simulator per `docs/20-running-locally.md`. |
| Release signing (Play upload keystore) | ⬜ | Already flagged in `docs/20-running-locally.md` — credential/account step, not code. |
| Apple Developer account / TestFlight | ⬜ | Same — account step. |
| Crash handling | ⬜ | No crash reporter wired up (no Sentry/Crashlytics/Firebase Crashlytics dependency anywhere in `mobile/pubspec.yaml`). Unhandled exceptions currently just hit Flutter's default red-screen-of-death in debug, or silently fail in release. |
| Offline behavior | 🚧 | Network calls fail gracefully into each screen's existing error state (retry buttons on Home/Goals/Checkout) — there's no app-wide "you're offline" banner, but no screen crashes or hangs indefinitely either. Acceptable for a first beta, not ideal. |
| Slow-network behavior | 🚧 | All async calls show a spinner (`CircularProgressIndicator`) while in flight; no per-request timeout is configured on the http client, so a hung connection could spin indefinitely rather than erroring out. Worth a follow-up: add a request timeout (e.g. 10s) to `api_client.dart` so slow networks degrade to the existing error state instead of hanging. |

## 2. Performance review

No Flutter SDK is available in this sandbox (confirmed: `flutter` not on
`PATH`, and `mobile/android`/`mobile/ios` were never scaffolded here), so
none of cold-start time, memory usage, frame timing, or battery usage can
be *measured* from this session. What was reviewed by reading the code:

- **Network requests**: every screen uses Riverpod `FutureProvider`s with
  `.when()` — no duplicate/redundant fetches spotted; cart saves and
  search are both debounced (500ms / 300ms) so typing/quantity-tapping
  doesn't spam the API.
- **Image loading**: there are no real images anywhere yet — `ProductCard`
  uses a procedurally-colored placeholder box (`_Thumbnail`), so there's
  currently no image-loading cost to optimize. This will become a real
  performance area once real listing images are added — worth revisiting
  then (caching, `cached_network_image`, lazy loading in long lists).
- **List rendering**: `ListView.separated`/`GridView.builder` are used
  correctly (builder pattern, not building all items eagerly).
- **Database queries (backend)**: listings search already uses a trigram
  index (per engineering status doc) for `ilike` search; stats/streak
  computation is a single read per request, not N+1.
- **Bundle size**: no heavy dependencies in `pubspec.yaml` beyond
  `flutter_riverpod`, `go_router`, `http`, `shared_preferences`, `uuid` —
  all lightweight. Nothing to trim.

No code changes made under this phase — nothing measured points to an
actual bottleneck yet; revisit once the app can be run on a device or in
CI with Flutter installed.

## 3. First Beta package

**Known limitations** (be upfront with testers):
- No real account system — guest-only, tied to one device's local storage
  (uninstalling the app or clearing app data loses all progress).
- No way to edit, delete, or archive a goal yet.
- Cart item customization (size/variant) isn't implemented.
- No crash reporting or analytics — bugs found by testers must be
  reported manually (see feedback plan below) since we have no automatic
  visibility into crashes or usage in the field yet.
- Indian Rupee formatting was just fixed (see Bug Bash #2) — testers
  should specifically check any large goal/amount displays.

**Feedback collection plan**: until a crash reporter / analytics SDK is
integrated, route beta feedback through a single shared channel (e.g. a
WhatsApp group or a Google Form) and ask testers to include: device
model, OS version, what screen, what they expected vs. what happened.
Cross-reference incoming reports against `docs/21-bug-bash.md` and append
new rows rather than starting parallel issue lists.

**Crash reporting setup**: not yet implemented. Before a wider beta,
add either Firebase Crashlytics or Sentry's Flutter SDK — both need an
account/project created outside this repo, so this is flagged as a
prerequisite rather than done here.

**Analytics verification**: backend analytics event ingestion is still
⬜ per `docs/19-engineering-status.md` — there is no usage analytics at
all yet (not even basic screen-view counts). Fine for a small/trusted
first beta group where direct feedback substitutes for telemetry; should
be prioritized before a public beta.

**Release notes (v0.1 beta)**:
- Browse 12 fictional categories, build a cart, "checkout" with zero real
  money ever moving.
- Every checkout ends in "Craving Completed" — log whether you saved the
  money or spent it anyway, optionally allocating the save toward a
  dream/goal.
- Daily streaks, goal progress bars, and milestone celebrations.
- Known gaps: no account system yet (guest-only), no goal editing, no
  cart customization — see "Known limitations" above.

## 4. "Share the installable app" — current constraint

This session runs in a container with no Flutter SDK and no scaffolded
`mobile/android`/`mobile/ios` directories (by design — they're
machine-specific build output, generated via `flutter create`, never
checked into the repo). That means an APK cannot be produced or
transmitted directly from here.

The fastest path on your own machine, using tooling already built and
documented in `docs/20-running-locally.md`:

```bash
./scripts/setup_mobile_platforms.sh   # one-time, generates android/ios dirs
./scripts/build_release.sh apk development
# -> mobile/build/app/outputs/flutter-apk/app-release.apk
adb install mobile/build/app/outputs/flutter-apk/app-release.apk
```

If you'd rather skip a manual build, the repo's CI (`.github/workflows/ci.yml`)
already runs `flutter analyze`/`flutter test` on every push — it could be
extended with a job that builds and uploads a release APK as a workflow
artifact, which would let you download an installable build straight from
GitHub Actions without needing Flutter installed locally. Say the word
and that can be wired up next.

## 5. Test build — step by step (run on your own machine; Flutter/SDKs are not present in this sandbox)

Every command below was reviewed against the actual scripts in this repo
(`scripts/build_release.sh`, `scripts/setup_mobile_platforms.sh`,
`scripts/run_mobile.sh`). **None of these could be executed in this
session** — there is no Flutter SDK and no `mobile/android`/`mobile/ios`
directory here (confirmed via `which flutter` → not found, and the repo
genuinely doesn't check those folders in). Anything marked ✅ below was
verified by reading the script logic; nothing here was verified by
actually running a build, and that distinction is called out explicitly
per item.

**One-time setup** (do this first, regardless of which build you want):
```bash
./scripts/setup_mobile_platforms.sh
```
Generates `mobile/android` and `mobile/ios` via `flutter create`, sets
`applicationId` to `com.spendzero.app`, app name, `minSdkVersion 23`, the
`INTERNET` permission, and the iOS bundle display name. ✅ Script logic
reviewed; not run in this sandbox (no Flutter SDK).

### 1. Debug APK (fastest way to get something on your phone)
```bash
./scripts/build_release.sh debug development
adb install mobile/build/app/outputs/flutter-apk/app-debug.apk
```
Debug builds skip code shrinking/signing optimizations, so this is the
quickest path — use it first to confirm everything installs and runs.
Defaults to the `development` env config (so it points at your LAN
backend, not a staging/production URL) unless you pass a different
second argument. ✅ Added in this pass (`debug` was missing from
`build_release.sh` before now) — logic reviewed, not run (no SDK here).

### 2. Release APK
```bash
./scripts/build_release.sh apk production
# -> mobile/build/app/outputs/flutter-apk/app-release.apk
```
Use `development`/`staging` instead of `production` as the second
argument to point the release build at a different backend. Release
builds require a signing config for a real Play Store upload, but an
*unsigned* (debug-keystore-signed) release APK still installs fine via
`adb install` for direct device testing. ✅ Script logic reviewed; not
run here.

### 3. Android App Bundle (.aab) — required for Play Console
```bash
./scripts/build_release.sh appbundle production
# -> mobile/build/app/outputs/bundle/release/app-release.aab
```
This is the format Play Console requires for any track (Internal,
Closed, or Production) — it cannot be sideloaded directly with `adb
install`; it's only for upload. ✅ Script logic reviewed; not run here.

### 4. Installing on a physical Android device
```bash
adb devices                 # confirm your phone shows as "device", not "unauthorized"
adb install <path-to-apk>   # works for both debug and release APKs
```
If `adb install` fails with `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, you have
a previous install signed with a different key — uninstall first
(`adb uninstall com.spendzero.app`) then reinstall. USB debugging setup
steps are in `docs/20-running-locally.md` §6. ✅ Standard `adb` behavior;
not run here (no device attached to this sandbox).

### 5. Running on an iPhone via Xcode
```bash
cd mobile
flutter run -d <device-id> --dart-define-from-file=env/development.json
```
Prerequisites: open `mobile/ios/Runner.xcworkspace` in Xcode once, sign
in with an Apple ID under Xcode → Settings → Accounts (a free personal
team is enough for local device testing, not TestFlight), then under
Runner → Signing & Capabilities pick that team and let Xcode auto-manage
signing. Trust the computer on the phone when prompted on first connect.
`flutter devices` lists the `<device-id>` once the phone's detected. For
a real TestFlight build use `./scripts/build_release.sh ios-archive
production` instead — see `docs/20-running-locally.md` §6 and §9 for the
Archive → Organizer → App Store Connect upload steps. ✅ Steps reviewed
against Flutter/Xcode's documented workflow; not run here (no macOS/Xcode
in this sandbox at all, only the Android tooling is even theoretically
runnable here, and isn't, due to no Flutter SDK).

### 6. Checklist — what's still preventing a real beta release

| Item | Status | Why |
|---|---|---|
| `mobile/android` / `mobile/ios` scaffolded | ⬜ | Must be run once on your machine — `./scripts/setup_mobile_platforms.sh` |
| Flutter SDK installed (your machine) | ⬜ — cannot verify from here | This sandbox has none; your machine's status is unknown to me |
| Debug APK builds and installs | ⬜ — cannot verify from here | No SDK in this sandbox; logic reviewed, not executed |
| Release APK/AAB builds | ⬜ — cannot verify from here | Same constraint |
| Play Console upload keystore | ⬜ | Account/credential step, not code — see `docs/20-running-locally.md` §9 |
| Apple Developer Program membership | ⬜ | Same — needed for TestFlight, not for local device testing |
| App icon / native splash screen | ⬜ | Default Flutter assets still in place |
| Store screenshots / description | ⬜ | Needs a real device/simulator to capture |
| Privacy policy / in-app disclaimer | ⬜ | Not drafted yet — see §1 above |
| Crash reporting SDK | ⬜ | Placeholder hook added in `main.dart`; no real SDK account yet |

Everything in this checklist is either a one-time local/account setup
step or an asset-creation step — there are no remaining *architectural*
blockers on the code side for a first small beta.
