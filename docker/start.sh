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

echo "[start] Starting all services (Nginx, MySQL, Redis, Next.js + PM2)..."
docker compose up -d

echo "[start] Services started."
echo "[start] App: http://localhost:${NGINX_PORT:-80}"
echo "[start] Next.js direct: http://localhost:${NEXTJS_PORT:-3000}"
echo "[start] Logs: docker compose logs -f"
