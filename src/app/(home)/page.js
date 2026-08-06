"use client";

import Image from "next/image";
import { useEffect } from "react";

export default function Home() {
  const triggerToast = (type, title, description) => {
    if (typeof window !== "undefined" && window.toast) {
      window.toast({
        title: title || "Action Triggered",
        description: description || "Blue Bird CSS toast notification system active.",
        type: type || "success",
        position: "bottom-right",
        duration: 4000,
      });
    } else {
      alert(`${title}: ${description}`);
    }
  };

  const triggerSnackbar = () => {
    if (typeof window !== "undefined" && window.snackbar) {
      window.snackbar({
        message: "Item processed successfully with Bluebird JS!",
        type: "info",
        duration: 3000,
      });
    }
  };
  const changeTheme = (event) => {
    event.preventDefault();
    if (window.localStorage.getItem("theme") !== "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      window.localStorage.setItem("theme", "light");
    }
  }
  useEffect(() => {
    if (window.localStorage.getItem("theme")) {
      document.documentElement.setAttribute("data-theme", window.localStorage.getItem("theme"));
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      window.localStorage.setItem("theme", "light");
    }
  }, []);

  return (
    <div>
      <header>
        <nav>
          <h5>
            Blue Bird CSS & Nextjs Base Template
          </h5>
          <div className="flex">
            <button onClick={changeTheme}
              className="outline ">
              Change Theme
            </button>
          </div>

        </nav>
      </header>
      <main className="container py-4 pb-4">
        {/* Hero Header Section */}
        <header className="text-center mb-4">
          <div className="flex justify-center items-center gap-4 mb-3">
            <Image
              src="/next.svg"
              alt="Next.js logo"
              width={130}
              height={26}
              priority
            />
          </div>
          <h1 className="mb-2">Next.js Production Base Template</h1>
          <p className="text-secondary mb-4">
            A modern, production-ready Next.js starter paired with the zero-config <strong>Blue Bird CSS &amp; JS Framework</strong>.
          </p>

          {/* Framework Banner Badge */}
          <div className="inline-flex flex-wrap justify-center items-center gap-2 p-3 bg-surface border rounded-lg mb-4">
            <span>Powered by</span>
            <a
              href="https://seip25.github.io/Blue-bird-css/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold"
            >
              Blue Bird CSS Framework
            </a>
            <span>— Semantic HTML inspired by <strong>shadcn/ui</strong> &amp; <strong>Pico.css</strong> with Tailwind utility speed.</span>
          </div>

          {/* Hero Quick Actions */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => triggerToast("success", "Welcome!", "Blue Bird CSS & JS framework is active.")}
            >
              Test Toast Notification
            </button>
            <button className="secondary" onClick={triggerSnackbar}>
              Test Snackbar Alert
            </button>
            <a
              role="button"
              className="badge-glow"
              href="https://seip25.github.io/Blue-bird-css/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Live Documentation
            </a>
          </div>
        </header>

        {/* Blue Bird Component Showcase Grid */}
        <section className="card mb-4">
          <h2>Blue Bird Live Component Showcase</h2>
          <p className="text-secondary mb-4">
            Zero build step, semantic HTML components styled out-of-the-box.
          </p>

          <div className="flex flex-wrap gap-4">
            {/* Buttons & Soft Tints */}
            <div className="p-4 border rounded flex-1">
              <h3>Buttons &amp; Soft Tints</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                <button className="primary btn-sm">Primary</button>
                <button className="secondary btn-sm">Secondary</button>
                <button className="destructive btn-sm">Destructive</button>
                <button className="bg-blue-subtle btn-sm">Blue Subtle</button>
                <button className="bg-green-subtle btn-sm">Green Subtle</button>
                <button className="bg-purple-subtle btn-sm">Purple Subtle</button>
                <button className="glow-cyberpunk btn-sm">Cyberpunk</button>
                <button className="primary glow-pulse">Energy Pulse</button>
                <button className="bg-blue glow-blue">Glow Blue</button>
                <button className="bg-pink glow-pink">Glow Pink</button>
              </div>
            </div>

            {/* Badges & Floating Inputs */}
            <div className="p-4 border rounded flex-1">
              <h3>Badges &amp; Forms</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge badge-primary">Primary</span>
                <span className="badge badge-success">Active</span>
                <span className="badge badge-warning">Warning</span>
                <span className="badge badge-destructive">Error</span>
              </div>
              <div className="floating mt-4">
                <input type="text" id="demo-user" placeholder=" " defaultValue="admin@example.com" />
                <label htmlFor="demo-user">Email Address</label>
              </div>
            </div>
          </div>
        </section>

        {/* Modes of Operation */}
        <section className="card mb-4">
          <h2>Modes of Operation</h2>
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="p-4 border rounded flex-1">
              <h3>1. Simple Mode (Lightweight)</h3>
              <p className="text-muted">
                Ideal for static pages, simple content, or apps without external database dependencies.
              </p>
              <pre>
                <code>npm run dev     # Local development server
                  npm run build   # Production standalone bundle
                  npm run start   # Start Next.js server</code>
              </pre>
            </div>

            <div className="p-4 border rounded flex-1">
              <h3>2. Containerized Stack</h3>
              <p className="text-muted">
                Full-stack mode with MySQL, Redis, Nginx reverse proxy, and PM2 process clustering.
              </p>
              <pre>
                <code>npm run cli dev    # Docker (DB/Redis) + local Next.js
                  npm run cli prod   # Full stack production launch</code>
              </pre>
            </div>
          </div>
        </section>

        {/* CLI Quick Reference */}
        <section className="card mb-4">
          <h2>Unified Management CLI Reference</h2>
          <p className="text-secondary mb-4">
            Manage stack containers, generate secrets, run interactive database shells, and install optional dependencies via <code>npm run cli &lt;command&gt;</code>.
          </p>

          <details className="mb-3">
            <summary>Stack Management Commands</summary>
            <table className="mt-3">
              <thead>
                <tr>
                  <th>Command</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>cli dev</code></td>
                  <td>Launches MySQL &amp; Redis in Docker + Next.js on host</td>
                </tr>
                <tr>
                  <td><code>cli build</code></td>
                  <td>Compiles Next.js app and builds Docker container image</td>
                </tr>
                <tr>
                  <td><code>cli prod</code></td>
                  <td>One-shot build and launch for containerized production</td>
                </tr>
                <tr>
                  <td><code>cli stop</code></td>
                  <td>Gracefully stops all running stack containers</td>
                </tr>
                <tr>
                  <td><code>cli clean</code></td>
                  <td>Stops containers and removes persistent volumes &amp; build files</td>
                </tr>
              </tbody>
            </table>
          </details>

          <details className="mb-3">
            <summary>Interactive Shells &amp; Secret Generators</summary>
            <table className="mt-3">
              <thead>
                <tr>
                  <th>Command</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>cli mysql</code></td>
                  <td>Opens interactive MySQL CLI shell inside container</td>
                </tr>
                <tr>
                  <td><code>cli redis</code></td>
                  <td>Opens interactive <code>redis-cli</code> shell inside container</td>
                </tr>
                <tr>
                  <td><code>cli gen:jwt</code></td>
                  <td>Generates random 64-char <code>JWT_SECRET</code> in <code>.env</code></td>
                </tr>
                <tr>
                  <td><code>cli gen:all</code></td>
                  <td>Generates database, redis, and JWT secrets automatically</td>
                </tr>
              </tbody>
            </table>
          </details>

          <details>
            <summary>On-Demand Dependency Installers</summary>
            <div className="py-2">
              <p className="mb-2">
                Install modular stack services on demand:
              </p>
              <pre>
                <code>npm run cli install:db        # mysql2
                  npm run cli install:cache     # redis
                  npm run cli install:auth      # jose JWT
                  npm run cli install:bcrypt    # bcryptjs
                  npm run cli install:pwa       # Generate manifest.json & sw.js</code>
              </pre>
            </div>
          </details>
        </section>

        {/* Modular Services Layer Overview */}
        <section className="card mb-4">
          <h2>Framework-Agnostic Services Layer (<code>/services/</code>)</h2>
          <p className="text-secondary mb-4">
            Production-grade abstractions defined outside <code>src/</code> for long-term architectural stability.
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="border p-4 rounded flex-1">
              <h3>Database &amp; Cache</h3>
              <ul className="text-secondary m-0 pl-4">
                <li><strong>MySQL Pool (<code>services/db.js</code>):</strong> Clean async queries &amp; transactions.</li>
                <li><strong>Redis Client (<code>services/cache.js</code>):</strong> Key-value caching &amp; automatic remember wrapper.</li>
              </ul>
            </div>

            <div className="border p-4 rounded flex-1">
              <h3>Security &amp; Auth</h3>
              <ul className="text-secondary m-0 pl-4">
                <li><strong>JWT Auth (<code>services/auth.js</code>):</strong> Sign &amp; verify JWTs using <code>jose</code>.</li>
                <li><strong>Cookies (<code>services/cookies.js</code>):</strong> Server-side HTTP cookie management.</li>
                <li><strong>Password Hashing (<code>services/password.js</code>):</strong> Secure <code>bcryptjs</code> helper.</li>
              </ul>
            </div>

            <div className="border p-4 rounded flex-1">
              <h3>Protection &amp; Sanitization</h3>
              <ul className="text-secondary m-0 pl-4">
                <li><strong>Proxy Guard (<code>services/middleware.js</code>):</strong> HOF route protection for App Router.</li>
                <li><strong>Data Sanitizer (<code>services/validator.js</code>):</strong> XSS protection &amp; schema validation.</li>
                <li><strong>Rate Limiting (<code>services/rate-limit.js</code>):</strong> Redis token bucket rate limiter.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-4">
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              role="button"
              href="https://seip25.github.io/Blue-bird-css/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Blue Bird CSS Docs
            </a>
            <a
              role="button"
              className="secondary"
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js Docs
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
