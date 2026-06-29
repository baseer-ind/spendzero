#!/usr/bin/env bash
# Prints this machine's LAN IP — the address your phone should use to reach
# the locally running backend when testing on a physical device.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/lib.sh
IP=$(lan_ip || true)
if [ -z "$IP" ]; then
  echo "Could not auto-detect a LAN IP. Run 'ifconfig' / 'ipconfig' manually and look for your wifi adapter's inet address." >&2
  exit 1
fi
echo "$IP"
