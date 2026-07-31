#!/usr/bin/env bash
# One-time setup: scaffolds mobile/android and mobile/ios via `flutter
# create`, then patches the application id / bundle id / app name so they
# match Project Future instead of Flutter's defaults.
#
# Run this once after cloning, before scripts/run_mobile.sh or any Android
# Studio / Xcode work. Safe to re-run (flutter create is idempotent on an
# existing project and won't clobber lib/).
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if ! command -v flutter >/dev/null 2>&1; then
  echo "flutter is not on your PATH. Install Flutter first — see docs/20-running-locally.md." >&2
  exit 1
fi

APP_ID="com.projectfuture.app"

if [ -d "mobile/android" ] && [ -d "mobile/ios" ]; then
  echo "mobile/android and mobile/ios already exist — skipping flutter create."
else
  echo "==> Scaffolding Android + iOS platform folders..."
  (cd mobile && flutter create . --platforms=android,ios --org com.projectfuture --project-name app)
fi

if [ -f "mobile/android/app/build.gradle" ]; then
  echo "==> Setting Android applicationId to $APP_ID and minSdkVersion 23..."
  sed -i.bak "s/applicationId \".*\"/applicationId \"$APP_ID\"/" mobile/android/app/build.gradle
  sed -i.bak "s/minSdkVersion flutter.minSdkVersion/minSdkVersion 23/" mobile/android/app/build.gradle || true
  # Google Play requires targeting a recent API level. Pin targetSdk to 35
  # (the Play requirement since Aug 2025) instead of tracking whatever the
  # Flutter toolchain happens to default to.
  sed -i.bak "s/targetSdkVersion flutter.targetSdkVersion/targetSdkVersion 35/" mobile/android/app/build.gradle || true
  rm -f mobile/android/app/build.gradle.bak

  # ---- Release signing --------------------------------------------------
  # A Play-uploadable AAB must be signed with a real upload key, never the
  # debug key that `flutter create` wires release builds to by default.
  # This injects a signing config that reads mobile/android/key.properties
  # (which points at an upload keystore) when present, and otherwise falls
  # back to debug signing so local dev / CI-without-secrets still builds.
  #
  # key.properties + the .jks keystore are gitignored and never committed —
  # in CI they're materialized from repository secrets (see .github CI), and
  # locally you create them once (see docs). Format of key.properties:
  #   storeFile=upload-keystore.jks
  #   storePassword=...
  #   keyAlias=upload
  #   keyPassword=...
  if ! grep -q "key.properties" mobile/android/app/build.gradle; then
    echo "==> Injecting release signing config into build.gradle..."
    python3 - "mobile/android/app/build.gradle" <<'PYPATCH'
import sys, re
path = sys.argv[1]
src = open(path).read()

# 1. Load key.properties near the top (after the plugins/imports block, just
#    before the `android {` block).
loader = '''
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

'''
src = re.sub(r'(?m)^android\s*\{', loader + 'android {', src, count=1)

# 2. Add a signingConfigs.release block and point the release buildType at
#    it when the keystore exists (else keep debug signing so it still builds).
signing_block = '''    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
                storePassword keystoreProperties['storePassword']
            }
        }
    }
'''
# Insert signingConfigs right before the buildTypes block.
src = re.sub(r'(?m)^(\s*)buildTypes\s*\{', signing_block + r'\1buildTypes {', src, count=1)

# Point release buildType at the release signingConfig when available.
src = src.replace(
    'signingConfig signingConfigs.debug',
    'signingConfig keystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug',
)

open(path, 'w').write(src)
print("   signing config injected")
PYPATCH
  fi
fi

if [ -f "mobile/android/app/src/main/AndroidManifest.xml" ]; then
  sed -i.bak 's/android:label="app"/android:label="Project Future"/' mobile/android/app/src/main/AndroidManifest.xml || true
  # Release builds need this explicitly — the debug-only INTERNET permission
  # flutter_tools injects automatically does not carry over to release/profile.
  if ! grep -q 'android.permission.INTERNET' mobile/android/app/src/main/AndroidManifest.xml; then
    sed -i.bak 's/<manifest /<manifest xmlns:tools="http:\/\/schemas.android.com\/tools" /' mobile/android/app/src/main/AndroidManifest.xml
    sed -i.bak '0,/<application/s//<uses-permission android:name="android.permission.INTERNET" \/>\n    <application/' mobile/android/app/src/main/AndroidManifest.xml
  fi
  rm -f mobile/android/app/src/main/AndroidManifest.xml.bak
fi

if [ -f "mobile/ios/Runner/Info.plist" ]; then
  echo "==> Setting iOS bundle display name to Project Future..."
  /usr/libexec/PlistBuddy -c 'Set :CFBundleDisplayName Project Future' mobile/ios/Runner/Info.plist 2>/dev/null || \
    sed -i.bak 's/<key>CFBundleDisplayName<\/key>.*<string>.*<\/string>/<key>CFBundleDisplayName<\/key><string>Project Future<\/string>/' mobile/ios/Runner/Info.plist || true
  rm -f mobile/ios/Runner/Info.plist.bak
fi

echo ""
echo "Done. Application id: $APP_ID"
echo "Next: ./scripts/run_mobile.sh android   (or ios)"
