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
