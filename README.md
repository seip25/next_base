# Next.js Production Base Template

A modern, production-ready Next.js base template configured for both lightweight static/simple applications and full-stack containerized deployments with **MySQL**, **Redis**, **Nginx**, and **PM2**.

---

## Overview & Modes of Operation

This template supports two distinct workflows depending on your application needs:

### 1. Simple Mode (No Database / Lightweight)
For simple pages, static content, or apps without external services:
```bash
npm run dev     # Starts local Next.js development server
npm run build   # Builds standalone Next.js production bundle
npm run start   # Starts Next.js production server
```

### 2. Containerized Stack (MySQL + Redis + Nginx + PM2)
For full-stack applications requiring persistence, caching, and reverse proxying:
```bash
./cli.sh dev    # Starts MySQL & Redis in Docker + Next.js locally
./cli.sh prod   # Builds & starts Nginx, MySQL, Redis, Next.js with PM2 in Docker
```

---

## Directory Structure

```
.
├── .env                  # Active environment variables
├── .env.example          # Environment variable template
├── cli.sh                # Unified management CLI
├── ecosystem.config.js   # PM2 Cluster mode configuration
├── docker-compose.yml    # Container orchestration definitions
├── docker/
│   ├── Dockerfile        # Multi-stage production container build
│   ├── nginx.conf        # Production Nginx reverse proxy & static asset server
│   ├── mysql.sh          # Interactive MySQL shell script
│   ├── redis.sh          # Interactive Redis CLI shell script
│   ├── dev.sh            # Development stack launcher
│   ├── build.sh          # Next.js & Docker build script
│   ├── start.sh          # Container stack startup script
│   ├── prod.sh           # One-shot production build & deploy script
│   ├── stop.sh           # Container stack shutdown script
│   ├── clean.sh          # Volume & build cache cleanup script
│   └── prune.sh          # Docker dangling resource pruner
├── services/
│   ├── index.js          # Main services entry point (re-exports)
│   ├── db.js             # MySQL2 pool wrapper class (Database)
│   ├── cache.js          # Redis client wrapper class (Cache)
│   ├── auth.js           # jose JWT authentication class (Auth)
│   ├── cookies.js        # Next.js server cookie helper class (Cookies)
│   ├── middleware.js     # Route protection HOF helper (AuthProxy)
│   ├── password.js       # bcryptjs hashing and comparison helper (Password)
│   └── upload.js         # File upload handler for Web API FormData & multer (Upload)
└── src/
    ├── proxy.js          # Next.js route protection proxy convention
    └── app/              # Next.js App Router pages & components
```

---

## CLI Reference (`./cli.sh`)

The root `cli.sh` script provides a unified interface for managing containers, secrets, interactive shells, and optional dependencies.

```bash
./cli.sh <command>
```

### Stack Management Commands
| Command | Description |
| :--- | :--- |
| `dev` | Launches MySQL and Redis in Docker and runs `npm run dev` on host |
| `build` | Compiles Next.js app and builds Docker image |
| `start` | Starts containerized production stack (requires built image) |
| `prod` | One-shot build and launch for production |
| `stop` | Gracefully stops all container services |
| `clean` | Stops containers, removes persistent volumes and `.next` folder |
| `prune` | Removes dangling Docker images and project build artifacts |
| `logs` | Streams live Docker Compose logs |
| `ps` | Lists running stack containers |

### Interactive Container Shells
| Command | Description |
| :--- | :--- |
| `mysql` or `cli:db` | Opens interactive MySQL shell inside container with `.env` credentials |
| `redis` or `cli:redis` | Opens interactive `redis-cli` shell inside container with `.env` password |

### Secret Generator Commands
| Command | Description |
| :--- | :--- |
| `gen:jwt` | Generates a 64-character random `JWT_SECRET` in `.env` |
| `gen:redis` | Generates a random `REDIS_PASSWORD` in `.env` |
| `gen:db` | Generates random `DB_PASSWORD` and `DB_ROOT_PASSWORD` in `.env` |
| `gen:all` | Generates all secrets at once |

### Dependency Installer Commands
Install additional dependencies on demand:
```bash
./cli.sh install:db      # Installs mysql2
./cli.sh install:cache   # Installs redis
./cli.sh install:auth    # Installs jose
./cli.sh install:bcrypt  # Installs bcryptjs
./cli.sh install:upload  # Installs multer
./cli.sh install:all     # Installs all optional dependencies
```

---

## Framework-Agnostic Services Layer (`/services/`)

The `services/` directory contains modular ES6 class abstractions located outside `src/` to ensure long-term architectural stability.

### 1. Database (`services/db.js`)
```javascript
import { db } from "@/services";

const users = await db.query("SELECT * FROM users WHERE active = ?", [1]);
const user = await db.queryOne("SELECT * FROM users WHERE id = ?", [userId]);

await db.transaction(async (conn) => {
  await conn.execute("INSERT INTO orders (user_id) VALUES (?)", [userId]);
  await conn.execute("UPDATE accounts SET balance = balance - 100 WHERE id = ?", [userId]);
});
```

### 2. Cache (`services/cache.js`)
```javascript
import { cache } from "@/services";

await cache.set("user:100", { id: 100, name: "Alice" }, 300);
const user = await cache.get("user:100");

const data = await cache.remember("products:all", 600, async () => {
  return await db.query("SELECT * FROM products");
});
```

### 3. Authentication (`services/auth.js`)
```javascript
import { Auth } from "@/services";

const token = await Auth.signJWT({ userId: 1, role: "admin" }, "7d");
const payload = await Auth.verifyJWT(token);
```

### 4. Password Hashing (`services/password.js`)
```javascript
import { Password } from "@/services";

const hash = await Password.hash("userPassword123");
const isValid = await Password.compare("userPassword123", hash);
```

### 5. File Uploads (`services/upload.js`)
```javascript
import { Upload } from "@/services";

export async function POST(request) {
  const { fields, files } = await Upload.parseFormData(request);
  if (files.length > 0) {
    const saved = await Upload.saveFile(files[0], "public/uploads");
    return Response.json({ url: saved.url });
  }
}
```

### 6. Cookies (`services/cookies.js`)
```javascript
import { Cookies } from "@/services";

await Cookies.set("session", token);
const token = await Cookies.get("session");
await Cookies.delete("session");
```

### 7. Proxy Helper & Route Guard (`services/middleware.js` & `src/proxy.js`)
```javascript
import { withAuth } from "../services/middleware.js";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)",
  ],
};

export const proxy = withAuth({
  publicRoutes: ["/login"],
  protectedRoutes: ["/dashboard"],
  loginUrl: "/login",
  dashboardUrl: "/dashboard",
});

export default proxy;
```

---

## Nginx Reverse Proxy & WebSocket Support (`docker/nginx.conf`)

Nginx acts as the high-performance edge entry point:
- Directly serves static assets from `public/` and `_next/static/` with long-term caching.
- Forwards dynamic requests and `/api/` calls to Next.js running on PM2.
- WebSockets pre-configured under `/ws` proxying Upgrade headers to `websocket_upstream` (e.g., uWebSockets.js or Workerman server on port 8001).
- Pre-configured (commented) blocks for micro-caching and rate limiting.

---

## PM2 Clustering (`ecosystem.config.js`)

In production containers, Next.js runs via PM2 in `cluster` mode to utilize all available CPU cores with zero-downtime reloads and automatic restarts on memory limits.
