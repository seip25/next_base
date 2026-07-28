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

echo "[dev] Starting MySQL and Redis via Docker Compose..."
docker compose up -d mysql redis

echo "[dev] Waiting for services to be healthy..."
sleep 3

echo "[dev] Starting Next.js in development mode..."
npm run dev
