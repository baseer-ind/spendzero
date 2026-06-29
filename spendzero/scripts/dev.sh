#!/usr/bin/env bash
# One-command local dev stack: Postgres + Redis (docker compose) -> migrate
# -> seed -> backend (uvicorn --reload, bound to 0.0.0.0 so a phone on the
# same wifi can reach it) -> health check -> Flutter.
#
# Usage:
#   ./scripts/dev.sh                 # backend stack + print mobile instructions
#   ./scripts/dev.sh --android       # also launch `flutter run` on a connected Android device/emulator
#   ./scripts/dev.sh --ios           # also launch `flutter run` on a connected iOS simulator/device
#   ./scripts/dev.sh --no-backend    # skip infra/backend, just run flutter (assumes backend already running)
#
# Stop everything with: ./scripts/stop.sh
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/lib.sh

RUN_DIR=".run"
mkdir -p "$RUN_DIR"

MOBILE_TARGET="none"
START_BACKEND=1
for arg in "$@"; do
  case "$arg" in
    --android) MOBILE_TARGET="android" ;;
    --ios) MOBILE_TARGET="ios" ;;
    --no-backend) START_BACKEND=0 ;;
    *) echo "Unknown flag: $arg" >&2; exit 1 ;;
  esac
done

if [ "$START_BACKEND" = "1" ]; then
  echo "==> Starting Postgres + Redis (docker compose)..."
  docker compose up -d db redis

  echo "==> Waiting for Postgres + Redis to report healthy..."
  for i in $(seq 1 30); do
    PG_OK=$(docker compose ps db --format '{{.Health}}' 2>/dev/null || true)
    REDIS_OK=$(docker compose ps redis --format '{{.Health}}' 2>/dev/null || true)
    if [ "$PG_OK" = "healthy" ] && [ "$REDIS_OK" = "healthy" ]; then
      break
    fi
    sleep 1
    if [ "$i" = "30" ]; then
      echo "Postgres/Redis did not become healthy in time. Run 'docker compose logs db redis' to debug." >&2
      exit 1
    fi
  done
  echo "    Postgres + Redis are healthy."

  echo "==> Installing backend dependencies (venv)..."
  cd backend
  if [ ! -d ".venv" ]; then
    python3 -m venv .venv
  fi
  source .venv/bin/activate
  pip install -q -r requirements-dev.txt

  if [ ! -f ".env" ] && [ ! -f ".env.development" ]; then
    cp .env.example .env.development
    echo "    Created backend/.env.development from .env.example."
  fi

  echo "==> Running database migrations..."
  alembic upgrade head

  echo "==> Seeding fictional categories/brands/listings + demo user..."
  python -m app.db.seed

  echo "==> Starting backend (uvicorn --reload, 0.0.0.0:8000)..."
  nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload \
    > "../$RUN_DIR/backend.log" 2>&1 &
  echo $! > "../$RUN_DIR/backend.pid"
  cd ..

  echo "==> Waiting for backend health check..."
  for i in $(seq 1 30); do
    if curl -fsS "http://localhost:8000/api/v1/health" >/dev/null 2>&1; then
      echo "    Backend is healthy: http://localhost:8000/api/v1/health"
      break
    fi
    sleep 1
    if [ "$i" = "30" ]; then
      echo "Backend did not become healthy in time. Check $RUN_DIR/backend.log." >&2
      exit 1
    fi
  done
fi

IP=$(lan_ip || true)
echo ""
echo "==================================================================="
echo " Backend running at:"
echo "   - This machine:        http://localhost:8000/api/v1"
echo "   - Android emulator:    http://10.0.2.2:8000/api/v1 (automatic)"
echo "   - iOS simulator:       http://localhost:8000/api/v1 (automatic)"
if [ -n "$IP" ]; then
  echo "   - Physical phone (LAN): http://$IP:8000/api/v1"
else
  echo "   - Physical phone (LAN): could not auto-detect — run 'scripts/lan_ip.sh'"
fi
echo "==================================================================="
echo ""

case "$MOBILE_TARGET" in
  android) exec ./scripts/run_mobile.sh android ;;
  ios) exec ./scripts/run_mobile.sh ios ;;
  none)
    echo "Backend is running in the background (logs: $RUN_DIR/backend.log, pid: $RUN_DIR/backend.pid)."
    echo "Next: run './scripts/run_mobile.sh android' or './scripts/run_mobile.sh ios' to launch the app."
    echo "Stop the backend stack with: ./scripts/stop.sh"
    ;;
esac
