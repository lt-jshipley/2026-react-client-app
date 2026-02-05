# Setup #4: Enterprise Production React Application

> A comprehensive guide for building production-ready React applications with Vite, TypeScript, and a modern enterprise stack.

**Target Audience:** Large teams, complex applications, long-term maintainability

---

## Table of Contents

1. [Stack Overview](#stack-overview)
2. [Project Structure](#project-structure)
3. [Initial Setup](#initial-setup) (includes file creation order)
4. [Vite Configuration](#vite-configuration)
5. [TypeScript Configuration](#typescript-configuration)
6. [TanStack Router](#tanstack-router)
7. [TanStack Query](#tanstack-query)
8. [Tailwind CSS + shadcn/ui](#tailwind-css--shadcnui) (includes layout components)
9. [Zustand State Management](#zustand-state-management)
10. [React Hook Form + Zod](#react-hook-form--zod)
11. [Internationalization (i18n)](#internationalization-i18n)
12. [TypeScript Types](#typescript-types)
13. [Testing Stack](#testing-stack) (includes MSW browser handler)
14. [ESLint + Prettier](#eslint--prettier)
15. [Git Hooks](#git-hooks)
16. [Error Monitoring (Sentry)](#error-monitoring-sentry)
17. [Environment Configuration](#environment-configuration) (includes .gitignore)
18. [Package Dependencies](#package-dependencies)
19. [Gotchas & Best Practices](#gotchas--best-practices)

---

## Stack Overview

```
Vite + React 19 + TypeScript (strict)
├── Routing:         TanStack Router (file-based)
├── Server State:    TanStack Query
├── Client State:    Zustand
├── Styling:         Tailwind CSS v4 + shadcn/ui
├── Forms:           React Hook Form + Zod
├── Linting:         ESLint 9.x (flat config) + Prettier
├── A11y:            eslint-plugin-jsx-a11y + axe-core + Radix UI primitives
├── Testing:         Vitest + React Testing Library + Playwright + MSW
├── Error Tracking:  Sentry (errors + performance + session replay)
├── i18n:            react-i18next
├── Auth:            JWT (memory + HttpOnly refresh cookie)
└── Git Hooks:       Husky + lint-staged + commitlint
```

---

## Project Structure

```
project-root/
├── public/
│   └── locales/                    # Translation files
│       ├── en/
│       │   ├── common.json
│       │   ├── navigation.json
│       │   └── validation.json
│       └── es/
│           └── ...
├── src/
│   ├── routes/                     # TanStack Router file-based routes
│   │   ├── __root.tsx              # Root layout (required)
│   │   ├── index.tsx               # Home route (/)
│   │   ├── _authenticated/         # Auth-required routes (layout group)
│   │   │   ├── route.tsx           # Auth layout with guard
│   │   │   ├── dashboard.tsx       # /dashboard
│   │   │   └── settings/
│   │   │       ├── index.tsx       # /settings
│   │   │       └── profile.tsx     # /settings/profile
│   │   ├── _public/                # Public routes (layout group)
│   │   │   ├── route.tsx           # Public layout
│   │   │   ├── login.tsx           # /login
│   │   │   └── register.tsx        # /register
│   │   └── users/
│   │       ├── index.tsx           # /users
│   │       └── $userId.tsx         # /users/:userId
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── forms/                  # Form components
│   │   │   └── LoginForm.tsx
│   │   ├── layouts/                # Layout components
│   │   │   ├── RootLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   └── features/               # Feature-specific components
│   │       └── dashboard/
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useMediaQuery.ts
│   ├── api/                        # API layer
│   │   ├── client.ts               # Configured fetch/axios instance
│   │   ├── queries/                # TanStack Query definitions
│   │   │   ├── users.ts
│   │   │   └── posts.ts
│   │   └── mutations/              # TanStack Query mutations
│   │       └── auth.ts
│   ├── stores/                     # Zustand stores
│   │   ├── index.ts                # Combined store export
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── lib/                        # Utilities and configuration
│   │   ├── utils.ts                # cn() function and helpers
│   │   ├── i18n.ts                 # i18n configuration
│   │   └── validators/             # Zod schemas
│   │       ├── auth.ts
│   │       └── user.ts
│   ├── types/                      # TypeScript types
│   │   ├── index.ts
│   │   ├── env.d.ts                # Type-safe ImportMetaEnv
│   │   ├── i18next.d.ts            # i18n type declarations
│   │   └── vitest-axe.d.ts         # vitest-axe matcher types
│   ├── test/                       # Test configuration
│   │   ├── setup.ts                # Vitest setup
│   │   ├── test-utils.tsx          # Custom render with providers
│   │   └── mocks/
│   │       ├── handlers.ts         # MSW request handlers
│   │       ├── server.ts           # MSW server setup
│   │       └── browser.ts          # MSW browser setup
│   ├── instrument.ts               # Sentry initialization
│   ├── vite-env.d.ts               # Vite type declarations
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Global styles + Tailwind
├── e2e/                            # Playwright E2E tests
│   ├── login.spec.ts
│   └── dashboard.spec.ts
├── .husky/                         # Git hooks
│   ├── pre-commit
│   └── commit-msg
├── vite.config.ts
├── playwright.config.ts
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
├── commitlint.config.js
├── .gitignore
├── .env.example
├── components.json                 # shadcn/ui configuration
└── package.json
```

---

## Initial Setup

### 1. Create Vite Project

```bash
pnpm create vite@latest my-app --template react-ts
cd my-app
```

### 2. Install All Dependencies

```bash
# Core React + Routing + State
pnpm add react@19 react-dom@19 \
  @tanstack/react-router @tanstack/react-query \
  zustand

# UI + Styling
pnpm add tailwindcss @tailwindcss/vite \
  clsx tailwind-merge class-variance-authority \
  lucide-react tw-animate-css

# Forms + Validation
pnpm add react-hook-form zod @hookform/resolvers

# Internationalization
pnpm add i18next react-i18next \
  i18next-http-backend i18next-browser-languagedetector

# Error Monitoring
pnpm add @sentry/react

# SEO
pnpm add react-helmet-async

# Dev Dependencies
pnpm add -D typescript @types/react @types/react-dom @types/node \
  vite @vitejs/plugin-react \
  @tanstack/router-plugin @tanstack/react-router-devtools \
  @tanstack/react-query-devtools

# Testing
pnpm add -D vitest jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @playwright/test msw vitest-axe

# Linting + Formatting
pnpm add -D eslint @eslint/js typescript-eslint globals \
  eslint-plugin-react-hooks eslint-plugin-jsx-a11y \
  eslint-config-prettier prettier prettier-plugin-tailwindcss

# Git Hooks
pnpm add -D husky lint-staged \
  @commitlint/cli @commitlint/config-conventional

# Sentry Build Plugin
pnpm add -D @sentry/vite-plugin
```

> **Note:** pnpm may require you to explicitly allow build scripts for certain packages. Add these to `package.json` if prompted:
>
> ```json
> "pnpm": {
>   "onlyBuiltDependencies": ["esbuild", "msw", "@sentry/cli"]
> }
> ```

### 3. Initialize Tools

```bash
# Initialize shadcn/ui
pnpm dlx shadcn@latest init

# Add common shadcn/ui components
pnpm dlx shadcn@latest add button input form card select textarea checkbox

# Initialize Playwright
pnpm dlx playwright install

# Initialize Husky (requires git — run `git init` first)
pnpm dlx husky init
```

> **Note:** `shadcn init` is interactive and can't be scripted easily. As an alternative, manually create `components.json`, `src/index.css` (with Tailwind + CSS variables), and `src/lib/utils.ts` (with the `cn()` helper) first, then run `shadcn add` for individual components.

### 4. File Creation Order

After scaffolding and installing dependencies, create files in this order to avoid import errors:

1. **Config files first** (no internal dependencies)
   - `vite.config.ts`
   - `tsconfig.json` + `tsconfig.node.json`
   - `eslint.config.js`
   - `prettier.config.js`
   - `commitlint.config.js`
   - `components.json`
   - `.gitignore`
   - `.env.example` + `.env.development`

2. **Foundation layer** (depended on by everything else)
   - `src/vite-env.d.ts` (auto-generated by Vite, just verify it exists)
   - `src/index.css` (Tailwind + CSS variables)
   - `src/lib/utils.ts` (`cn()` helper)
   - `src/types/index.ts` (shared TypeScript types)
   - `src/types/env.d.ts` (environment variable types)

3. **Stores and API** (depend on types)
   - `src/stores/authStore.ts`
   - `src/stores/uiStore.ts`
   - `src/api/client.ts` (depends on authStore)
   - `src/api/queries/*.ts`
   - `src/api/mutations/*.ts`

4. **i18n and validation** (standalone utilities)
   - `src/lib/i18n.ts`
   - `src/types/i18next.d.ts`
   - `public/locales/en/*.json`
   - `src/lib/validators/*.ts`

5. **Sentry**
   - `src/instrument.ts`

6. **UI components** (depend on utils + ui library)
   - `src/components/ui/*` (added via `shadcn add`)
   - `src/components/layouts/RootLayout.tsx`
   - `src/components/layouts/AuthLayout.tsx`
   - `src/components/forms/*.tsx`
   - `src/components/features/**/*`

7. **Routes** (depend on everything above)
   - `src/routes/__root.tsx`
   - `src/routes/_public/route.tsx`
   - `src/routes/_authenticated/route.tsx`
   - Remaining route files

8. **Entry point**
   - `src/main.tsx` (imports instrument, i18n, router, query client)

9. **Testing** (last, depends on app code)
   - `src/test/setup.ts`
   - `src/test/test-utils.tsx`
   - `src/test/mocks/handlers.ts`
   - `src/test/mocks/server.ts`
   - `src/test/mocks/browser.ts`
   - `playwright.config.ts`
   - `.husky/pre-commit` + `.husky/commit-msg`

> **Important:** Run `pnpm dev` after step 7 (routes). TanStack Router's file-based routing requires the dev server to run at least once to generate `routeTree.gen.ts`. Without this, imports of the generated route tree will fail. You can stop the server once the file appears.

---

## Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    // IMPORTANT: TanStack Router plugin must come BEFORE react plugin
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    // Sentry plugin must be LAST and only in production
    mode === 'production' &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          filesToDeleteAfterUpload: ['./dist/**/*.map'],
        },
      }),
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://localhost:5001', // .NET API
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    sourcemap: 'hidden', // Generate sourcemaps but don't expose in production
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },

  // Vitest configuration (inline, no separate vitest.config.ts needed)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts'],
    },
  },
}))
```

---

## TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strict Type-Checking */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

> **Caution — `exactOptionalPropertyTypes`:** Do not enable this option. It is incompatible with react-hook-form + `@hookform/resolvers/zod` due to `boolean | undefined` vs `boolean` type mismatches in form resolver types.

> **Caution — `include` scope:** Only include `"src"` here. Including `vite.config.ts` or `eslint.config.js` in both this config and `tsconfig.node.json` causes composite build errors (`Output file has not been built from source`). Those files are covered by `tsconfig.node.json` separately.

```json
// tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

---

## TanStack Router

### Router Configuration

```typescript
// src/main.tsx
import './instrument' // Sentry must be first
import './lib/i18n' // i18n initialization
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/authStore'
import { routeTree } from './routeTree.gen' // Auto-generated
import './index.css'

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Create router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    // Auth context is provided at render time via <App /> below
    auth: undefined as unknown as {
      isAuthenticated: boolean
      user: { id: string; name: string } | null
    },
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Wrap RouterProvider to inject live auth state into router context
function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  return (
    <RouterProvider
      router={router}
      context={{ auth: { isAuthenticated, user } }}
    />
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
```

### Root Route

```typescript
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HelmetProvider } from 'react-helmet-async'
import * as Sentry from '@sentry/react'

interface RouterContext {
  queryClient: QueryClient
  auth: {
    isAuthenticated: boolean
    user: { id: string; name: string } | null
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <HelmetProvider>
      <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Outlet />
        </div>
        {import.meta.env.DEV && (
          <>
            <TanStackRouterDevtools position="bottom-right" />
            <ReactQueryDevtools initialIsOpen={false} />
          </>
        )}
      </Sentry.ErrorBoundary>
    </HelmetProvider>
  )
}

function ErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">
          Please refresh the page or try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}
```

### Authenticated Layout Group

```typescript
// src/routes/_authenticated/route.tsx
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { AuthLayout } from '@/components/layouts/AuthLayout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: () => (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  ),
})
```

### Route with Data Loading

```typescript
// src/routes/_authenticated/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { fetchDashboardData } from '@/api/queries/dashboard'

// Define query options outside component for reuse
const dashboardQueryOptions = queryOptions({
  queryKey: ['dashboard'],
  queryFn: fetchDashboardData,
})

export const Route = createFileRoute('/_authenticated/dashboard')({
  // Preload data before rendering
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQueryOptions),
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation('dashboard')
  // Data is guaranteed to exist due to loader
  const { data } = useSuspenseQuery(dashboardQueryOptions)

  return (
    <>
      <Helmet>
        <title>{t('pageTitle')} | App Name</title>
      </Helmet>
      <div className="container py-8">
        <h1 className="text-3xl font-bold">{t('welcome')}</h1>
        {/* Dashboard content using data */}
      </div>
    </>
  )
}
```

### Dynamic Route Parameters

```typescript
// src/routes/users/$userId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query'
import { fetchUser } from '@/api/queries/users'

const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
  })

export const Route = createFileRoute('/users/$userId')({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(userQueryOptions(params.userId)),
  component: UserPage,
})

function UserPage() {
  const { userId } = Route.useParams()
  const { data: user } = useSuspenseQuery(userQueryOptions(userId))

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

### File Naming Conventions

| Pattern         | Example                  | URL                    |
| --------------- | ------------------------ | ---------------------- |
| Static route    | `about.tsx`              | `/about`               |
| Index route     | `index.tsx`              | `/` (parent path)      |
| Dynamic param   | `$userId.tsx`            | `/users/:userId`       |
| Nested route    | `posts.$postId.edit.tsx` | `/posts/:postId/edit`  |
| Pathless layout | `_authenticated/`        | No URL change          |
| Catch-all       | `$.tsx`                  | Matches remaining path |
| Ignored file    | `-utils.ts`              | Not a route            |

---

## TanStack Query

### Query Client Setup

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as { status: number }).status
          if (status >= 400 && status < 500) return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: import.meta.env.PROD,
    },
    mutations: {
      retry: false,
    },
  },
})
```

### API Client

```typescript
// src/api/client.ts
import { useAuthStore } from '@/stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...init } = options
  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  const token = useAuthStore.getState().token

  // Use Headers constructor instead of object spread to avoid
  // @typescript-eslint/no-misused-spread on the Headers type
  const headers = new Headers({
    'Content-Type': 'application/json',
  })
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (init.headers) {
    new Headers(init.headers).forEach((value, key) => {
      headers.set(key, value)
    })
  }

  const response = await fetch(url, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null)
    throw new ApiError(response.status, response.statusText, data)
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}
```

### Query Definitions

```typescript
// src/api/queries/users.ts
import { queryOptions } from '@tanstack/react-query'
import { api } from '../client'
import type { User } from '@/types'

export const usersQueryOptions = queryOptions({
  queryKey: ['users'],
  queryFn: () => api.get<User[]>('/users'),
})

export const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['users', userId],
    queryFn: () => api.get<User>(`/users/${userId}`),
    enabled: !!userId,
  })

export const userPostsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['users', userId, 'posts'],
    queryFn: () => api.get<Post[]>(`/users/${userId}/posts`),
    enabled: !!userId,
  })
```

### Mutation Definitions

```typescript
// src/api/mutations/users.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'
import type { User, CreateUserInput, UpdateUserInput } from '@/types'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserInput) => api.post<User>('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateUserInput & { id: string }) =>
      api.put<User>(`/users/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

---

## Tailwind CSS + shadcn/ui

### Tailwind Configuration

```css
/* src/index.css */
@import 'tailwindcss';

/* shadcn/ui CSS variables */
@layer base {
  :root {
    --background: oklch(100% 0 0);
    --foreground: oklch(3.9% 0 0);
    --card: oklch(100% 0 0);
    --card-foreground: oklch(3.9% 0 0);
    --popover: oklch(100% 0 0);
    --popover-foreground: oklch(3.9% 0 0);
    --primary: oklch(9% 0 0);
    --primary-foreground: oklch(98% 0 0);
    --secondary: oklch(96.1% 0 0);
    --secondary-foreground: oklch(9% 0 0);
    --muted: oklch(96.1% 0 0);
    --muted-foreground: oklch(45.1% 0 0);
    --accent: oklch(96.1% 0 0);
    --accent-foreground: oklch(9% 0 0);
    --destructive: oklch(50.3% 0.218 27.33);
    --destructive-foreground: oklch(98% 0 0);
    --border: oklch(89.8% 0 0);
    --input: oklch(89.8% 0 0);
    --ring: oklch(3.9% 0 0);
    --radius: 0.5rem;
  }

  .dark {
    --background: oklch(3.9% 0 0);
    --foreground: oklch(98% 0 0);
    --card: oklch(3.9% 0 0);
    --card-foreground: oklch(98% 0 0);
    --popover: oklch(3.9% 0 0);
    --popover-foreground: oklch(98% 0 0);
    --primary: oklch(98% 0 0);
    --primary-foreground: oklch(9% 0 0);
    --secondary: oklch(14.9% 0 0);
    --secondary-foreground: oklch(98% 0 0);
    --muted: oklch(14.9% 0 0);
    --muted-foreground: oklch(63.9% 0 0);
    --accent: oklch(14.9% 0 0);
    --accent-foreground: oklch(98% 0 0);
    --destructive: oklch(50.3% 0.218 27.33);
    --destructive-foreground: oklch(98% 0 0);
    --border: oklch(14.9% 0 0);
    --input: oklch(14.9% 0 0);
    --ring: oklch(83.1% 0 0);
  }
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### shadcn/ui Configuration

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Layout Components

```typescript
// src/components/layouts/RootLayout.tsx
import { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

interface RootLayoutProps {
  children: ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  const { t } = useTranslation('common')

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="container flex h-16 items-center gap-6">
          <Link to="/" className="text-lg font-semibold">
            {t('appName')}
          </Link>
          <Link
            to="/dashboard"
            className="text-muted-foreground hover:text-foreground"
          >
            {t('navigation.dashboard')}
          </Link>
          <Link
            to="/settings"
            className="text-muted-foreground hover:text-foreground"
          >
            {t('navigation.settings')}
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
```

```typescript
// src/components/layouts/AuthLayout.tsx
import { ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation('common')
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-lg font-semibold">
              {t('appName')}
            </Link>
            <Link
              to="/dashboard"
              className="text-muted-foreground hover:text-foreground"
            >
              {t('navigation.dashboard')}
            </Link>
            <Link
              to="/settings"
              className="text-muted-foreground hover:text-foreground"
            >
              {t('navigation.settings')}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              {t('navigation.logout')}
            </Button>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
```

### Utility Functions

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Zustand State Management

### Auth Store

```typescript
// src/stores/authStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
}

interface AuthActions {
  setAuth: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

type AuthStore = AuthState & AuthActions

// NOTE: Only store token in memory for security
// The refresh token should be in an HttpOnly cookie
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        user: null,
        isAuthenticated: false,

        setAuth: (token, user) =>
          set({ token, user, isAuthenticated: true }, false, 'auth/setAuth'),

        logout: () =>
          set(
            { token: null, user: null, isAuthenticated: false },
            false,
            'auth/logout'
          ),

        updateUser: (userData) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...userData } : null,
            }),
            false,
            'auth/updateUser'
          ),
      }),
      {
        name: 'auth-storage',
        // Only persist user, not token (for security)
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: 'AuthStore' }
  )
)
```

### UI Store

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  locale: string
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: UIState['theme']) => void
  setLocale: (locale: string) => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: 'system',
        locale: 'en',

        toggleSidebar: () =>
          set(
            (state) => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            'ui/toggleSidebar'
          ),

        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }, false, 'ui/setSidebarOpen'),

        setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),

        setLocale: (locale) => set({ locale }, false, 'ui/setLocale'),
      }),
      { name: 'ui-storage' }
    ),
    { name: 'UIStore' }
  )
)
```

### Store Usage Guidelines

| State Type              | Use                 |
| ----------------------- | ------------------- |
| API/Server data         | TanStack Query      |
| User session            | Zustand (authStore) |
| UI preferences          | Zustand (uiStore)   |
| Form data before submit | React Hook Form     |
| URL state               | TanStack Router     |

**Important:** Never store server data in Zustand. Use TanStack Query for all API data to avoid sync issues.

---

## React Hook Form + Zod

### Zod Schemas

```typescript
// src/lib/validators/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  // Zod v4: use z.email() (top-level), not z.string().email() (deprecated)
  email: z
    .email({ error: 'Invalid email address' })
    .min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
  // Use z.boolean() (not .default(false)) — default() creates input/output
  // type mismatch that breaks react-hook-form resolver types.
  // Set the default via useForm({ defaultValues }) instead.
  rememberMe: z.boolean(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name is required' })
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(50, { message: 'Name must be under 50 characters' }),
    email: z
      .email({ error: 'Invalid email address' })
      .min(1, { message: 'Email is required' }),
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain an uppercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain a number' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
```

> **Zod v4 breaking change:** `z.string().email()` is deprecated. Use `z.email()` as a top-level validator instead. Note that `z.email()` validates format even for empty strings — an empty string fails format validation ("Invalid email address") before `.min(1)` runs. Design your error messages accordingly.

### Form Component with shadcn/ui

```typescript
// src/components/forms/LoginForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { loginSchema, type LoginFormData } from '@/lib/validators/auth'

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>
  isLoading?: boolean
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const { t } = useTranslation('auth')

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0 font-normal">
                {t('rememberMe')}
              </FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('signingIn') : t('signIn')}
        </Button>
      </form>
    </Form>
  )
}
```

### Login Route with Error Handling

```typescript
// src/routes/_public/login.tsx
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/forms/LoginForm'
import { useLogin } from '@/api/mutations/auth'
import { ApiError } from '@/api/client'

export const Route = createFileRoute('/_public/login')({
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const login = useLogin()

  // Use mutate() with onSuccess callback — not mutateAsync with try/catch.
  // This is the idiomatic TanStack Query pattern: the mutation's error state
  // is automatically tracked via login.error, and navigation only fires on success.
  const handleSubmit = (data: { email: string; password: string }) => {
    login.mutate(data, {
      onSuccess: () => {
        void navigate({ to: '/dashboard' })
      },
    })
  }

  function getErrorMessage(error: Error): string {
    if (
      error instanceof ApiError &&
      error.data != null &&
      typeof error.data === 'object' &&
      'message' in error.data
    ) {
      return (error.data as { message: string }).message
    }
    return t('loginFailed')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('signIn')}</CardTitle>
          <CardDescription>{t('emailPlaceholder')}</CardDescription>
        </CardHeader>
        <CardContent>
          {login.error && (
            <div
              role="alert"
              className="bg-destructive/10 text-destructive border-destructive/20 mb-4 rounded-md border px-4 py-3 text-sm"
            >
              {getErrorMessage(login.error)}
            </div>
          )}
          <LoginForm onSubmit={handleSubmit} isLoading={login.isPending} />
        </CardContent>
      </Card>
    </div>
  )
}
```

> **Pattern:** Prefer `mutate()` with an `onSuccess` callback over `mutateAsync` with `try/catch`. With `mutate()`, TanStack Query automatically populates `mutation.error` on failure, so you can render error UI declaratively via `login.error` without manual state management. The `ApiError` class (from `src/api/client.ts`) carries the HTTP status and parsed response body for structured error messages.

---

## Internationalization (i18n)

### i18n Configuration

```typescript
// src/lib/i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'de'],
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // React already handles escaping
    },

    // Namespace configuration
    ns: ['common', 'auth', 'dashboard', 'validation'],
    defaultNS: 'common',

    // Backend configuration
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Detection configuration
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
    },

    // React-specific
    react: {
      useSuspense: true,
    },
  })

export default i18n
```

### TypeScript Type Safety

```typescript
// src/types/i18next.d.ts
import 'i18next'

// Import translation types
import type common from '../../public/locales/en/common.json'
import type auth from '../../public/locales/en/auth.json'
import type dashboard from '../../public/locales/en/dashboard.json'
import type validation from '../../public/locales/en/validation.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      auth: typeof auth
      dashboard: typeof dashboard
      validation: typeof validation
    }
  }
}
```

### Translation Files

```json
// public/locales/en/common.json
{
  "appName": "My Application",
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "settings": "Settings",
    "logout": "Log out"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading..."
  },
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "notFound": "Page not found",
    "unauthorized": "You are not authorized to view this page"
  }
}
```

```json
// public/locales/en/auth.json
{
  "signIn": "Sign In",
  "signUp": "Sign Up",
  "signingIn": "Signing in...",
  "email": "Email",
  "emailPlaceholder": "Enter your email",
  "password": "Password",
  "passwordPlaceholder": "Enter your password",
  "rememberMe": "Remember me",
  "forgotPassword": "Forgot password?",
  "noAccount": "Don't have an account?",
  "hasAccount": "Already have an account?",
  "loginFailed": "Unable to sign in. Please check your credentials and try again."
}
```

### Using Translations

```typescript
// Using the hook
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation('common')
  const { t: tAuth } = useTranslation('auth')

  return (
    <div>
      <h1>{t('appName')}</h1>
      <button>{tAuth('signIn')}</button>
    </div>
  )
}

// Using the Trans component for complex content
import { Trans } from 'react-i18next'

function TermsNotice() {
  return (
    <Trans i18nKey="common:termsNotice" components={{ link: <a href="/terms" /> }}>
      By signing up, you agree to our <link>Terms of Service</link>
    </Trans>
  )
}
```

---

## TypeScript Types

```typescript
// src/types/index.ts
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role?: 'admin' | 'user'
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: 'admin' | 'user'
}

// API response wrappers
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
}
```

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />
```

> **Note:** `vite-env.d.ts` is auto-generated by `pnpm create vite`. It provides type definitions for Vite-specific features like `import.meta.env` and static asset imports. Don't delete it.

---

## Testing Stack

### Vitest Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import * as matchers from 'vitest-axe/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, expect, vi } from 'vitest'
import { server } from './mocks/server'

// vitest-axe: Register matchers manually.
// Do NOT use `import 'vitest-axe/extend-expect'` — it registers on the
// old Vi namespace and is incompatible with vitest v4 ("Invalid Chai property").
expect.extend(matchers)

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Reset handlers after each test
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Close MSW server after all tests
afterAll(() => {
  server.close()
})

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver — must use a class, not vi.fn().mockImplementation().
// In vitest v4, vi.fn() does not create a proper constructor (throws
// "ResizeObserver is not a constructor").
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
```

You also need a type declaration file for vitest-axe matchers:

```typescript
// src/types/vitest-axe.d.ts
import 'vitest'
import type { AxeMatchers } from 'vitest-axe/matchers'

declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
```

### Test Utilities

```typescript
// src/test/test-utils.tsx
import { type ReactElement, type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Create a STANDALONE i18n instance for tests with inline translations.
// Do NOT import the real i18n config — it uses HttpBackend + useSuspense,
// which causes components to suspend indefinitely waiting for HTTP translations
// that never arrive in the test environment (empty <body>).
const testI18n = i18n.createInstance()
void testI18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'auth', 'dashboard', 'validation'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  resources: {
    en: {
      common: {
        appName: 'My Application',
        navigation: {
          home: 'Home',
          dashboard: 'Dashboard',
          settings: 'Settings',
          logout: 'Log out',
        },
        actions: { save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', loading: 'Loading...' },
        errors: { generic: 'Something went wrong.', notFound: 'Page not found', unauthorized: 'Unauthorized' },
      },
      auth: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signingIn: 'Signing in...',
        email: 'Email',
        emailPlaceholder: 'Enter your email',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        loginFailed: 'Unable to sign in. Please check your credentials and try again.',
      },
      dashboard: { pageTitle: 'Dashboard', welcome: 'Welcome back' },
      validation: {},
    },
  },
})

// Create a fresh query client for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

interface WrapperProps {
  children: ReactNode
}

function AllTheProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={testI18n}>
        {children}
      </I18nextProvider>
    </QueryClientProvider>
  )
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  }
}

export * from '@testing-library/react'
export { customRender as render }
```

### MSW Handlers

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

const API_URL = '/api'

export const handlers = [
  // Auth handlers
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: { id: '1', name: 'Test User', email: body.email },
      })
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      email: string
      password: string
    }

    if (!body.name || !body.email || !body.password) {
      return HttpResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: { id: '1', name: body.name, email: body.email },
    })
  }),

  // Dashboard handlers
  http.get(`${API_URL}/dashboard`, () => {
    return HttpResponse.json({
      totalUsers: 42,
      totalPosts: 128,
      recentActivity: [
        {
          id: '1',
          type: 'user_registered',
          description: 'New user registered',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'post_created',
          description: 'New post published',
          createdAt: new Date().toISOString(),
        },
      ],
    })
  }),

  // User handlers
  http.get(`${API_URL}/users`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'user',
        createdAt: '2025-01-15T00:00:00.000Z',
        updatedAt: '2025-01-15T00:00:00.000Z',
      },
    ])
  }),

  http.get(`${API_URL}/users/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    })
  }),

  http.get(`${API_URL}/users/:userId/posts`, ({ params }) => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'First Post',
        content: 'This is the first post content.',
        authorId: params.userId as string,
        createdAt: '2025-02-01T00:00:00.000Z',
        updatedAt: '2025-02-01T00:00:00.000Z',
      },
      {
        id: '2',
        title: 'Second Post',
        content: 'This is the second post content.',
        authorId: params.userId as string,
        createdAt: '2025-02-10T00:00:00.000Z',
        updatedAt: '2025-02-10T00:00:00.000Z',
      },
    ])
  }),

  http.post(`${API_URL}/users`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      email: string
      password: string
      role?: 'admin' | 'user'
    }

    return HttpResponse.json(
      {
        id: '3',
        name: body.name,
        email: body.email,
        role: body.role ?? 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  }),

  http.put(`${API_URL}/users/:id`, async ({ params, request }) => {
    const body = (await request.json()) as {
      name?: string
      email?: string
      role?: 'admin' | 'user'
    }

    return HttpResponse.json({
      id: params.id,
      name: body.name ?? 'John Doe',
      email: body.email ?? 'john@example.com',
      role: body.role ?? 'admin',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    })
  }),

  http.delete(`${API_URL}/users/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
```

```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### MSW Browser Handler (Dev Mode Mocking)

```typescript
// src/test/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

To enable API mocking during local development, conditionally start the worker in your entry point:

```typescript
// src/main.tsx (add before the root render)
async function enableMocking() {
  if (!import.meta.env.DEV) return

  // Only enable if VITE_MSW=true (opt-in, not default)
  if (import.meta.env.VITE_MSW !== 'true') return

  const { worker } = await import('./test/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

void enableMocking().then(() => {
  ReactDOM.createRoot(rootElement)
    .render
    // ... app JSX
    ()
})
```

> **Usage:** Run `pnpm dev:mock` (or `VITE_MSW=true pnpm dev`) to enable dev-mode mocking. This is useful when the backend API is unavailable.

### Component Test Example

```typescript
// src/components/forms/LoginForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { axe } from 'vitest-axe'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  // Explicit type — onSubmit returns Promise<void>
  const mockOnSubmit = vi.fn<(data: unknown) => Promise<void>>()

  beforeEach(() => {
    mockOnSubmit.mockClear()
    // Must return a Promise since onSubmit is async.
    // Without this, react-hook-form may silently swallow the submission.
    mockOnSubmit.mockResolvedValue(undefined)
  })

  it('renders all form fields', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const { user } = render(<LoginForm onSubmit={mockOnSubmit} />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      // NOTE: z.email() validates format even for empty strings, so an empty
      // email field produces "Invalid email address" (not "Email is required")
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const { user } = render(<LoginForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      // form.handleSubmit passes (data, event) — use expect.anything() for
      // the second argument (React SyntheticEvent)
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false,
        }),
        expect.anything()
      )
    })
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(<LoginForm onSubmit={mockOnSubmit} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Playwright E2E Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
})
```

### E2E Test Example

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can login successfully', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('[role="alert"]')).toContainText(
      'Invalid credentials'
    )
    await expect(page).toHaveURL('/login')
  })

  test('login form is accessible', async ({ page }) => {
    await page.goto('/login')

    // Check for proper labeling
    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/password/i)

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()

    // Check focus management
    await emailInput.focus()
    await expect(emailInput).toBeFocused()
  })
})
```

---

## ESLint + Prettier

### ESLint Flat Config

```javascript
// eslint.config.js
import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      '*.gen.ts',
      'src/routeTree.gen.ts',
      'public',
      'e2e/',
      'playwright.config.ts',
      'vite.config.ts',
      'src/components/ui/**', // shadcn/ui generated — has deprecation warnings
    ],
  },

  // Base JavaScript config
  eslint.configs.recommended,

  // TypeScript files only — type-checked configs MUST be scoped to TS files.
  // Spreading strictTypeChecked at the top level applies type-aware rules to
  // .js config files (prettier.config.js, etc.) which causes parse errors.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,

      // Accessibility rules
      ...jsxA11y.flatConfigs.recommended.rules,

      // TypeScript specific overrides
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Test files — relax strict rules
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'src/test/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Prettier must be last to override formatting rules
  prettier
)
```

> **Critical:** Use `tseslint.config()` (not `defineConfig` from `eslint/config`) and place `strictTypeChecked`/`stylisticTypeChecked` inside `extends` within a `files: ['**/*.{ts,tsx}']` block. Spreading them at the top level applies type-aware rules to all files, including JS config files, which causes `Error while loading rule '@typescript-eslint/await-thenable'` on files like `prettier.config.js`.

> **shadcn/ui components** are auto-generated and use patterns like the deprecated `ElementRef` type. Add `src/components/ui/**` to ignores rather than fixing generated code.

### Prettier Configuration

```javascript
// prettier.config.js
/** @type {import("prettier").Config} */
export default {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 80,
  plugins: ['prettier-plugin-tailwindcss'],
}
```

---

## Git Hooks

### Husky Setup

```bash
# Initialize Husky
pnpm dlx husky init

# The init command creates .husky directory and updates package.json
```

```bash
# .husky/pre-commit
pnpm lint-staged
```

```bash
# .husky/commit-msg
pnpm dlx commitlint --edit
```

### Lint-Staged Configuration

```json
// package.json (partial)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### Commitlint Configuration

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Code style (formatting)
        'refactor', // Code refactoring
        'perf', // Performance
        'test', // Tests
        'chore', // Build, dependencies
        'ci', // CI/CD
        'revert', // Revert commit
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
  },
}
```

### Commit Message Format

```
type(scope): subject

body

footer
```

Examples:

```
feat(auth): add jwt token refresh mechanism
fix(api): resolve race condition in data fetching
docs(readme): update installation instructions
refactor(stores): simplify auth store logic
```

---

## Error Monitoring (Sentry)

### Sentry Initialization

```typescript
// src/instrument.ts
import * as Sentry from '@sentry/react'

const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

Sentry.init({
  dsn: isProd ? import.meta.env.VITE_SENTRY_DSN : undefined,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
  debug: isDev,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
      maskAllInputs: true,
    }),
  ],

  // Performance monitoring
  tracesSampleRate: isProd ? 0.1 : 1.0,

  // Session replay
  replaysSessionSampleRate: isProd ? 0.05 : 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filter events before sending
  beforeSend(event, hint) {
    // Don't send events in development
    if (isDev) return null

    // Filter out specific errors if needed
    const error = hint.originalException
    if (error instanceof Error) {
      // Example: ignore network errors
      if (error.message.includes('Network request failed')) {
        return null
      }
    }

    return event
  },
})
```

### Setting User Context

```typescript
// After successful login
import * as Sentry from '@sentry/react'

function onLoginSuccess(user: User) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  })

  Sentry.setTags({
    subscription_tier: user.tier,
    account_type: user.type,
  })
}

// On logout
function onLogout() {
  Sentry.setUser(null)
}
```

---

## Environment Configuration

### .gitignore

```bash
# .gitignore
node_modules
dist
dist-ssr

# Environment files (commit .env.example only)
.env
.env.local
.env.development
.env.production
.env.sentry-build-plugin

# Editor
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage
playwright-report
test-results

# MSW (generated service worker)
public/mockServiceWorker.js

# Build/Cache
*.tsbuildinfo
*.local

# Sentry
.sentryclirc
```

### Environment Files

```bash
# .env.example (commit this)
VITE_API_URL=
VITE_SENTRY_DSN=
VITE_APP_VERSION=

# .env.development (local development)
VITE_API_URL=http://localhost:5001/api
VITE_APP_VERSION=dev

# .env.production (production build)
VITE_API_URL=https://api.myapp.com
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_APP_VERSION=1.0.0

# .env.sentry-build-plugin (for CI/CD, do not commit)
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### Type-Safe Environment Variables

```typescript
// src/types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## Package Dependencies

```json
// package.json
{
  "name": "my-enterprise-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "dev:mock": "VITE_MSW=true vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "prepare": "husky"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-router": "^1.x",
    "@tanstack/react-query": "^5.x",
    "zustand": "^5.x",
    "react-hook-form": "^7.x",
    "zod": "^4.x",
    "@hookform/resolvers": "^5.x",
    "i18next": "^25.x",
    "react-i18next": "^15.x",
    "i18next-http-backend": "^3.x",
    "i18next-browser-languagedetector": "^8.x",
    "@sentry/react": "^9.x",
    "react-helmet-async": "^2.x",
    "clsx": "^2.x",
    "tailwind-merge": "^3.x",
    "class-variance-authority": "^0.7.x",
    "lucide-react": "^0.x",
    "tw-animate-css": "^1.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^19.x",
    "@types/react-dom": "^19.x",
    "@types/node": "^22.x",
    "vite": "^7.x",
    "@vitejs/plugin-react": "^4.x",
    "@tanstack/router-plugin": "^1.x",
    "@tanstack/react-router-devtools": "^1.x",
    "@tanstack/react-query-devtools": "^5.x",
    "tailwindcss": "^4.x",
    "@tailwindcss/vite": "^4.x",
    "vitest": "^4.x",
    "jsdom": "^26.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/user-event": "^14.x",
    "vitest-axe": "^1.x",
    "@playwright/test": "^1.x",
    "msw": "^2.x",
    "eslint": "^9.x",
    "@eslint/js": "^9.x",
    "typescript-eslint": "^8.x",
    "eslint-plugin-react-hooks": "^5.x",
    "eslint-plugin-jsx-a11y": "^6.x",
    "eslint-config-prettier": "^10.x",
    "globals": "^15.x",
    "prettier": "^3.x",
    "prettier-plugin-tailwindcss": "^0.x",
    "husky": "^9.x",
    "lint-staged": "^15.x",
    "@commitlint/cli": "^19.x",
    "@commitlint/config-conventional": "^19.x",
    "@sentry/vite-plugin": "^3.x"
  },
  "msw": {
    "workerDirectory": ["public"]
  },
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild", "msw", "@sentry/cli"]
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

> **Note:** The version ranges above reflect what was tested during scaffold (Jan 2026). Key version jumps from earlier docs: Vite 6→7, Zod 3→4, Vitest 2→4, Zustand 4→5. These major versions introduced breaking changes documented in the Gotchas section.

---

## Gotchas & Best Practices

### TanStack Router

| Gotcha                        | Solution                                                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Plugin order matters          | TanStack Router plugin must come **before** React plugin                                                                                  |
| Route tree not generating     | Run `pnpm dev` at least once — TanStack Router generates `routeTree.gen.ts` on first dev server start                                     |
| `throw redirect()` lint error | `redirect()` is not an Error subclass but is designed to be thrown. Add `// eslint-disable-next-line @typescript-eslint/only-throw-error` |
| Auth redirects not working    | Use `throw redirect()` in `beforeLoad`, not return                                                                                        |
| Data not updating             | Always use `useSuspenseQuery` in components, not just loader                                                                              |
| Deprecated devtools package   | Use `@tanstack/react-router-devtools`, not `@tanstack/router-devtools` (deprecated wrapper)                                               |

### TanStack Query

| Gotcha                            | Solution                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `ensureQueryData` never refetches | It only seeds cache; always subscribe with hooks                                                              |
| Request waterfalls                | Use `Promise.all()` for parallel fetches in loader                                                            |
| Stale data after mutation         | Call `invalidateQueries` in mutation's `onSuccess`                                                            |
| `mutateAsync` swallows errors     | Prefer `mutate()` with `onSuccess` callback for navigation/side-effects; avoids needing try/catch boilerplate |

### Zustand

| Gotcha                 | Solution                                                       |
| ---------------------- | -------------------------------------------------------------- |
| Token storage security | Store access token in memory, refresh token in HttpOnly cookie |
| Unnecessary re-renders | Use selectors: `useStore((s) => s.value)` not `useStore()`     |
| Server data in Zustand | Never do this; use TanStack Query for server state             |

### Zod v4

| Gotcha                                  | Solution                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `z.string().email()` deprecated         | Use `z.email()` top-level validator instead                                                             |
| `z.email()` validates empty strings     | An empty string fails format validation ("Invalid email address") before `.min(1)` runs                 |
| `z.boolean().default(false)` breaks RHF | Creates input/output type mismatch. Use `z.boolean()` and set defaults via `useForm({ defaultValues })` |

### react-hook-form

| Gotcha                                    | Solution                                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `exactOptionalPropertyTypes` incompatible | Disable this tsconfig option — RHF + zod resolver types have `boolean \| undefined` vs `boolean` mismatches         |
| `handleSubmit` passes 2 args              | `onSubmit` receives `(data, event)` — account for the SyntheticEvent in tests with `expect.anything()`              |
| Mock onSubmit not called                  | If `onSubmit` returns `Promise<void>`, mock must also return a Promise: `mockOnSubmit.mockResolvedValue(undefined)` |
| `onSubmit` type too strict                | Use `void \| Promise<void>` return type to support both sync (`mutate`) and async (`mutateAsync`) callers           |

### Tailwind v4

| Gotcha                         | Solution                                                          |
| ------------------------------ | ----------------------------------------------------------------- |
| No `tailwind.config.ts` needed | Tailwind v4 uses CSS-first config via `@theme` in `index.css`     |
| `@apply` in component files    | Still works, but prefer utility classes directly in JSX           |
| Plugin compatibility           | Some v3 plugins aren't compatible; check for v4-specific versions |

### shadcn/ui

| Gotcha                                | Solution                                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Components not styling                | Ensure `@import "tailwindcss"` is in `index.css` and Vite plugin is loaded                               |
| Path alias issues                     | Must match in both `tsconfig.json` and `vite.config.ts`                                                  |
| Form validation not showing           | Ensure `<FormMessage />` is inside `<FormField>`                                                         |
| `shadcn init` is interactive          | Create `components.json`, `index.css`, and `lib/utils.ts` manually, then use `shadcn add`                |
| ESLint errors in generated components | Add `src/components/ui/**` to ESLint ignores — generated code uses deprecated patterns like `ElementRef` |

### Testing

| Gotcha                                         | Solution                                                                                                                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MSW interfering with E2E                       | Disable MSW when running Playwright tests                                                                                                                         |
| Tests timing out                               | Use `waitFor` for async operations, increase timeout if needed                                                                                                    |
| axe-core false positives                       | Configure rules for known exceptions                                                                                                                              |
| `vitest-axe/extend-expect` broken in vitest v4 | Use `import * as matchers from 'vitest-axe/matchers'` + `expect.extend(matchers)` instead                                                                         |
| `toHaveNoViolations` type error                | Create `src/types/vitest-axe.d.ts` with module augmentation for vitest's `Assertion` interface                                                                    |
| `ResizeObserver is not a constructor`          | Use class-based mock in setup: `global.ResizeObserver = class ResizeObserver { ... }` — `vi.fn().mockImplementation()` doesn't work as constructor in vitest v4   |
| Tests render empty `<body>` (i18n)             | Don't import the real i18n config in tests — it uses HttpBackend + useSuspense which suspends forever. Create a standalone i18n instance with inline translations |

### i18n

| Gotcha                       | Solution                                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Translations not loading     | Check `public/locales/` path and file structure                                                                                        |
| TypeScript key errors        | Create `i18next.d.ts` with `CustomTypeOptions`                                                                                         |
| Missing translations in prod | Ensure locales are in `public/` directory                                                                                              |
| Tests render empty body      | HttpBackend + `useSuspense: true` suspends forever in tests. Create a standalone i18n instance with inline translations for test-utils |

### ESLint

| Gotcha                                      | Solution                                                                                                                                                                                                        |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type-aware rules slow                       | Use `projectService: true` instead of explicit `project`                                                                                                                                                        |
| Conflict with Prettier                      | Ensure `eslint-config-prettier` is **last** in config array                                                                                                                                                     |
| Generated files causing errors              | Add `*.gen.ts` and `src/routeTree.gen.ts` to ignores                                                                                                                                                            |
| Type-checked rules crash on JS config files | **Critical:** Scope `strictTypeChecked`/`stylisticTypeChecked` to `files: ['**/*.{ts,tsx}']` via `extends` inside a `files` block. Spreading at top level applies type-aware rules to `prettier.config.js` etc. |
| `no-misused-spread` on `Headers`            | Use `new Headers()` constructor instead of spreading `headers` objects                                                                                                                                          |
| `vite.config.ts` / `e2e/` not in project    | Add to ignores — these files are outside the tsconfig project scope                                                                                                                                             |
| Use `tseslint.config()` not `defineConfig`  | The `eslint/config` `defineConfig` doesn't support `extends` in file blocks; use `tseslint.config()` instead                                                                                                    |

### TypeScript Configuration

| Gotcha                       | Solution                                                                                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `exactOptionalPropertyTypes` | Do not enable — incompatible with react-hook-form + zod resolver types                                                                                                              |
| `include` scope conflict     | Only include `"src"` in main `tsconfig.json`. Including `vite.config.ts` in both main and composite `tsconfig.node.json` causes `Output file has not been built from source` errors |
| Vite 7 project references    | Vite 7 generates `tsconfig.app.json` with project references. If your guide uses a flat structure, delete `tsconfig.app.json`                                                       |

### Sentry

| Gotcha                  | Solution                                                   |
| ----------------------- | ---------------------------------------------------------- |
| Source maps not working | Ensure `sourcemap: 'hidden'` and Sentry plugin is **last** |
| Too many events in dev  | Set `dsn: undefined` in development                        |
| Missing user context    | Call `Sentry.setUser()` after successful auth              |

---

## Quick Reference: State Management Decision Tree

```
Is it server data (from API)?
├── Yes → TanStack Query
│         • Caching, refetching, mutations
│         • queryKey for cache invalidation
│
└── No → Is it URL state?
         ├── Yes → TanStack Router
         │         • Search params, route params
         │
         └── No → Is it form input state?
                  ├── Yes → React Hook Form
                  │         • Form state, validation, submission
                  │
                  └── No → Is it global UI state?
                           ├── Yes → Zustand
                           │         • Theme, sidebar, modals
                           │
                           └── No → useState / useReducer
                                    • Local component state
```

---

## References

- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [typescript-eslint](https://typescript-eslint.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
