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
npm run cli install:validator # Installs xss (optional for advanced sanitization)
npm run cli install:mail    # Installs nodemailer
npm run cli install:all     # Installs core stack (db, cache, auth, bcrypt)
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

---

# 🐦 Blue Bird CSS & JS Framework

A lightweight, semantic, modern design framework inspired by **shadcn/ui aesthetics** and Tailwind-like utility speed. **Zero build step and zero configuration required**.

📖 **[Live Interactive Documentation](https://seip25.github.io/Blue-bird-css/)**

---

## 📋 Table of Contents

- [⚡ Key Features](#-key-features)
- [🚀 Quick Start (CDN)](#-quick-start-cdn)
- [🧠 JavaScript Engine (`bluebird.js`) & API](#-javascript-engine-bluebirdjs--api)
  - [Core `bluebird()` Function](#core-bluebird-function)
  - [Toast Notifications (`toast()`)](#toast-notifications-toast)
  - [Snackbar (`snackbar()`)](#snackbar-snackbar)
  - [Command Palette (`Ctrl+K`)](#command-palette-ctrlk)
  - [4-Direction Drawer Panels](#4-direction-drawer-panels)
  - [Interactive Tabs](#interactive-tabs)
  - [Touch & Drag Carousel](#touch--drag-carousel)
  - [Automatic Mobile Navigation](#automatic-mobile-navigation)
- [🎨 CSS Components & Utilities](#-css-components--utilities)
  - [Buttons, Soft Tint & Cyberpunk Glow](#buttons-soft-tint--cyberpunk-glow)
  - [Badges & Tooltips](#badges--tooltips)
  - [Forms & Floating Labels](#forms--floating-labels)
  - [Cards](#cards)
  - [Modals (`<dialog>`)](#modals-dialog)
  - [Dropdowns](#dropdowns)
  - [Tables](#tables)
  - [Skeleton Loading Placeholders](#skeleton-loading-placeholders)
  - [Progress Bars, Gauge & Spinners](#progress-bars-gauge--spinners)
  - [Bottom Navigation](#bottom-navigation)
- [📐 Layout System & Grid](#-layout-system--grid)
  - [Containers](#containers)
  - [Grid System (1 to 12 Columns)](#grid-system-1-to-12-columns)
  - [Flexbox & Spacing](#flexbox--spacing)
  - [Responsiveness & Breakpoints](#responsiveness--breakpoints)
- [✨ CSS Animations & Motion Effects](#-css-animations--motion-effects)
- [🎨 Theming & Light / Dark Mode](#-theming--light--dark-mode)
- [⚡ Next.js & React Integration](#-nextjs--react-integration)

---

## ⚡ Key Features

- **Semantic HTML First**: Automatic out-of-the-box styling for base HTML tags (`button`, `header`, `main`, `aside`, `input`, `select`, `textarea`, `table`, `progress`, `dialog`, `<details><summary>`).
- **shadcn/ui Inspired Design Language**: Clean borders, consistent rounded corners (`rounded-xl`), sleek dark palettes with high-contrast accents, and subtle glassmorphic shadows.
- **Subtle & Soft Tint Buttons**: Tinted soft background buttons (`bg-primary-subtle`, `bg-blue-subtle`, `bg-green-subtle`, `bg-purple-subtle`, `bg-red-subtle`, `bg-pink-subtle`, etc.).
- **Perfectly Aligned Link Buttons**: Text link buttons (`.btn-link` or `a.link`) engineered to match standard button height and baseline vertical alignment exactly when placed side-by-side with solid buttons.
- **Filled Floating Inputs**: Floating label inputs supporting both Outline style (`.floating`) and Material/Modern filled container style (`.floating-fill`).
- **Cyberpunk Glow Buttons**: Interactive futuristic buttons with vibrant multi-layer neon box shadows (`.glow-cyberpunk`, `.glow-pulse`, `.glow-blue`, `.glow-pink`, `.glow-purple`, `.glow-green`).
- **4-Direction Drawers**: Standalone slide-out panels from `.drawer-left`, `.drawer-right`, `.drawer-top`, or `.drawer-bottom` (mobile bottom sheet).
- **Automatic Mobile Navigation Drawer**: Transforms the desktop `<aside>` sidebar inside `<main>` into a responsive mobile drawer (`☰`) on screens `<768px` via `bluebird.js`.
- **Mobile Touch & Swipe Carousel**: Touch swipe physics, desktop mouse drag, arrow controls, indicator dots, and automatic cycling via `data-autoplay="true"`.
- **Expressive Color Palette**: Solid and subtle color utility classes for Blue, Red, Green, Yellow, Purple, Indigo, Pink, Teal, Orange, Cyan, Lime, Rose, Fuchsia, Emerald, Sky, and Amber.
- **Micro-Interaction Micro-FX**: Material Ripple effect on button clicks, plus CSS keyframe animations (`.animate-spin`, `.animate-pulse`, `.animate-bounce`, `.animate-fade-in`, `.animate-slide-up`, `.animate-float`, `.animate-wiggle`, `.animate-shimmer`).
- **Next.js Ready**: Full step-by-step integration guide for Next.js App Router (`app/layout.jsx`) and Pages Router (`pages/_app.jsx`).

---

## 🚀 Quick Start (CDN)

Simply include `bluebird.css` and `bluebird.js` in your HTML `<head>` or template:

```html
<link rel="stylesheet" href="https://seip25.github.io/Blue-bird-css/bluebird.css" />
<script src="https://seip25.github.io/Blue-bird-css/bluebird.js"></script>
```

### Complete Basic HTML Example:

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Blue Bird App</title>
  <link rel="stylesheet" href="https://seip25.github.io/Blue-bird-css/bluebird.css" />
  <script src="https://seip25.github.io/Blue-bird-css/bluebird.js"></script>
</head>
<body>
  <!-- Header with Navigation -->
  <header>
    <nav>
      <h2>🐦 Blue Bird App</h2>
      <div class="flex gap-2">
        <button class="bg-blue-subtle">Dashboard</button>
        <button class="primary glow-pulse">Get Started</button>
      </div>
    </nav>
  </header>

  <!-- Main Layout with Responsive Sidebar -->
  <main>
    <aside>
      <h4>Navigation</h4>
      <a href="#">Home</a>
      <a href="#">Components</a>
      <a href="#">Settings</a>
    </aside>

    <div>
      <article class="card">
        <div class="card-header">
          <h3 class="card-title">Modern Web Application</h3>
          <p class="card-description">Clean semantic markup with zero build step overhead.</p>
        </div>
        <div class="card-content">
          <div class="floating-fill mb-4">
            <input type="text" id="username" placeholder=" " />
            <label for="username">Username</label>
          </div>
          <button class="primary" onclick="toast({ title: 'Success!', description: 'Settings saved successfully.', type: 'success' })">
            Save Changes
          </button>
        </div>
      </article>
    </div>
  </main>
</body>
</html>
```

---

## 🧠 JavaScript Engine (`bluebird.js`) & API

`bluebird.js` is a zero-dependency, lightweight JavaScript helper that powers dynamic notifications, tabs, command palettes, touch carousels, and responsive mobile navigation drawers.

### Core `bluebird()` Function

```javascript
// Main entry point signature:
bluebird(component, options);
```

---

### Toast Notifications (`toast()`)

Stacked, auto-dismissing toast notification system inspired by shadcn/ui Toast.

```javascript
// Via global toast helper function:
toast({
  title: 'Payment Completed',
  description: 'Your transaction #9402 has been processed.',
  type: 'success', // 'success' | 'error' | 'warning' | 'info'
  position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  duration: 4000 // Milliseconds to auto-dismiss (0 for persistent)
});

// Via bluebird function:
bluebird('toast', {
  title: 'Network Error',
  description: 'Could not establish connection to server.',
  type: 'error',
  position: 'top-right'
});
```

---

### Snackbar (`snackbar()`)

Single floating bottom alert bar.

```javascript
// Via global snackbar helper function:
snackbar({
  message: 'Item archived successfully.',
  type: 'info', // 'info' | 'success' | 'warning' | 'error'
  duration: 3000
});

// Via bluebird function:
bluebird('snackbar', {
  message: 'Welcome to Blue Bird CSS!',
  type: 'success'
});
```

---

### Command Palette (`Ctrl+K`)

Fast, keyboard-accessible command menu modal modeled after shadcn Command. Press <kbd>Ctrl+K</kbd> or <kbd>Cmd+K</kbd> anywhere on the page to open or close.

```javascript
// Open/close programmatically:
bluebird('command', { action: 'open' }); // 'open' | 'close' | 'toggle'
```

---

### 4-Direction Drawer Panels

Slide-out drawer panels from any direction of the screen.

```html
<!-- HTML Declarative Trigger -->
<button data-drawer-target="my-left-drawer">Open Left Drawer</button>

<div id="my-left-drawer" class="drawer drawer-left">
  <div class="drawer-header">
    <h3>Drawer Navigation</h3>
    <button data-drawer-close class="ghost">&times;</button>
  </div>
  <div class="drawer-body">
    <p>Drawer content goes here...</p>
  </div>
</div>
```

```javascript
// Programmatic JavaScript API:
bluebird('drawer', { id: 'my-left-drawer', action: 'open' });
bluebird('drawer', { id: 'my-left-drawer', action: 'close' });
bluebird('drawer', { id: 'my-left-drawer', action: 'toggle' });
```

---

### Interactive Tabs

Switch active content panels declaratively without writing custom JS event listeners.

```html
<div class="tabs">
  <div class="tab-list">
    <button class="tab-trigger active" data-tab-target="tab-profile">Profile</button>
    <button class="tab-trigger" data-tab-target="tab-security">Security</button>
  </div>

  <div id="tab-profile" class="tab-content active">
    <p>Profile settings content...</p>
  </div>

  <div id="tab-security" class="tab-content">
    <p>Security settings content...</p>
  </div>
</div>
```

```javascript
// Switch tabs programmatically:
bluebird('tab', { id: 'tab-security' });
```

---

### Touch & Drag Carousel

Mobile-first touch swipe, desktop mouse drag, arrow buttons, indicator dots, and optional autoplay.

```html
<div class="carousel" data-autoplay="true" data-interval="3500">
  <button class="carousel-nav carousel-prev">&larr;</button>
  <button class="carousel-nav carousel-next">&rarr;</button>

  <div class="carousel-track">
    <div class="carousel-item responsive-card">Slide Card 1</div>
    <div class="carousel-item responsive-card">Slide Card 2</div>
    <div class="carousel-item responsive-card">Slide Card 3</div>
  </div>

  <div class="carousel-indicators"></div>
</div>
```

```javascript
// Manual initialization if created dynamically:
bluebird('carousel', { selector: '.carousel', autoplay: true, interval: 4000 });
```

---

### Automatic Mobile Navigation

When your page uses standard semantic HTML structure:

```html
<header>
  <nav>...</nav>
</header>
<main>
  <aside>...</aside>
  <div>...</div>
</main>
```

On small viewports (`<768px`), `bluebird.js` automatically hides the desktop `<aside>` sidebar and injects a mobile drawer toggle button (`☰`) into your top `<header><nav>`, providing a slide-over mobile drawer navigation.

---

## 🎨 CSS Components & Utilities

### Buttons, Soft Tint & Cyberpunk Glow

#### 1. Core Variants & Sizes

```html
<!-- Base Variants -->
<button>Primary Default</button>
<button class="secondary">Secondary</button>
<button class="outline">Outline</button>
<button class="destructive">Destructive</button>
<button class="ghost">Ghost</button>

<!-- Button Sizes -->
<button class="primary btn-xs">Extra Small (xs)</button>
<button class="primary btn-sm">Small (sm)</button>
<button class="primary btn-md">Medium (md)</button>
<button class="primary btn-lg">Large (lg)</button>
<button class="primary btn-xl">Extra Large (xl)</button>
<button class="primary btn-icon">+</button>
```

#### 2. Soft Tint Buttons (Subtle / Soft Tint)

```html
<button class="bg-primary-subtle">Primary Subtle</button>
<button class="bg-blue-subtle">Blue Subtle</button>
<button class="bg-red-subtle">Red Subtle</button>
<button class="bg-green-subtle">Green Subtle</button>
<button class="bg-yellow-subtle">Yellow Subtle</button>
<button class="bg-purple-subtle">Purple Subtle</button>
<button class="bg-pink-subtle">Pink Subtle</button>
<button class="bg-emerald-subtle">Emerald Subtle</button>
```

#### 3. Perfectly Aligned Link Buttons (`.btn-link` / `a.link`)

```html
<button class="primary">Solid Button</button>
<a href="#" class="btn-link">Link Button (Anchor)</a>
<button class="btn-link">Link Button (Button)</button>
```

#### 4. Neon Cyberpunk & Glow Buttons

```html
<button class="glow-cyberpunk">Cyberpunk Neon</button>
<button class="primary glow-pulse">Energy Pulse</button>
<button class="bg-blue glow-blue">Glow Blue</button>
<button class="bg-pink glow-pink">Glow Pink</button>
<button class="bg-violet glow-purple">Glow Purple</button>
```

---

### Badges & Tooltips

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-secondary">Secondary</span>
<span class="badge badge-pink">Pink</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-destructive">Destructive</span>
<span class="badge badge-outline">Outline</span>

<!-- Hover tooltip via data-tooltip -->
<button class="primary" data-tooltip="Save changes to database">Save</button>
```

---

### Forms & Floating Labels

All form controls (`<input>`, `<select>`, `<textarea>`) are automatically styled out of the box.

#### Standard & Fill Variant (`.fill`)

```html
<!-- Standard inputs -->
<input type="text" placeholder="Standard Text Input" />
<input type="email" placeholder="Email Input" />

<!-- Filled Variant (.fill) -->
<input type="text" class="fill" placeholder="Filled Input" />
<select class="fill">
  <option>Filled Select</option>
</select>
```

#### Floating Labels (Outline & Filled Style)

```html
<!-- Outline Floating Label -->
<div class="floating">
  <input type="email" id="email" placeholder=" " />
  <label for="email">Email Address</label>
</div>

<!-- Filled Container Floating Label (Material Style) -->
<div class="floating-fill">
  <input type="text" id="fullname" placeholder=" " />
  <label for="fullname">Full Name</label>
</div>
```

#### Checkboxes, Radios & Switches

```html
<!-- Checkbox & Radio -->
<label><input type="checkbox" checked /> I agree to terms</label>
<label><input type="radio" name="group1" checked /> Option A</label>

<!-- Standard Pill Switch -->
<label><input type="checkbox" role="switch" checked /> Notifications</label>

<!-- Android Material Switch -->
<label><input type="checkbox" class="switch-android" checked /> Dark Mode</label>
```

---

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Header Title</h3>
    <p class="card-description">Subtitle or description text.</p>
  </div>
  <div class="card-content">
    <p>Main card body contents...</p>
  </div>
  <div class="card-footer">
    <button class="primary btn-sm">Action</button>
  </div>
</div>
```

---

### Modals (`<dialog>`)

Uses native HTML5 `<dialog>` elements with backdrop blur and fullscreen support.

```html
<!-- Standard Dialog Modal -->
<dialog id="myModal">
  <article>
    <header class="flex items-center between">
      <h4>Confirm Action</h4>
      <button class="ghost" onclick="myModal.close()">&times;</button>
    </header>
    <p>Are you sure you want to proceed?</p>
    <footer>
      <button class="ghost" onclick="myModal.close()">Cancel</button>
      <button class="primary" onclick="myModal.close()">Confirm</button>
    </footer>
  </article>
</dialog>

<!-- Open via Native JS -->
<button onclick="myModal.showModal()">Open Dialog</button>

<!-- Fullscreen Dialog -->
<dialog id="modalFull" class="dialog-full">
  <article>
    <h4>Immersive Fullscreen Modal</h4>
    <button class="secondary" onclick="modalFull.close()">Close</button>
  </article>
</dialog>
```

---

### Dropdowns

CSS hover/focus dropdown menu without heavy dependencies.

```html
<div class="dropdown">
  <button class="dropdown-toggle">Menu</button>
  <div class="dropdown-content">
    <a href="#" class="dropdown-item">Profile</a>
    <a href="#" class="dropdown-item">Settings</a>
    <a href="#" class="dropdown-item">Logout</a>
  </div>
</div>
```

---

### Tables

```html
<table class="table-striped table-hover">
  <thead>
    <tr>
      <th>User</th>
      <th>Role</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Sarah Jenkins</td>
      <td>Administrator</td>
      <td><span class="badge badge-success">Active</span></td>
    </tr>
  </tbody>
</table>
```

*Optional table utility classes:* `.table-striped`, `.table-hover`, `.table-bordered`, `.table-compact`.

---

### Skeleton Loading Placeholders

Animated shimmer placeholder elements to indicate loading states during data fetching.

```html
<div class="card p-6">
  <div class="flex items-center gap-4 mb-4">
    <span class="skeleton skeleton-avatar"></span>
    <div class="flex-1">
      <span class="skeleton skeleton-title"></span>
      <span class="skeleton skeleton-text" style="width: 40%"></span>
    </div>
  </div>
  <span class="skeleton skeleton-text"></span>
  <span class="skeleton skeleton-text" style="width: 80%"></span>
  <div class="flex gap-2 mt-4">
    <span class="skeleton skeleton-button"></span>
  </div>
</div>
```

---

### Progress Bars, Gauge & Spinners

```html
<!-- Native HTML5 Progress Element -->
<progress value="60" max="100"></progress>

<!-- Native HTML5 Meter Gauge Element -->
<meter min="0" max="100" value="85" low="33" high="66" optimum="50"></meter>

<!-- Custom Progress Bar -->
<div class="progress">
  <div class="progress-bar bg-purple" style="width: 75%"></div>
</div>

<!-- Indeterminate Spinners -->
<span class="spinner spinner-sm"></span>
<span class="spinner"></span>
<span class="spinner spinner-lg"></span>

<!-- Step Process Control (.steps) -->
<div class="steps">
  <div class="step completed">
    <div class="step-circle">1</div>
    <span class="step-label">Cart</span>
  </div>
  <div class="step active">
    <div class="step-circle">2</div>
    <span class="step-label">Shipping</span>
  </div>
  <div class="step">
    <div class="step-circle">3</div>
    <span class="step-label">Payment</span>
  </div>
</div>
```

---

### Bottom Navigation

Fixed bottom app bar for mobile viewports.

```html
<nav class="bottom-nav">
  <a href="#" class="bottom-nav-item active">
    <span class="bottom-nav-icon">🏠</span>
    <span class="bottom-nav-label">Home</span>
  </a>
  <a href="#" class="bottom-nav-item">
    <span class="bottom-nav-icon">🔍</span>
    <span class="bottom-nav-label">Search</span>
  </a>
  <a href="#" class="bottom-nav-item">
    <span class="bottom-nav-icon">⚙️</span>
    <span class="bottom-nav-label">Settings</span>
  </a>
</nav>
```

---

## 📐 Layout System & Grid

### Containers

```html
<div class="container">Centered Container (max 1200px)</div>
<div class="container-sm">Small Container (max 640px)</div>
<div class="container-md">Medium Container (max 768px)</div>
<div class="container-lg">Large Container (max 1024px)</div>
<div class="container-xl">Extra Large Container (max 1280px)</div>
<div class="container-fluid">Full Width Container (100%)</div>
```

---

### Grid System (1 to 12 Columns)

```html
<!-- 3-column equal grid -->
<div class="grid grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<!-- Custom column spans -->
<div class="grid grid-cols-12 gap-4">
  <div class="col-span-8">Spans 8 columns</div>
  <div class="col-span-4">Spans 4 columns</div>
</div>
```

*Supports:* `.grid-cols-1` through `.grid-cols-12` and `.col-span-1` through `.col-span-12`.

---

### Flexbox & Spacing

- **Flexbox Layout:** `.flex`, `.flex-col`, `.flex-row`, `.flex-wrap`, `.flex-1`, `.items-center`, `.justify-between`, `.justify-center`, `.justify-end`.
- **Gap & Spacing:** `.gap-1` to `.gap-8`, `.m-1` to `.m-8`, `.p-1` to `.p-8`, `.mx-*`, `.my-*`, `.px-*`, `.py-*`.
- **Shadows:** `.shadow-sm`, `.shadow-md`, `.shadow-lg`, `.shadow-xl`, `.shadow-inner`, `.shadow-none`.
- **Borders:** `.border`, `.border-0`, `.border-2`, `.border-b`, `.border-t`, `.border-l`, `.border-r`.
- **Border Radius:** `.rounded-none`, `.rounded-sm`, `.rounded-md`, `.rounded-lg`, `.rounded-xl`, `.rounded-2xl`, `.rounded-full`.

---

### Responsiveness & Breakpoints

- Mobile main breakpoint: `<768px`.
- `.hidden-sm`: Hides elements on mobile screens (`<768px`).
- `.visible-sm`: Shows elements only on mobile screens (`<768px`).

---

## ✨ CSS Animations & Motion Effects

Ready-to-use motion keyframes and utility classes:

```html
<!-- Infinite Spin Loading -->
<span class="animate-spin spinner"></span>

<!-- Ping & Pulse radar -->
<span class="animate-ping bg-blue rounded-full w-3 h-3"></span>
<div class="animate-pulse">Loading data...</div>

<!-- Bounce animation -->
<span class="animate-bounce">↓ Scroll Down</span>

<!-- Smooth Entrances & Float -->
<div class="animate-fade-in">Fade In Entrance</div>
<div class="animate-slide-up">Slide Up Entrance</div>
<div class="animate-float">Floating Bobbing Animation</div>
<div class="animate-wiggle">Wiggle Shake Effect</div>

<!-- Hover lift effect -->
<button class="secondary hover-lift">Hover Lift Button</button>
```

---

## 🎨 Theming & Light / Dark Mode

Blue Bird CSS relies on native CSS design tokens and custom variables. Toggle between light and dark themes effortlessly by changing the `data-theme` attribute on `<html>`.

```html
<!-- Dark Theme Active -->
<html data-theme="dark">
```

```javascript
// Toggle light/dark theme via JS:
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
}
```

### Color Palette Shorthands

Apply any solid color (`.bg-blue`, `.bg-red`, `.bg-green`, `.bg-purple`, `.bg-pink`, `.bg-emerald`, `.bg-orange`, `.bg-amber`, etc.) or subtle tint (`.bg-blue-subtle`, `.bg-red-subtle`, `.bg-green-subtle`, etc.) to elements.

---

## ⚡ Next.js & React Integration

Blue Bird CSS is 100% compatible with Server-Side Rendering (SSR), React, and Next.js.

### Next.js App Router Setup (`app/layout.jsx`)

Place `bluebird.css` and `bluebird.js` in your `public/` directory or import the stylesheet directly in `layout.jsx`:

```jsx
// app/layout.jsx
import Script from 'next/script';
import '@/public/bluebird.css';

export const metadata = {
  title: 'My Next.js + Blue Bird App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <header className="sticky top-0 z-50 bg-surface border-b">
          <nav className="flex items-center justify-between py-3 px-4">
            <h2 className="font-bold text-xl">My App</h2>
            <button className="primary btn-sm">Sign In</button>
          </nav>
        </header>

        <main>
          {children}
        </main>

        {/* Load Blue Bird JS Helper for Toasts, Drawers & Carousels */}
        <Script src="/bluebird.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
```
