#!/usr/bin/env bash
# Stops the background backend process started by scripts/dev.sh and brings
# down the docker-compose Postgres/Redis containers.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [ -f ".run/backend.pid" ]; then
  PID=$(cat .run/backend.pid)
  if kill -0 "$PID" >/dev/null 2>&1; then
    kill "$PID"
    echo "Stopped backend (pid $PID)."
  fi
  rm -f .run/backend.pid
fi

docker compose down
echo "Stopped Postgres + Redis."
