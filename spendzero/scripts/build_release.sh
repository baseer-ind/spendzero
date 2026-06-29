#!/usr/bin/env bash
# Builds release artifacts for distribution (Play internal testing / Closed
# testing, TestFlight, or direct APK install).
#
# Usage:
#   ./scripts/build_release.sh apk [development|staging|production]
#   ./scripts/build_release.sh appbundle [development|staging|production]
#   ./scripts/build_release.sh ios-archive [development|staging|production]   # macOS + Xcode only
#
# Defaults to the "production" env config if none given.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

TARGET="${1:-}"
ENV_NAME="${2:-production}"

if [ -z "$TARGET" ]; then
  echo "Usage: $0 [apk|appbundle|ios-archive] [development|staging|production]" >&2
  exit 1
fi

if [ ! -f "mobile/env/${ENV_NAME}.json" ]; then
  echo "Unknown env '$ENV_NAME' — expected one of: development, staging, production." >&2
  exit 1
fi

cd mobile

case "$TARGET" in
  apk)
    flutter build apk --release --dart-define-from-file="env/${ENV_NAME}.json"
    echo "APK: mobile/build/app/outputs/flutter-apk/app-release.apk"
    ;;
  appbundle)
    flutter build appbundle --release --dart-define-from-file="env/${ENV_NAME}.json"
    echo "AAB: mobile/build/app/outputs/bundle/release/app-release.aab"
    ;;
  ios-archive)
    flutter build ipa --release --dart-define-from-file="env/${ENV_NAME}.json"
    echo "Archive: mobile/build/ios/archive/Runner.xcarchive"
    echo "IPA (if exported): mobile/build/ios/ipa/"
    ;;
  *)
    echo "Unknown target '$TARGET' — expected apk, appbundle, or ios-archive." >&2
    exit 1
    ;;
esac
