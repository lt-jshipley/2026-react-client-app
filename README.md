# my-app

An enterprise React application built with Vite, TypeScript, and a modern production stack.

## Tech Stack

### Core

| Technology     | Version | Notes                                                                                                                    |
| -------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| **React**      | 19      | Function components, hooks only                                                                                          |
| **TypeScript** | ~5.9    | Strict mode enabled. `noUncheckedIndexedAccess` on, `exactOptionalPropertyTypes` off (incompatible with react-hook-form) |
| **Vite**       | ^7.2    | Dev server on port 3000. Proxy forwards `/api` to `https://localhost:5001`                                               |

### Routing & Data Fetching

| Technology          | Version | Notes                                                                                                                                     |
| ------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **TanStack Router** | ^1.158  | File-based routing in `src/routes/`. Auto code-splitting enabled. Route tree auto-generated at `src/routeTree.gen.ts` on dev server start |
| **TanStack Query**  | ^5.90   | Server state and caching. 5-min default stale time. Queries defined in `src/api/queries/`, mutations in `src/api/mutations/`              |

### State Management

| Technology          | Version | Notes                                                                                                                               |
| ------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Zustand**         | ^5.0    | Client-only state. Two stores: `authStore` (token/user/session) and `uiStore` (theme/sidebar/locale). Devtools + persist middleware |
| **React Hook Form** | ^7.71   | Form state management with controlled components via shadcn/ui `<Form>` wrapper                                                     |

### Styling & UI

| Technology                   | Version | Notes                                                                                                                             |
| ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Tailwind CSS**             | ^4.1    | v4 uses CSS-first config (`@theme` block in `index.css`), no `tailwind.config.ts`. Uses `@tailwindcss/vite` plugin                |
| **shadcn/ui**                | —       | Component primitives in `src/components/ui/` (generated, not from npm). Config in `components.json`. Built on Radix UI + Tailwind |
| **Radix UI**                 | various | Accessible primitives (checkbox, label, select, slot) used by shadcn/ui                                                           |
| **class-variance-authority** | ^0.7    | Component variant styling (`cva()`)                                                                                               |
| **tailwind-merge**           | ^3.4    | Merge Tailwind classes without conflicts, exposed via `cn()` in `src/lib/utils.ts`                                                |
| **Lucide React**             | ^0.563  | Icon library                                                                                                                      |

### Forms & Validation

| Technology              | Version | Notes                                                                                                     |
| ----------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| **Zod**                 | ^4.3    | v4 breaking change: use `z.email()` top-level, not `z.string().email()`. Schemas in `src/lib/validators/` |
| **@hookform/resolvers** | ^5.2    | Bridges Zod schemas to React Hook Form                                                                    |

### Internationalization

| Technology                           | Version | Notes                                                                                                 |
| ------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------- |
| **i18next**                          | ^25.8   | Core i18n framework. Config in `src/lib/i18n.ts`                                                      |
| **react-i18next**                    | ^16.5   | React bindings. Uses `useSuspense: true` (requires standalone test instance with inline translations) |
| **i18next-http-backend**             | ^3.0    | Loads translation JSON from `public/locales/{lng}/{ns}.json` at runtime                               |
| **i18next-browser-languagedetector** | ^8.2    | Auto-detects user language from browser/cookie/localStorage                                           |

### Error Monitoring

| Technology              | Version | Notes                                                                                                                                                |
| ----------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **@sentry/react**       | ^10.38  | Error boundary, browser tracing, session replay. Initialized in `src/instrument.ts` (must be first import in `main.tsx`). DSN only set in production |
| **@sentry/vite-plugin** | ^4.9    | Uploads source maps during production build. Must be last Vite plugin                                                                                |

### Testing

| Technology                      | Version | Notes                                                                                                                                       |
| ------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vitest**                      | ^4.0    | Unit/integration tests. Config is inline in `vite.config.ts`. jsdom environment. Global setup in `src/test/setup.ts`                        |
| **@testing-library/react**      | ^16.3   | Component testing. Custom `render()` in `src/test/test-utils.tsx` wraps all providers (QueryClient, i18n)                                   |
| **@testing-library/user-event** | ^14.6   | Simulates real user interactions                                                                                                            |
| **@testing-library/jest-dom**   | ^6.9    | DOM assertion matchers (`toBeInTheDocument`, etc.)                                                                                          |
| **vitest-axe**                  | ^0.1    | Accessibility assertions. Matchers registered manually via `expect.extend()` (not `vitest-axe/extend-expect`, which is broken in vitest v4) |
| **MSW**                         | ^2.12   | Mock Service Worker. Intercepts API requests in tests (`src/test/mocks/server.ts`) and optionally in dev (`VITE_MSW=true`)                  |
| **Playwright**                  | ^1.58   | End-to-end tests in `e2e/`. Config in `playwright.config.ts`. Runs against dev server                                                       |

### Code Quality

| Technology                    | Version | Notes                                                                                                                                                   |
| ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ESLint**                    | ^9.39   | Flat config (`eslint.config.js`). Type-checked rules scoped to `**/*.{ts,tsx}` via `tseslint.config()`. `src/components/ui/**` ignored (generated code) |
| **typescript-eslint**         | ^8.46   | `strictTypeChecked` + `stylisticTypeChecked` rulesets                                                                                                   |
| **eslint-plugin-react-hooks** | ^7.0    | Enforces Rules of Hooks                                                                                                                                 |
| **eslint-plugin-jsx-a11y**    | ^6.10   | Accessibility lint rules for JSX                                                                                                                        |
| **eslint-config-prettier**    | ^10.1   | Disables ESLint rules that conflict with Prettier (must be last)                                                                                        |
| **Prettier**                  | ^3.8    | Code formatter with `prettier-plugin-tailwindcss` for class sorting                                                                                     |

### Git Hooks & Commits

| Technology          | Version | Notes                                                                                                         |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| **Husky**           | ^9.1    | Git hooks in `.husky/`. Pre-commit runs lint-staged, commit-msg runs commitlint                               |
| **lint-staged**     | ^16.2   | Runs ESLint + Prettier on staged `*.{ts,tsx}` files, Prettier on `*.{json,md,css}`                            |
| **@commitlint/cli** | ^20.4   | Enforces [Conventional Commits](https://www.conventionalcommits.org/) format (`feat:`, `fix:`, `docs:`, etc.) |

### Other

| Technology             | Version | Notes                                             |
| ---------------------- | ------- | ------------------------------------------------- |
| **react-helmet-async** | ^2.0    | `<head>` management for page titles and meta tags |
| **tw-animate-css**     | ^1.4    | Animation utilities for Tailwind                  |

## Prerequisites

- **Node.js** >= 20
- **pnpm** (package manager) — install via `corepack enable` or `npm install -g pnpm`

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy the example env file and fill in values as needed:

```bash
cp .env.example .env.development
```

| Variable           | Description                     | Default (dev)               |
| ------------------ | ------------------------------- | --------------------------- |
| `VITE_API_URL`     | Backend API base URL            | `http://localhost:5001/api` |
| `VITE_SENTRY_DSN`  | Sentry DSN (production only)    | —                           |
| `VITE_APP_VERSION` | App version for Sentry releases | `dev`                       |

### 3. Start the dev server

```bash
pnpm dev
```

The app runs at **http://localhost:3000**. The dev server proxies `/api` requests to `https://localhost:5001`.

### 4. (Optional) Run without a backend

MSW (Mock Service Worker) can intercept API requests with mock data:

```bash
pnpm dev:mock
```

## Available Scripts

| Command              | Description                            |
| -------------------- | -------------------------------------- |
| `pnpm dev`           | Start dev server on port 3000          |
| `pnpm dev:mock`      | Start dev server with MSW mock API     |
| `pnpm build`         | Type-check and build for production    |
| `pnpm preview`       | Preview the production build locally   |
| `pnpm type-check`    | Run TypeScript type checking (no emit) |
| `pnpm lint`          | Lint with ESLint                       |
| `pnpm lint:fix`      | Lint and auto-fix                      |
| `pnpm format`        | Format all files with Prettier         |
| `pnpm format:check`  | Check formatting without writing       |
| `pnpm test`          | Run unit tests with Vitest             |
| `pnpm test:watch`    | Run tests in watch mode                |
| `pnpm test:coverage` | Run tests with coverage report         |
| `pnpm test:ui`       | Open the Vitest UI dashboard           |
| `pnpm test:e2e`      | Run Playwright end-to-end tests        |
| `pnpm test:e2e:ui`   | Open Playwright UI mode                |

## Project Structure

```
src/
├── api/                  # API client and request layer
│   ├── client.ts         #   Configured fetch wrapper with auth headers
│   ├── queries/          #   TanStack Query definitions
│   └── mutations/        #   TanStack Query mutations
├── components/
│   ├── ui/               #   shadcn/ui primitives (generated)
│   ├── forms/            #   Form components (React Hook Form + Zod)
│   ├── layouts/          #   Page layouts (RootLayout, AuthLayout)
│   └── features/         #   Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configuration
│   ├── utils.ts          #   cn() helper and shared utilities
│   ├── i18n.ts           #   i18next configuration
│   └── validators/       #   Zod schemas
├── routes/               # TanStack Router file-based routes
│   ├── __root.tsx        #   Root layout
│   ├── _authenticated/   #   Auth-guarded route group
│   └── _public/          #   Public route group
├── stores/               # Zustand stores
│   ├── authStore.ts      #   Auth state (token, user, login/logout)
│   └── uiStore.ts        #   UI preferences (theme, sidebar, locale)
├── test/                 # Test setup and utilities
│   ├── setup.ts          #   Vitest global setup (MSW, matchers, mocks)
│   ├── test-utils.tsx    #   Custom render with all providers
│   └── mocks/            #   MSW handlers and server/browser setup
├── types/                # TypeScript type definitions
├── instrument.ts         # Sentry initialization (imported first in main.tsx)
├── main.tsx              # Application entry point
└── index.css             # Global styles + Tailwind CSS theme
```

## Git Workflow

Git hooks are configured via Husky and run automatically:

- **Pre-commit:** lint-staged runs ESLint + Prettier on staged files
- **Commit message:** commitlint enforces [Conventional Commits](https://www.conventionalcommits.org/) format

### Commit message format

```
type(scope): subject
```

The scope is optional. The subject must be **lower-case** and **72 characters or fewer**.

### Allowed commit types

| Type       | What it means                                           |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature or user-facing capability                 |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation-only changes                              |
| `style`    | Code style changes (formatting, whitespace — not CSS)   |
| `refactor` | Code changes that neither fix a bug nor add a feature   |
| `perf`     | A change that improves performance                      |
| `test`     | Adding or updating tests                                |
| `chore`    | Build process, dependency updates, or other maintenance |
| `ci`       | Changes to CI/CD configuration or scripts               |
| `revert`   | Reverts a previous commit                               |

### Examples

```
feat(auth): add jwt token refresh mechanism
fix(api): resolve race condition in data fetching
docs(readme): update installation instructions
chore: update dependencies
test(login): add missing unit tests for validation
```

## State Management

| State Type      | Tool                      | Example                     |
| --------------- | ------------------------- | --------------------------- |
| Server/API data | TanStack Query            | User list, dashboard data   |
| User session    | Zustand (authStore)       | Token, logged-in user       |
| UI preferences  | Zustand (uiStore)         | Theme, sidebar, locale      |
| Form data       | React Hook Form           | Login form, registration    |
| URL state       | TanStack Router           | Search params, route params |
| Local component | `useState` / `useReducer` | Toggle, counter             |

## Production Build

```bash
pnpm build
```

For Sentry source map uploads during CI/CD, set these additional env vars:

```bash
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```
