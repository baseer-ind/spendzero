#!/usr/bin/env bash
# Detects a connected device/emulator/simulator and runs the Flutter app on
# it with the correct backend base URL already wired up — no manual
# --dart-define needed for the common cases.
#
# Usage:
#   ./scripts/run_mobile.sh android   # auto-detects emulator vs physical device via adb
#   ./scripts/run_mobile.sh ios       # auto-detects simulator vs physical iPhone via flutter devices
#
# Base URL resolution:
#   - Android emulator      -> http://10.0.2.2:8000/api/v1   (env.dart default, no flag needed)
#   - iOS simulator         -> http://localhost:8000/api/v1  (env.dart default, no flag needed)
#   - Physical device (any) -> http://<this machine's LAN IP>:8000/api/v1 (auto-detected, passed via --dart-define)
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/lib.sh

PLATFORM="${1:-}"
if [ "$PLATFORM" != "android" ] && [ "$PLATFORM" != "ios" ]; then
  echo "Usage: $0 [android|ios]" >&2
  exit 1
fi

if ! command -v flutter >/dev/null 2>&1; then
  echo "flutter is not on your PATH. Install Flutter first — see docs/20-running-locally.md." >&2
  exit 1
fi

if [ ! -d "mobile/android" ] || [ ! -d "mobile/ios" ]; then
  echo "Platform folders are missing. Run ./scripts/setup_mobile_platforms.sh once first." >&2
  exit 1
fi

cd mobile

ENV_NAME="${SPENDZERO_MOBILE_ENV:-development}"
EXTRA_DEFINES=("--dart-define-from-file=env/${ENV_NAME}.json")

if [ "$PLATFORM" = "android" ]; then
  if ! command -v adb >/dev/null 2>&1; then
    echo "adb not found. Install Android platform-tools (comes with Android Studio) and ensure it's on PATH." >&2
    exit 1
  fi
  DEVICE_ID=$(adb devices | awk 'NR>1 && $2=="device" {print $1; exit}')
  if [ -z "$DEVICE_ID" ]; then
    echo "No Android device/emulator detected. Plug in a phone with USB debugging enabled (or start an emulator) and re-run." >&2
    exit 1
  fi
  echo "==> Detected Android target: $DEVICE_ID"
  if [[ "$DEVICE_ID" == emulator-* ]]; then
    echo "    (emulator — using default base URL http://10.0.2.2:8000/api/v1)"
    exec flutter run -d "$DEVICE_ID" "${EXTRA_DEFINES[@]}"
  else
    IP=$(lan_ip || true)
    if [ -z "$IP" ]; then
      echo "Could not auto-detect this machine's LAN IP. Pass it manually:" >&2
      echo "  flutter run -d $DEVICE_ID --dart-define=API_BASE_URL=http://<YOUR_LAN_IP>:8000/api/v1" >&2
      exit 1
    fi
    echo "    (physical device — make sure your phone is on the same wifi as this machine)"
    echo "    Using base URL http://$IP:8000/api/v1"
    exec flutter run -d "$DEVICE_ID" "${EXTRA_DEFINES[@]}" --dart-define="API_BASE_URL=http://$IP:8000/api/v1"
  fi
fi

if [ "$PLATFORM" = "ios" ]; then
  DEVICE_LINE=$(flutter devices | grep -i "ios" | head -1 || true)
  if [ -z "$DEVICE_LINE" ]; then
    echo "No iOS simulator/device detected. Open Simulator.app (or plug in an iPhone) and re-run." >&2
    exit 1
  fi
  DEVICE_ID=$(echo "$DEVICE_LINE" | sed -E 's/.*•\s*([^ ]+)\s*•.*/\1/')
  echo "==> Detected iOS target: $DEVICE_LINE"
  if echo "$DEVICE_LINE" | grep -qi "simulator"; then
    echo "    (simulator — using default base URL http://localhost:8000/api/v1)"
    exec flutter run -d "$DEVICE_ID" "${EXTRA_DEFINES[@]}"
  else
    IP=$(lan_ip || true)
    if [ -z "$IP" ]; then
      echo "Could not auto-detect this machine's LAN IP. Pass it manually:" >&2
      echo "  flutter run -d $DEVICE_ID --dart-define=API_BASE_URL=http://<YOUR_LAN_IP>:8000/api/v1" >&2
      exit 1
    fi
    echo "    (physical iPhone — make sure it's on the same wifi as this machine and trusted in Xcode)"
    echo "    Using base URL http://$IP:8000/api/v1"
    exec flutter run -d "$DEVICE_ID" "${EXTRA_DEFINES[@]}" --dart-define="API_BASE_URL=http://$IP:8000/api/v1"
  fi
fi
