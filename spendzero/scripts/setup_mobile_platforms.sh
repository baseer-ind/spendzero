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
  rm -f mobile/android/app/build.gradle.bak
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
