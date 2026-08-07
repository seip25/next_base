"use client";

import Image from "next/image";
import {
  Button,
  ThemeToggle,
  toast,
  snackbar,
  commandPalette,
  DataTable,
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
  Carousel,
  CarouselTrack,
  CarouselItem,
  CarouselPrev,
  CarouselNext,
  CarouselIndicators,
} from "@/components/ui";

const sampleColumns = [
  { key: "id", title: "ID" },
  { key: "name", title: "Nombre" },
  { key: "role", title: "Rol" },
  { key: "status", title: "Estado" },
];

const sampleData = [
  { id: "USR-001", name: "Ana García", role: "Administrador", status: "Activo" },
  { id: "USR-002", name: "Carlos López", role: "Desarrollador", status: "Inactivo" },
  { id: "USR-003", name: "María Rodríguez", role: "Diseñadora UI", status: "Activo" },
  { id: "USR-004", name: "Juan Martínez", role: "DevOps", status: "Pendiente" },
  { id: "USR-005", name: "Sofía Fernández", role: "QA Engineer", status: "Activo" },
];

export default function Home() {
  const triggerToast = (type, title, description) => {
    toast({
      title: title || "Action Triggered",
      description: description || "Bluebird JS React component notification system active.",
      type: type || "success",
      position: "bottom-right",
      duration: 4000,
    });
  };

  const triggerSnackbar = () => {
    snackbar({
      message: "Item processed successfully with Bluebird UI!",
      type: "info",
      duration: 3000,
    });
  };

  return (
    <div>
      <header>
        <nav>
          <h5>Blue Bird CSS &amp; Nextjs Base Template</h5>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => commandPalette("open")}
            >
              🔍 Commands (Ctrl+K)
            </Button>
            <ThemeToggle />
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
            A modern, production-ready Next.js starter paired with the native <strong>Bluebird UI Component System</strong>.
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
              Blue Bird CSS &amp; UI Components
            </a>
            <span>— Direct React integration with <code>@/components/ui</code>.</span>
          </div>

          {/* Hero Quick Actions */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              variant="primary"
              onClick={() => triggerToast("success", "Welcome!", "Bluebird UI components are active.")}
            >
              Test Toast Notification
            </Button>
            <Button variant="secondary" onClick={triggerSnackbar}>
              Test Snackbar Alert
            </Button>
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
          <h2>Blue Bird Native Component Showcase</h2>
          <p className="text-secondary mb-4">
            Directly imported React Client Components (<code>@/components/ui</code>).
          </p>

          <div className="flex flex-wrap gap-4">
            {/* Buttons & Soft Tints */}
            <div className="p-4 border rounded flex-1">
              <h3>Buttons &amp; Ripple Effects</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="destructive" size="sm">Destructive</Button>
                <Button variant="bg-blue-subtle" size="sm">Blue Subtle</Button>
                <Button variant="bg-green-subtle" size="sm">Green Subtle</Button>
                <Button variant="bg-purple-subtle" size="sm">Purple Subtle</Button>
                <Button glow="cyberpunk" size="sm">Cyberpunk</Button>
                <Button variant="primary" glow="pulse">Energy Pulse</Button>
                <Button variant="bg-blue" glow="blue">Glow Blue</Button>
                <Button variant="bg-pink" glow="pink">Glow Pink</Button>
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

        {/* Interactive Tabs Showcase */}
        <section className="card mb-4">
          <h2>Interactive Tabs Component</h2>
          <p className="text-secondary mb-3">
            Pure React state management with <code>&lt;Tabs&gt;</code> component.
          </p>

          <Tabs defaultValue="overview">
            <TabList>
              <TabTrigger value="overview">Overview</TabTrigger>
              <TabTrigger value="features">Features</TabTrigger>
              <TabTrigger value="analytics">Analytics</TabTrigger>
            </TabList>

            <TabContent value="overview" className="p-4 border border-t-0 rounded-b">
              <h4>Overview Panel</h4>
              <p className="text-secondary">
                This is the overview tab content styled with Bluebird CSS.
              </p>
            </TabContent>

            <TabContent value="features" className="p-4 border border-t-0 rounded-b">
              <h4>Features List</h4>
              <ul className="text-secondary pl-4">
                <li>Direct component imports from <code>@/components/ui</code></li>
                <li>Material Ripple effect on buttons</li>
                <li>Responsive Data Table with mobile card rendering</li>
              </ul>
            </TabContent>

            <TabContent value="analytics" className="p-4 border border-t-0 rounded-b">
              <h4>Analytics Summary</h4>
              <p className="text-secondary">
                Performance: 100% Client Component ready.
              </p>
            </TabContent>
          </Tabs>
        </section>

        {/* Responsive Data Table Section */}
        <section className="card mb-4">
          <h2>Responsive Data Table (<code>DataTable</code>)</h2>
          <p className="text-secondary mb-4">
            Responsive table with search, pagination, desktop table view, and mobile card view adapted for Bluebird CSS.
          </p>

          <DataTable
            data={sampleData}
            columns={sampleColumns}
            summaryFields={["name", "role"]}
            rowsPerPage={3}
            onEdit={(e, item) => triggerToast("info", "Edit User", `Editing ${item.name}`)}
            onDelete={(e, item) => triggerToast("error", "Delete User", `Deleting ${item.name}`)}
          />
        </section>

        {/* Touch Carousel Section */}
        <section className="card mb-4">
          <h2>Touch Carousel (<code>Carousel</code>)</h2>
          <p className="text-secondary mb-4">
            Interactive slider with touch swipe &amp; mouse drag support.
          </p>

          <Carousel autoplay={true} interval={4000}>
            <CarouselTrack>
              <CarouselItem className="p-6 bg-surface border rounded-xl text-center">
                <h3>Slide 1: Zero-Config Framework</h3>
                <p className="text-secondary">Seamlessly integrated into Next.js App Router.</p>
              </CarouselItem>
              <CarouselItem className="p-6 bg-surface border rounded-xl text-center">
                <h3>Slide 2: Direct UI Components</h3>
                <p className="text-secondary">Import buttons, modals, tabs, toasts directly.</p>
              </CarouselItem>
              <CarouselItem className="p-6 bg-surface border rounded-xl text-center">
                <h3>Slide 3: Responsive Data Table</h3>
                <p className="text-secondary">Adapts automatically on mobile devices.</p>
              </CarouselItem>
            </CarouselTrack>
            <CarouselPrev />
            <CarouselNext />
            <CarouselIndicators />
          </Carousel>
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
                <code>npm run dev     # Local development server{"\n"}npm run build   # Production standalone bundle{"\n"}npm run start   # Start Next.js server</code>
              </pre>
            </div>

            <div className="p-4 border rounded flex-1">
              <h3>2. Containerized Stack</h3>
              <p className="text-muted">
                Full-stack mode with MySQL, Redis, Nginx reverse proxy, and PM2 process clustering.
              </p>
              <pre>
                <code>npm run cli dev    # Docker (DB/Redis) + local Next.js{"\n"}npm run cli prod   # Full stack production launch</code>
              </pre>
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
