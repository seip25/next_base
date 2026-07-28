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

DB_USER="${DB_USER:-next_base}"
DB_PASSWORD="${DB_PASSWORD:-next_base}"
DB_NAME="${DB_NAME:-next_base}"

echo "[mysql] Connecting to MySQL shell in container..."
docker compose exec -it mysql mysql -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}"
