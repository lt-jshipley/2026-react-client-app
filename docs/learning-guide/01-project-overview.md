# Project Overview

This is a React single-page application (SPA) built with TypeScript. It talks to a .NET API backend and uses file-based routing, server-state caching, and a component library for the UI.

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │          React SPA (Vite)                 │   │
│  │                                           │   │
│  │  TanStack Router ──► Route Components     │   │
│  │  TanStack Query  ──► Server State Cache   │   │
│  │  Zustand          ──► Client State        │   │
│  │  React Hook Form  ──► Form State          │   │
│  │  i18next           ──► Translations        │   │
│  │  Sentry            ──► Error Tracking      │   │
│  └─────────────┬────────────────────────────┘   │
│                │  fetch(/api/*)                   │
└────────────────┼─────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │  .NET API      │
         │  localhost:5001 │
         └───────────────┘
```

## How the App Boots

The boot sequence in `src/main.tsx` runs in this order:

```
import './instrument'     ← 1. Sentry initializes (must be first)
import './lib/i18n'       ← 2. i18next loads translations
                          ← 3. QueryClient created (5-min stale time, 1 retry)
                          ← 4. Router created with auto-generated route tree
                          ← 5. MSW enabled if VITE_MSW=true (dev only)
                          ← 6. React renders <App /> into #root
```

Inside `<App />`, the provider hierarchy is:

```
<React.StrictMode>
  <QueryClientProvider>        ← TanStack Query context
    <RouterProvider>           ← TanStack Router (renders routes)
      <HelmetProvider>         ← Page <title> management
        <Sentry.ErrorBoundary> ← Catches unhandled errors
          <Outlet />           ← Active route renders here
```

See `src/main.tsx` for the full implementation.

## Project Directory Structure

```
src/
├── api/                    # API layer
│   ├── client.ts           # Fetch wrapper with auth headers
│   ├── queries/            # TanStack Query definitions (read operations)
│   │   ├── dashboard.ts
│   │   └── users.ts
│   └── mutations/          # TanStack Query mutations (write operations)
│       ├── auth.ts
│       └── users.ts
├── components/
│   ├── features/           # Feature-specific components
│   │   ├── admin/          # Admin CRUD (UserTable, dialogs)
│   │   ├── locale/         # LocalePicker
│   │   └── theme/          # ThemeToggle
│   ├── forms/              # Form components (LoginForm, CreateUserForm, etc.)
│   ├── layouts/            # Page layouts (AuthLayout, RootLayout, AppSidebar)
│   └── ui/                 # shadcn/ui primitives (button, card, form, input, etc.)
├── hooks/                  # Custom React hooks
│   ├── use-theme-effect.ts # Syncs theme preference to DOM
│   ├── use-locale-effect.ts# Syncs locale preference to i18next
│   └── use-mobile.tsx      # Responsive breakpoint detection
├── lib/                    # Utilities and configuration
│   ├── i18n.ts             # i18next setup
│   ├── utils.ts            # cn() class merge utility
│   └── validators/         # Zod schemas for form validation
│       ├── auth.ts
│       └── user.ts
├── routes/                 # TanStack Router file-based routes
│   ├── __root.tsx          # Root layout (theme, locale, error boundary)
│   ├── _authenticated/     # Protected routes (requires login)
│   │   ├── route.tsx       # Auth guard + AuthLayout
│   │   ├── dashboard.tsx
│   │   ├── admin/users.tsx
│   │   ├── users/$userId.tsx
│   │   └── settings/
│   └── _public/            # Public routes (no login required)
│       ├── route.tsx       # RootLayout wrapper
│       ├── index.tsx       # Home page
│       ├── login.tsx
│       └── register.tsx
├── stores/                 # Zustand state stores
│   ├── authStore.ts        # Token, user, login/logout
│   └── uiStore.ts          # Theme, sidebar, locale
├── test/                   # Test infrastructure
│   ├── setup.ts            # Vitest global setup (MSW, mocks)
│   ├── test-utils.tsx      # Custom render with providers
│   └── mocks/
│       ├── handlers.ts     # MSW request handlers
│       ├── server.ts       # MSW server (for tests)
│       └── browser.ts      # MSW worker (for dev)
├── types/                  # TypeScript type definitions
│   └── index.ts            # User, Post, API types
├── instrument.ts           # Sentry initialization
├── main.tsx                # App entry point
├── index.css               # Tailwind + theme CSS variables
└── routeTree.gen.ts        # Auto-generated route tree (do not edit)
```

## The `@/` Path Alias

Instead of relative imports like `../../../components/ui/button`, we use `@/` which maps to `src/`:

```typescript
// Instead of this:
import { Button } from '../../../components/ui/button'

// We write this:
import { Button } from '@/components/ui/button'
```

This is configured in two places:

- `tsconfig.json` — so TypeScript understands the alias
- `vite.config.ts` — so the bundler resolves it at build time

See [TypeScript and Vite](./02-typescript-and-vite.md) for the configuration details.

## Dev Workflow

### Starting the Dev Server

```bash
pnpm dev          # Start dev server on http://localhost:3000
                  # API calls proxy to https://localhost:5001
```

```bash
pnpm dev:mock     # Same, but with MSW intercepting API calls
                  # (no backend needed — uses mock data)
```

### Other Common Commands

```bash
pnpm test              # Run tests once
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
pnpm lint              # Check for lint errors
pnpm lint:fix          # Auto-fix lint errors
pnpm format            # Format all files with Prettier
pnpm type-check        # Run TypeScript compiler checks
pnpm build             # Production build (type-check + Vite build)
pnpm test:e2e          # Run Playwright end-to-end tests
```

### The `/api` Proxy

During development, Vite proxies any request starting with `/api` to the .NET backend at `https://localhost:5001`. This means frontend code can use relative URLs like `/api/users` and Vite handles the rest. See the `server.proxy` block in `vite.config.ts`.

## Key Files

| File                   | Purpose                                                |
| ---------------------- | ------------------------------------------------------ |
| `vite.config.ts`       | Build config, plugins, dev server, proxy, test config  |
| `src/main.tsx`         | App entry point and provider setup                     |
| `src/index.css`        | Tailwind imports, theme CSS variables, dark mode       |
| `src/routeTree.gen.ts` | Auto-generated by TanStack Router plugin (do not edit) |
| `components.json`      | shadcn/ui configuration (component paths, aliases)     |
| `tsconfig.json`        | TypeScript compiler settings and path aliases          |
