# Error Monitoring

Sentry tracks errors, performance, and session replays in production. When something breaks for a user, Sentry captures the error with a full stack trace, breadcrumbs (what the user did leading up to the error), and optionally a session replay so you can see exactly what happened.

## How It's Initialized

Sentry must be the **very first import** in the app so it can instrument all subsequent code. In `src/main.tsx`:

```typescript
import './instrument' // Sentry must be first
import './lib/i18n' // Everything else comes after
```

The configuration lives in `src/instrument.ts`:

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
      maskAllText: true, // Masks text content in replays
      blockAllMedia: true, // Blocks images/videos in replays
      maskAllInputs: true, // Masks form inputs in replays
    }),
  ],

  // Performance monitoring
  tracesSampleRate: isProd ? 0.1 : 1.0, // 10% of requests in prod, 100% in dev

  // Session replay
  replaysSessionSampleRate: isProd ? 0.05 : 0.1, // 5% of sessions in prod
  replaysOnErrorSampleRate: 1.0, // 100% when an error occurs

  // Filter events before sending
  beforeSend(event, hint) {
    if (isDev) return null // Never send events in development

    const error = hint.originalException
    if (error instanceof Error) {
      if (error.message.includes('Network request failed')) {
        return null // Don't track network errors
      }
    }

    return event
  },
})
```

## What Gets Captured

| Feature                | Production                            | Development                            |
| ---------------------- | ------------------------------------- | -------------------------------------- |
| **Error tracking**     | All errors (filtered by `beforeSend`) | Disabled (`beforeSend` returns `null`) |
| **Performance traces** | 10% of requests                       | 100% (for debugging)                   |
| **Session replays**    | 5% of sessions, 100% on error         | 10% of sessions                        |
| **Debug logging**      | Off                                   | On (`debug: isDev`)                    |

### Privacy in Replays

The replay integration is configured to protect user privacy:

- `maskAllText: true` — replaces text content with asterisks
- `blockAllMedia: true` — hides images and videos
- `maskAllInputs: true` — hides form field values

## Production vs Development

In development:

- `dsn` is set to `undefined` — Sentry doesn't connect to any project
- `beforeSend` returns `null` — even if a DSN leaked in, no events would send
- `debug: true` — Sentry logs what it would do to the console

In production:

- `dsn` is set from the `VITE_SENTRY_DSN` environment variable
- Events are sent and filtered by `beforeSend`
- Sample rates control the volume (10% of traces, 5% of replays)

## Error Boundary

The root route wraps the entire app in a Sentry error boundary:

```typescript
// src/routes/__root.tsx
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <Outlet />
</Sentry.ErrorBoundary>
```

If a component throws an unhandled error, `Sentry.ErrorBoundary`:

1. Captures the error and sends it to Sentry (in production)
2. Renders the `<ErrorFallback />` component instead of crashing the whole page

The fallback shows a "Something went wrong" message with a refresh button.

## Source Maps

In CI, the Sentry Vite plugin uploads source maps so stack traces in the Sentry dashboard show original TypeScript code (not minified JavaScript). After uploading, the `.map` files are deleted from the `dist/` folder so they're never served to browsers:

```typescript
// vite.config.ts (production only)
sentryVitePlugin({
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    filesToDeleteAfterUpload: ['./dist/**/*.map'],
  },
}),
```

The build also uses `sourcemap: 'hidden'` — source maps are generated but not referenced in the JavaScript files, so browsers can't discover them.
