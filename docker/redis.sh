#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo "[redis] Connecting to redis-cli in container..."

if [ -n "${REDIS_PASSWORD:-}" ]; then
  docker compose exec -it redis redis-cli -a "${REDIS_PASSWORD}"
else
  docker compose exec -it redis redis-cli
fi
