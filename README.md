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
npm run cli dev    # Starts MySQL & Redis in Docker + Next.js locally
npm run cli prod   # Builds & starts Nginx, MySQL, Redis, Next.js with PM2 in Docker
```

---

## Directory Structure

```
.
├── .env                  # Active environment variables
├── .env.example          # Environment variable template
├── cli.js                # Unified management Node CLI
├── ecosystem.config.js   # PM2 Cluster mode configuration
├── docker-compose.yml    # Container orchestration definitions
├── docker/
│   ├── Dockerfile        # Multi-stage production container build
│   └── nginx.conf        # Production Nginx reverse proxy & static asset server
├── services/
│   ├── index.js          # Main services entry point (re-exports)
│   ├── db.js             # MySQL2 pool wrapper class (Database)
│   ├── cache.js          # Redis client wrapper class (Cache)
│   ├── auth.js           # jose JWT authentication class (Auth)
│   ├── cookies.js        # Next.js server cookie helper class (Cookies)
│   ├── middleware.js     # Route protection HOF helper (AuthProxy)
│   ├── password.js       # bcryptjs hashing and comparison helper (Password)
│   ├── upload.js         # File upload handler for Web API FormData & multer (Upload)
│   └── client.js         # Client-side dynamic script loader (ClientScripts)
└── src/
    ├── proxy.js          # Next.js route protection proxy convention
    └── app/              # Next.js App Router pages & components
```

---

## CLI Reference (`npm run cli`)

The root `cli.js` script provides a unified Node.js interface for managing containers, secrets, interactive shells, and optional dependencies.

```bash
npm run cli <command>
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
npm run cli install:db      # Installs mysql2
npm run cli install:cache   # Installs redis
npm run cli install:auth    # Installs jose
npm run cli install:bcrypt  # Installs bcryptjs
npm run cli install:upload  # Installs multer
npm run cli install:queue   # Installs bullmq and ioredis
npm run cli install:validator # Installs xss
npm run cli install:mail    # Installs nodemailer
npm run cli install:all     # Installs basic dependencies (db, cache, auth, bcrypt, validator)
npm run cli install:pwa     # Generates manifest.json and sw.js in public/
```

### Smart Database & Utility Commands
Directly query and manage services without opening a shell:
```bash
npm run cli mysql users --limit=100    # Query table with limit
npm run cli mysql tables               # List tables
npm run cli mysql query "SELECT 1"     # Arbitrary query
npm run cli redis keys                 # List redis keys
npm run cli redis monitor              # Monitor redis commands
npm run cli db:backup                  # SQL dump to local directory
npm run cli db:import dump.sql         # Import SQL file
npm run cli env:check                  # Validate required environment variables
npm run cli worker                     # Start the background job processor
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

### 8. Client Script Loader (`services/client.js`)
```javascript
import { ClientScripts } from "@/services";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ClientScripts scripts={["bootstrap/dist/js/bootstrap.bundle.min.js", "beercss"]} />
      </body>
    </html>
  );
}
```

### 9. Background Jobs Queue (`services/queue.js`)
Requires `bullmq` and `ioredis`. 
```javascript
import { queue } from "@/services";

// Dispatch a job for the background worker
await queue.dispatch("backup", { some: "data" });

// Schedule a recurring cron job
await queue.schedule("backup", {}, "0 0 * * *"); // Every day at midnight
```
Worker process is defined in `jobs/index.js` and can be started via:
```bash
npm run cli worker
```
Or it automatically starts in production (PM2) if `.env` contains `BACKGROUND_JOBS=true`.

### 10. Data Validator & Sanitizer (`services/validator.js`)
Requires `xss`. Provides schema-based validation with built-in XSS sanitization, multi-language support, automatic field capitalization, and custom field aliases.
```javascript
import { Validator } from "@/services";

const userSchema = {
  // Uses 'alias' to override the default capitalized field name ("Name")
  name: { required: true, alphanumeric: true, alias: "Full Name" },
  email: { required: true, email: true },
  password: { required: true, min: 6 }
};
const validator = new Validator(userSchema, "en");

// Usage in API Routes (App Router)
export async function POST(request) {
  const result = await validator.validate(request);
  if (!result.success) return Response.json(result, { status: 400 });
  
  const { name, email, password } = result.data; // sanitized data
  // ...
}

// Usage in Server Actions
export async function createUser(formData) {
  "use server";
  const data = Object.fromEntries(formData.entries());
  const result = await validator.validate(data);
  
  if (!result.success) return { errors: result.errors };
  // ...
}
```

### 11. Rate Limiting (`services/rate-limit.js`)
Application-level rate limiting using Redis, useful for protecting sensitive endpoints (like login) before they reach the database.
```javascript
import { RateLimit } from "@/services";

export async function POST(req) {
  // Allow max 5 requests per 60 seconds
  const isAllowed = await RateLimit.check(req, "login_attempt", 5, 60);
  if (!isAllowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }
}
```

### 12. Mailer (`services/mailer.js`)
Requires `nodemailer`. Provides a standard interface for sending SMTP emails. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in `.env`.
```javascript
import { Mailer } from "@/services";

await Mailer.send(
  "user@example.com", 
  "Welcome!", 
  "<h1>Thanks for registering</h1>"
);
```

---

## Built-in SEO Automation (`src/app/sitemap.js` & `src/app/robots.js`)

The template automatically generates dynamic SEO files using Next.js Metadata API based on your `src/proxy.js` rules:
- **`sitemap.xml`**: Dynamically maps all `publicRoutes` defined in `proxyConfig`.
- **`robots.txt`**: Automatically injects `Disallow` rules for all `protectedRoutes` defined in `proxyConfig`.

No manual maintenance of XML or TXT files is required.

---

## PWA Support

You can instantly convert your application into an installable Progressive Web App (PWA) with offline capabilities.

Run the installer via the CLI:
```bash
npm run cli install:pwa
```

This command will:
1. Generate a standard `public/manifest.json`.
2. Generate an offline-first service worker script at `public/sw.js`.

**Final Step**: To activate it, simply add the manifest link to your `src/app/layout.js` inside the `<head>` or via Next.js Metadata:
```javascript
export const metadata = {
  manifest: "/manifest.json",
};
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
