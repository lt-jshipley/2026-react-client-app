import './instrument' // Sentry must be first
import './lib/i18n' // i18n initialization
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen' // Auto-generated
import { useAuthStore } from './stores/authStore'
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
    auth: undefined as unknown as {
      isAuthenticated: boolean
      user: { id: string; name: string } | null
    }, // Will be set dynamically
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

function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={router}
        context={{
          queryClient,
          auth: {
            isAuthenticated,
            user: user ? { id: user.id, name: user.name } : null,
          },
        }}
      />
    </QueryClientProvider>
  )
}

// MSW dev-mode opt-in
async function enableMocking() {
  if (!import.meta.env.DEV) return

  // Only enable if VITE_MSW=true (opt-in, not default)
  if (import.meta.env.VITE_MSW !== 'true') return

  const { worker } = await import('./test/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

void enableMocking().then(() => {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
