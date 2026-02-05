import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
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
        <div className="bg-background min-h-screen font-sans antialiased">
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
        <p className="text-muted-foreground mt-2">
          Please refresh the page or try again later.
        </p>
        <button
          onClick={() => {
            window.location.reload()
          }}
          className="bg-primary text-primary-foreground mt-4 rounded px-4 py-2"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}
