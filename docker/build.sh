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

echo "[build] Building Next.js application..."
npm run build

echo "[build] Building Docker image..."
docker compose build nextjs

echo "[build] Done. Run ./docker/start.sh or ./docker/prod.sh to launch."
