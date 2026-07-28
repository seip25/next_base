#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

APP_NAME="${APP_NAME:-next_base}"

echo "[prune] Removing stopped containers, unused networks, and dangling images..."
docker system prune -f

echo "[prune] Removing project images..."
docker rmi "${APP_NAME}_nextjs" 2>/dev/null || true

echo "[prune] Done."
