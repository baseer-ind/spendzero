#!/usr/bin/env bash
# Shared helpers sourced by the other scripts/*.sh files.

# Prints this machine's LAN IP (the address a phone on the same wifi can
# reach). Tries the common cross-platform options in order; falls back to
# empty string if none work, so callers must handle that case.
lan_ip() {
  if command -v ipconfig >/dev/null 2>&1 && ipconfig getifaddr en0 >/dev/null 2>&1; then
    ipconfig getifaddr en0 2>/dev/null
  elif command -v ipconfig >/dev/null 2>&1 && ipconfig getifaddr en1 >/dev/null 2>&1; then
    ipconfig getifaddr en1 2>/dev/null
  elif command -v hostname >/dev/null 2>&1 && hostname -I >/dev/null 2>&1; then
    hostname -I 2>/dev/null | awk '{print $1}'
  elif command -v ip >/dev/null 2>&1; then
    ip route get 1 2>/dev/null | awk '{print $7; exit}'
  fi
}

repo_root() {
  cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd
}
