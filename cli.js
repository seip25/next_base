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

/**
 * @param {string[]} args
 * @returns {{ flags: Record<string, string|boolean>, positional: string[] }}
 */
function parseCliArgs(args) {
  const flags = {};
  const positional = [];
  args.forEach((arg) => {
    if (arg.startsWith("--")) {
      const parts = arg.split("=");
      const key = parts[0].replace("--", "");
      flags[key] = parts.slice(1).join("=") || true;
    } else {
      positional.push(arg);
    }
  });
  return { flags, positional };
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
  logs: (args = []) => {
    const service = args[0] ? ` ${args[0]}` : "";
    runCommand(`docker compose logs -f${service}`);
  },
  ps: () => {
    runCommand("docker compose ps");
  },
  status: () => {
    runCommand("docker compose ps -a");
  },
  mysql: (args = []) => {
    const dbUser = process.env.DB_USER || "next_base";
    const dbPass = process.env.DB_PASSWORD || "next_base";
    const dbName = process.env.DB_NAME || "next_base";
    
    if (args.length === 0) {
      log("green", "[mysql] Connecting to MySQL shell in container...");
      runCommand(
        `docker compose exec -it mysql mysql -u"${dbUser}" -p"${dbPass}" "${dbName}"`,
      );
      return;
    }

    const { flags, positional } = parseCliArgs(args);
    const subCmd = positional[0];
    const baseExec = `docker compose exec -T mysql mysql -u"${dbUser}" -p"${dbPass}" "${dbName}" -e`;

    if (subCmd === "tables") {
      runCommand(`${baseExec} "SHOW TABLES;" -t`);
    } else if (subCmd === "columns" && positional[1]) {
      runCommand(`${baseExec} "SHOW COLUMNS FROM ${positional[1]};" -t`);
    } else if (subCmd === "query" && positional[1]) {
      runCommand(`${baseExec} "${positional[1]}" -t`);
    } else if (subCmd) {
      const limit = flags.limit || 10;
      let orderClause = "";
      if (flags["order-by"]) {
        orderClause = `ORDER BY ${flags["order-by"]}`;
      }
      const query = `SELECT * FROM ${subCmd} ${orderClause} LIMIT ${limit};`;
      runCommand(`${baseExec} "${query}" -t`);
    }
  },
  "cli:db": (args) => commands.mysql(args),
  redis: (args = []) => {
    const redisPass = process.env.REDIS_PASSWORD;
    const auth = redisPass ? `-a "${redisPass}"` : "";
    
    if (args.length === 0) {
      log("green", "[redis] Connecting to redis-cli in container...");
      runCommand(`docker compose exec -it redis redis-cli ${auth}`);
      return;
    }

    const baseExec = `docker compose exec -T redis redis-cli ${auth}`;
    const subCmd = args[0];
    
    if (subCmd === "keys") {
      runCommand(`${baseExec} KEYS "${args[1] || '*'}"`);
    } else if (subCmd === "get" && args[1]) {
      runCommand(`${baseExec} GET "${args[1]}"`);
    } else if (subCmd === "del" && args[1]) {
      runCommand(`${baseExec} DEL "${args[1]}"`);
    } else if (subCmd === "flush") {
      runCommand(`${baseExec} FLUSHDB`);
    } else if (subCmd === "info") {
      runCommand(`${baseExec} INFO`);
    } else if (subCmd === "monitor") {
      runCommand(`${baseExec} MONITOR`);
    } else {
      runCommand(`${baseExec} ${args.join(" ")}`);
    }
  },
  "cli:redis": (args) => commands.redis(args),
  "db:backup": () => {
    const dbUser = process.env.DB_USER || "next_base";
    const dbPass = process.env.DB_PASSWORD || "next_base";
    const dbName = process.env.DB_NAME || "next_base";
    const date = new Date().toISOString().replace(/[:.]/g, "-");
    const file = `backup-${date}.sql`;
    log("green", `[db:backup] Creating backup ${file}...`);
    runCommand(`docker compose exec -T mysql mysqldump -u"${dbUser}" -p"${dbPass}" "${dbName}" > ${file}`);
    log("green", "[db:backup] Done.");
  },
  "db:import": (args = []) => {
    if (!args[0]) {
      log("red", "[db:import] Please provide a SQL file to import.");
      return;
    }
    const dbUser = process.env.DB_USER || "next_base";
    const dbPass = process.env.DB_PASSWORD || "next_base";
    const dbName = process.env.DB_NAME || "next_base";
    log("green", `[db:import] Importing ${args[0]}...`);
    runCommand(`docker compose exec -T mysql mysql -u"${dbUser}" -p"${dbPass}" "${dbName}" < ${args[0]}`);
    log("green", "[db:import] Done.");
  },
  "env:check": () => {
    const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "REDIS_HOST"];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      log("red", `[env:check] Missing required environment variables: ${missing.join(", ")}`);
      process.exit(1);
    }
    log("green", "[env:check] All required environment variables are present.");
  },
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
  "install:queue": () => runCommand("npm i bullmq ioredis"),
  "install:all": () => runCommand("npm i mysql2 redis jose bcryptjs multer bullmq ioredis"),
  worker: () => {
    log("green", "[worker] Starting BullMQ background worker...");
    runCommand("node jobs/index.js");
  },
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
    log("green", "  install:queue  npm i bullmq ioredis");
    log("green", "  install:all    npm i mysql2 redis jose bcryptjs multer bullmq ioredis\n");
    console.log(`\n${colors.bold}Smart Database Commands:${colors.reset}`);
    log("green", "  mysql <table> [--limit=10] [--order-by=\"id desc\"]");
    log("green", "  mysql tables | columns <table> | query \"<sql>\"");
    log("green", "  redis keys | get <key> | del <key> | flush | info | monitor");
    log("green", "  db:backup      Create a SQL dump in the current directory");
    log("green", "  db:import <f>  Import a SQL file to the database");
    log("green", "  env:check      Validate required environment variables");
    console.log(`\n${colors.bold}Background Jobs:${colors.reset}`);
    log("green", "  worker         Start the BullMQ background worker (jobs/index.js)");
  },
};

const cmd = process.argv[2] || "help";
const args = process.argv.slice(3);

if (["help", "--help", "-h"].includes(cmd)) {
  commands.help();
} else if (commands[cmd]) {
  commands[cmd](args);
} else {
  log("red", `Unknown command: ${cmd}\n`);
  commands.help();
  process.exit(1);
}
