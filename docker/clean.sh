#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo "[clean] Stopping services and removing volumes..."
docker compose down -v

echo "[clean] Removing .next build output..."
rm -rf .next

echo "[clean] Done. Run ./docker/prod.sh to rebuild from scratch."
