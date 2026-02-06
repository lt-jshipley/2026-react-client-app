# TypeScript and Vite

TypeScript gives us compile-time type safety across the entire codebase. Vite is our build tool — it runs the dev server, handles hot module replacement (HMR), and bundles the app for production.

## TypeScript Strict Mode

We run TypeScript in strict mode with additional safety flags. The full config lives in `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "strict": true, // Enables all strict checks
    "noUnusedLocals": true, // Error on unused variables
    "noUnusedParameters": true, // Error on unused function params
    "noFallthroughCasesInSwitch": true, // Error on switch fallthrough
    "noUncheckedIndexedAccess": true, // Array/object index returns T | undefined
  },
}
```

### What `noUncheckedIndexedAccess` Means in Practice

When you access an array element or object property by index, TypeScript assumes the value might not exist:

```typescript
const items = ['a', 'b', 'c']
const first = items[0] // Type is: string | undefined

// You must narrow before using:
if (first) {
  console.log(first.toUpperCase()) // OK
}
```

This catches real bugs where you assume an array element exists but it doesn't.

## Type Imports

We enforce a `consistent-type-imports` ESLint rule. When importing something that's only used as a type (not a runtime value), use the `type` keyword:

```typescript
// Regular import — used at runtime
import { useMutation } from '@tanstack/react-query'

// Type import — erased at compile time, never in the bundle
import type { User } from '@/types'
```

If you mix runtime and type imports, use inline `type` annotations:

```typescript
import { useMutation, type UseMutationResult } from '@tanstack/react-query'
```

This keeps the production bundle smaller by making it clear what can be tree-shaken.

## Vite's Role

Vite does four things for us:

1. **Dev server** — Starts on port 3000 with instant HMR (changes appear without full page reload)
2. **API proxy** — Forwards `/api/*` requests to the .NET backend at `https://localhost:5001`
3. **Plugin system** — Runs TanStack Router (route generation), React (JSX transform), Tailwind CSS, and Sentry (source maps)
4. **Production bundler** — Uses Rollup under the hood with manual chunk splitting

The full config is in `vite.config.ts`:

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  plugins: [
    // IMPORTANT: TanStack Router plugin must come BEFORE react plugin
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
      routeFileIgnorePattern: '.test.tsx?$',
    }),
    react(),
    tailwindcss(),
    // Sentry plugin must be LAST and only in production
    mode === 'production' &&
      sentryVitePlugin({
        /* ... */
      }),
  ].filter(Boolean),
  // ...
}))
```

Plugin order matters:

- TanStack Router must be **first** (it generates the route tree before React processes JSX)
- Sentry must be **last** and only in production (it uploads source maps after bundling)

## Environment Variables

Vite only exposes env vars that start with `VITE_` to the browser. Access them via `import.meta.env`:

```typescript
const apiUrl = import.meta.env.VITE_API_URL // string
const isDev = import.meta.env.DEV // boolean (built-in)
const isProd = import.meta.env.PROD // boolean (built-in)
const mode = import.meta.env.MODE // "development" | "production"
```

Our env vars (from `.env.example`):

| Variable           | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `VITE_API_URL`     | API base URL (defaults to `/api` if empty) |
| `VITE_SENTRY_DSN`  | Sentry error tracking endpoint             |
| `VITE_APP_VERSION` | App version sent to Sentry                 |
| `VITE_MSW`         | Set to `true` to enable mock API in dev    |

Never put secrets in `VITE_` vars — they end up in the browser bundle.

## The `@/` Path Alias

The `@/` alias is configured in two places so both TypeScript and Vite understand it:

**tsconfig.json** (for TypeScript type checking):

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
    },
  },
}
```

**vite.config.ts** (for the bundler):

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

## Build Output

For production, Vite splits the bundle into manual chunks to improve caching:

```typescript
// vite.config.ts
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
```

This means React, the router, and the query library each get their own cached chunk. When you update application code, users don't need to re-download these vendor libraries.

Source maps are generated as `hidden` — they exist for Sentry error tracking but aren't served to browsers. In CI, the Sentry plugin uploads them and then deletes the `.map` files from the dist folder.

## Vitest Configuration

Our test runner (Vitest) is configured inline in `vite.config.ts` rather than in a separate file:

```typescript
// vite.config.ts
test: {
  globals: true,          // describe, it, expect available without imports
  environment: 'jsdom',   // Simulates a browser DOM
  setupFiles: './src/test/setup.ts',
  css: true,              // Process CSS in tests
  include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
},
```

See [Testing](./09-testing.md) for how to write and run tests.
