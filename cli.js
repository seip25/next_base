#!/usr/bin/env node

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT_DIR = __dirname;
const ENV_FILE = path.join(ROOT_DIR, ".env");

const envConfig = {};
if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, "");
      envConfig[key] = value;
      process.env[key] = value;
    }
  });
}

const APP_NAME = process.env.APP_NAME || "next_base";

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};

function log(color, msg) {
  console.log(`${colors[color] || ""}${msg}${colors.reset}`);
}

function runCommand(command, args = [], options = {}) {
  if (typeof args === "object" && !Array.isArray(args)) {
    options = args;
    args = [];
  }
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    ...options,
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

function updateEnv(key, value) {
  let envContent = "";
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, "utf-8");
  }

  const regex = new RegExp(`^${key}=.*`, "m");
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }

  fs.writeFileSync(ENV_FILE, envContent.trim() + "\n");
}

const commands = {
  dev: () => {
    log("green", "[dev] Starting MySQL and Redis via Docker Compose...");
    runCommand("docker compose up -d mysql redis");
    log("green", "[dev] Waiting for services to be healthy...");
    runCommand("sleep 3");
    log("green", "[dev] Starting Next.js in development mode...");
    runCommand("npm run dev");
  },
  build: () => {
    log("green", "[build] Building Next.js application...");
    runCommand("npm run build");
    log("green", "[build] Building Docker image...");
    runCommand("docker compose build nextjs");
    log(
      "green",
      "[build] Done. Run node cli.js start or node cli.js prod to launch.",
    );
  },
  start: () => {
    log(
      "green",
      "[start] Starting all services (Nginx, MySQL, Redis, Next.js + PM2)...",
    );
    runCommand("docker compose up -d");
    log(
      "green",
      `[start] App: http://localhost:${process.env.NGINX_PORT || 80}`,
    );
    log(
      "green",
      `[start] Next.js direct: http://localhost:${process.env.NEXTJS_PORT || 3000}`,
    );
    log("green", "[start] Logs: docker compose logs -f");
  },
  prod: () => {
    log("green", "[prod] Building Docker image (includes next build)...");
    runCommand("docker compose build nextjs");
    log(
      "green",
      "[prod] Starting all services (Nginx, MySQL, Redis, Next.js + PM2)...",
    );
    runCommand("docker compose up -d");
    log("green", "[prod] Production stack running.");
    log(
      "green",
      `[prod] App: http://localhost:${process.env.NGINX_PORT || 80}`,
    );
    log(
      "green",
      `[prod] Next.js direct: http://localhost:${process.env.NEXTJS_PORT || 3000}`,
    );
    log("green", "[prod] Logs: docker compose logs -f");
  },
  stop: () => {
    log("green", "[stop] Stopping all Docker services...");
    runCommand("docker compose down");
  },
  clean: () => {
    log("green", "[clean] Stopping services and removing volumes...");
    runCommand("docker compose down -v");
    log("green", "[clean] Removing .next build output...");
    runCommand("rm -rf .next");
  },
  prune: () => {
    log(
      "green",
      "[prune] Removing stopped containers, unused networks, and dangling images...",
    );
    runCommand("docker system prune -f");
    log("green", "[prune] Removing project images...");
    runCommand(`docker rmi "${APP_NAME}_nextjs" 2>/dev/null || true`);
  },
  logs: () => {
    runCommand("docker compose logs -f");
  },
  ps: () => {
    runCommand("docker compose ps");
  },
  mysql: () => {
    const dbUser = process.env.DB_USER || "next_base";
    const dbPass = process.env.DB_PASSWORD || "next_base";
    const dbName = process.env.DB_NAME || "next_base";
    log("green", "[mysql] Connecting to MySQL shell in container...");
    runCommand(
      `docker compose exec -it mysql mysql -u"${dbUser}" -p"${dbPass}" "${dbName}"`,
    );
  },
  "cli:db": () => commands.mysql(),
  redis: () => {
    log("green", "[redis] Connecting to redis-cli in container...");
    const redisPass = process.env.REDIS_PASSWORD;
    if (redisPass) {
      runCommand(`docker compose exec -it redis redis-cli -a "${redisPass}"`);
    } else {
      runCommand(`docker compose exec -it redis redis-cli`);
    }
  },
  "cli:redis": () => commands.redis(),
  "gen:jwt": () => {
    const secret = generateSecret(32);
    updateEnv("JWT_SECRET", secret);
    log("green", "[gen:jwt] JWT_SECRET updated in .env");
    log("yellow", `  ${secret}`);
  },
  "gen:redis": () => {
    const password = generateSecret(12);
    updateEnv("REDIS_PASSWORD", password);
    log("green", "[gen:redis] REDIS_PASSWORD updated in .env");
    log("yellow", `  ${password}`);
  },
  "gen:db": () => {
    const dbPass = generateSecret(12);
    const rootPass = generateSecret(12);
    updateEnv("DB_PASSWORD", dbPass);
    updateEnv("DB_ROOT_PASSWORD", rootPass);
    log("green", "[gen:db] DB_PASSWORD and DB_ROOT_PASSWORD updated in .env");
    log("yellow", `  DB_PASSWORD:      ${dbPass}`);
    log("yellow", `  DB_ROOT_PASSWORD: ${rootPass}`);
  },
  "gen:all": () => {
    commands["gen:jwt"]();
    commands["gen:redis"]();
    commands["gen:db"]();
    log("green", "[gen:all] All secrets generated and saved to .env");
  },
  "install:db": () => runCommand("npm i mysql2"),
  "install:cache": () => runCommand("npm i redis"),
  "install:auth": () => runCommand("npm i jose"),
  "install:bcrypt": () => runCommand("npm i bcryptjs"),
  "install:upload": () => runCommand("npm i multer"),
  "install:all": () => runCommand("npm i mysql2 redis jose bcryptjs multer"),
  help: () => {
    log("cyan", `\n${colors.bold}${APP_NAME} CLI`);
    console.log(`\n${colors.bold}Usage:${colors.reset} node cli.js <command>`);
    console.log(`\n${colors.bold}Docker commands:${colors.reset}`);
    log(
      "green",
      "  dev       Start MySQL + Redis in Docker, run Next.js locally (npm run dev)",
    );
    log("green", "  build     Build Next.js and Docker image");
    log("green", "  start     Start all services (requires built image)");
    log("green", "  prod      Build and start all services in production mode");
    log("green", "  stop      Stop all Docker services");
    log("green", "  clean     Stop services, remove volumes and .next output");
    log(
      "green",
      "  prune     Remove unused Docker resources and project images",
    );
    log("green", "  logs      Follow Docker Compose logs");
    log("green", "  ps        Show running containers");
    console.log(`\n${colors.bold}Interactive CLI shells:${colors.reset}`);
    log("green", "  mysql | cli:db    Connect to MySQL shell inside container");
    log(
      "green",
      "  redis | cli:redis Connect to redis-cli shell inside container",
    );
    console.log(`\n${colors.bold}Secret generators:${colors.reset}`);
    log("green", "  gen:jwt   Generate a random JWT_SECRET and update .env");
    log(
      "green",
      "  gen:redis Generate a random REDIS_PASSWORD and update .env",
    );
    log(
      "green",
      "  gen:db    Generate random DB_PASSWORD + DB_ROOT_PASSWORD and update .env",
    );
    log("green", "  gen:all   Generate all secrets at once");
    console.log(
      `\n${colors.bold}Install optional dependencies:${colors.reset}`,
    );
    log("green", "  install:db     npm i mysql2");
    log("green", "  install:cache  npm i redis");
    log("green", "  install:auth   npm i jose");
    log("green", "  install:bcrypt npm i bcryptjs");
    log("green", "  install:upload npm i multer");
    log("green", "  install:all    npm i mysql2 redis jose bcryptjs multer\n");
  },
};

const cmd = process.argv[2] || "help";

if (["help", "--help", "-h"].includes(cmd)) {
  commands.help();
} else if (commands[cmd]) {
  commands[cmd]();
} else {
  log("red", `Unknown command: ${cmd}\n`);
  commands.help();
  process.exit(1);
}
