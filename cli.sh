#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

APP_NAME="${APP_NAME:-next_base}"

print_usage() {
  echo -e "${BOLD}${CYAN}${APP_NAME} CLI${NC}"
  echo ""
  echo -e "${BOLD}Usage:${NC} ./cli.sh <command>"
  echo ""
  echo -e "${BOLD}Docker commands:${NC}"
  echo -e "  ${GREEN}dev${NC}       Start MySQL + Redis in Docker, run Next.js locally (npm run dev)"
  echo -e "  ${GREEN}build${NC}     Build Next.js and Docker image"
  echo -e "  ${GREEN}start${NC}     Start all services (requires built image)"
  echo -e "  ${GREEN}prod${NC}      Build and start all services in production mode"
  echo -e "  ${GREEN}stop${NC}      Stop all Docker services"
  echo -e "  ${GREEN}clean${NC}     Stop services, remove volumes and .next output"
  echo -e "  ${GREEN}prune${NC}     Remove unused Docker resources and project images"
  echo -e "  ${GREEN}logs${NC}      Follow Docker Compose logs"
  echo -e "  ${GREEN}ps${NC}        Show running containers"
  echo ""
  echo -e "${BOLD}Interactive CLI shells:${NC}"
  echo -e "  ${GREEN}mysql${NC} | ${GREEN}cli:db${NC}    Connect to MySQL shell inside container"
  echo -e "  ${GREEN}redis${NC} | ${GREEN}cli:redis${NC} Connect to redis-cli shell inside container"
  echo ""
  echo -e "${BOLD}Secret generators:${NC}"
  echo -e "  ${GREEN}gen:jwt${NC}   Generate a random JWT_SECRET and update .env"
  echo -e "  ${GREEN}gen:redis${NC} Generate a random REDIS_PASSWORD and update .env"
  echo -e "  ${GREEN}gen:db${NC}    Generate random DB_PASSWORD + DB_ROOT_PASSWORD and update .env"
  echo -e "  ${GREEN}gen:all${NC}   Generate all secrets at once"
  echo ""
  echo -e "${BOLD}Install optional dependencies:${NC}"
  echo -e "  ${GREEN}install:db${NC}     npm i mysql2"
  echo -e "  ${GREEN}install:cache${NC}  npm i redis"
  echo -e "  ${GREEN}install:auth${NC}   npm i jose"
  echo -e "  ${GREEN}install:bcrypt${NC} npm i bcryptjs"
  echo -e "  ${GREEN}install:upload${NC} npm i multer"
  echo -e "  ${GREEN}install:all${NC}    npm i mysql2 redis jose bcryptjs multer"
}

generate_secret() {
  node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))"
}

update_env() {
  local key="$1"
  local value="$2"

  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

cmd_gen_jwt() {
  local secret
  secret=$(generate_secret)
  update_env "JWT_SECRET" "$secret"
  echo -e "${GREEN}[gen:jwt]${NC} JWT_SECRET updated in .env"
  echo -e "  ${YELLOW}${secret}${NC}"
}

cmd_gen_redis() {
  local password
  password=$(generate_secret | cut -c1-24)
  update_env "REDIS_PASSWORD" "$password"
  echo -e "${GREEN}[gen:redis]${NC} REDIS_PASSWORD updated in .env"
  echo -e "  ${YELLOW}${password}${NC}"
}

cmd_gen_db() {
  local db_pass root_pass
  db_pass=$(generate_secret | cut -c1-24)
  root_pass=$(generate_secret | cut -c1-24)
  update_env "DB_PASSWORD" "$db_pass"
  update_env "DB_ROOT_PASSWORD" "$root_pass"
  echo -e "${GREEN}[gen:db]${NC} DB_PASSWORD and DB_ROOT_PASSWORD updated in .env"
  echo -e "  DB_PASSWORD:      ${YELLOW}${db_pass}${NC}"
  echo -e "  DB_ROOT_PASSWORD: ${YELLOW}${root_pass}${NC}"
}

cmd_gen_all() {
  cmd_gen_jwt
  cmd_gen_redis
  cmd_gen_db
  echo -e "${GREEN}[gen:all]${NC} All secrets generated and saved to .env"
}

case "${1:-help}" in
  dev)             bash "$SCRIPT_DIR/docker/dev.sh" ;;
  build)           bash "$SCRIPT_DIR/docker/build.sh" ;;
  start)           bash "$SCRIPT_DIR/docker/start.sh" ;;
  prod)            bash "$SCRIPT_DIR/docker/prod.sh" ;;
  stop)            bash "$SCRIPT_DIR/docker/stop.sh" ;;
  clean)           bash "$SCRIPT_DIR/docker/clean.sh" ;;
  prune)           bash "$SCRIPT_DIR/docker/prune.sh" ;;
  logs)            docker compose -f "$SCRIPT_DIR/docker-compose.yml" logs -f ;;
  ps)              docker compose -f "$SCRIPT_DIR/docker-compose.yml" ps ;;
  mysql|cli:db)    bash "$SCRIPT_DIR/docker/mysql.sh" ;;
  redis|cli:redis) bash "$SCRIPT_DIR/docker/redis.sh" ;;
  gen:jwt)         cmd_gen_jwt ;;
  gen:redis)       cmd_gen_redis ;;
  gen:db)          cmd_gen_db ;;
  gen:all)         cmd_gen_all ;;
  install:db)      npm i mysql2 ;;
  install:cache)   npm i redis ;;
  install:auth)    npm i jose ;;
  install:bcrypt)  npm i bcryptjs ;;
  install:upload)  npm i multer ;;
  install:all)     npm i mysql2 redis jose bcryptjs multer ;;
  help|--help|-h)  print_usage ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    echo ""
    print_usage
    exit 1
    ;;
esac
