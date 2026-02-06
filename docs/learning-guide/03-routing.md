# Routing

TanStack Router provides type-safe, file-based routing. You create a file in `src/routes/` and it automatically becomes a URL in the app. The router knows all your routes at compile time, so typos in links are caught by TypeScript.

## How File-Based Routing Works

Files in `src/routes/` map to URLs. The TanStack Router Vite plugin scans the directory and generates `src/routeTree.gen.ts` automatically — you never edit that file by hand.

| File Path                             | URL                 |
| ------------------------------------- | ------------------- |
| `_public/index.tsx`                   | `/`                 |
| `_public/login.tsx`                   | `/login`            |
| `_authenticated/dashboard.tsx`        | `/dashboard`        |
| `_authenticated/users/$userId.tsx`    | `/users/:userId`    |
| `_authenticated/admin/users.tsx`      | `/admin/users`      |
| `_authenticated/settings/profile.tsx` | `/settings/profile` |

### Naming Rules

- **`$param`** — dynamic segment (e.g., `$userId.tsx` matches `/users/123`)
- **`_prefix`** — layout route (wraps children but doesn't add a URL segment)
- **`index.tsx`** — the default route for a directory
- **`__root.tsx`** — the root layout that wraps everything

## Route Groups

We use underscore-prefixed directories as **route groups** (also called layout routes). They wrap child routes in a shared layout without adding to the URL path:

```
src/routes/
├── __root.tsx              ← Wraps everything (theme, error boundary)
├── _authenticated/         ← Group: requires login
│   ├── route.tsx           ← Auth guard + AuthLayout
│   ├── dashboard.tsx       ← /dashboard
│   └── users/$userId.tsx   ← /users/:userId
└── _public/                ← Group: no login required
    ├── route.tsx           ← RootLayout wrapper
    ├── index.tsx           ← /
    └── login.tsx           ← /login
```

Notice that `_authenticated` and `_public` don't appear in the URL. `/dashboard` is the URL, not `/_authenticated/dashboard`.

## The Root Route

`src/routes/__root.tsx` is the top-level layout. Every route in the app renders inside it:

```typescript
// src/routes/__root.tsx
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
  useThemeEffect()   // Syncs theme (light/dark/system) to the DOM
  useLocaleEffect()  // Syncs locale to i18next

  return (
    <HelmetProvider>
      <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
        <div className="bg-background min-h-screen font-sans antialiased">
          <Outlet />  {/* Child routes render here */}
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
```

Key points:

- **`RouterContext`** — defines what data is available to all routes (the query client and auth state)
- **`<Outlet />`** — this is where child routes render
- **Dev tools** — TanStack Router and React Query devtools appear in development only

## Auth Guards

The `_authenticated/route.tsx` file uses `beforeLoad` to check if the user is logged in before rendering any child route:

```typescript
// src/routes/_authenticated/route.tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,  // Remember where they were going
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

How it works:

1. `beforeLoad` runs before the route component renders
2. It checks `context.auth.isAuthenticated` (provided by the Zustand store via `main.tsx`)
3. If not authenticated, it throws a `redirect()` to `/login`
4. The current URL is saved in the `redirect` search param so the login page can send them back

## Route Loaders

Loaders prefetch data before a route renders, preventing loading spinners:

```typescript
// src/routes/_authenticated/dashboard.tsx
export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQueryOptions),
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation('dashboard')
  // Data is guaranteed to exist here because the loader already fetched it
  const { data } = useSuspenseQuery(dashboardQueryOptions)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">{t('welcome')}</h1>
      <p className="text-2xl font-bold">{data.totalUsers}</p>
    </div>
  )
}
```

The loader calls `ensureQueryData` — if the data is already cached and fresh, it returns immediately. Otherwise it fetches from the API. Inside the component, `useSuspenseQuery` knows the data is ready (because the loader guaranteed it).

For routes that need multiple pieces of data, use `Promise.all`:

```typescript
// src/routes/_authenticated/users/$userId.tsx
export const Route = createFileRoute('/_authenticated/users/$userId')({
  loader: ({ params, context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(userQueryOptions(params.userId)),
      context.queryClient.ensureQueryData(userPostsQueryOptions(params.userId)),
    ]),
  component: UserPage,
})
```

## Navigation

### The `<Link>` Component

Use `<Link>` for navigation. It's type-safe — TypeScript knows which routes and params exist:

```typescript
import { Link } from '@tanstack/react-router'

// Static route
<Link to="/dashboard">Dashboard</Link>

// Dynamic route with params
<Link to="/users/$userId" params={{ userId: user.id }}>
  {user.name}
</Link>
```

### Programmatic Navigation

Use `useNavigate()` for navigation in event handlers:

```typescript
import { useNavigate } from '@tanstack/react-router'

function LoginPage() {
  const navigate = useNavigate()

  const handleLogin = () => {
    // After successful login...
    void navigate({ to: '/dashboard' })
  }
}
```

## Dynamic Routes

The `$userId` in `users/$userId.tsx` creates a dynamic route parameter. Access it with `Route.useParams()`:

```typescript
// src/routes/_authenticated/users/$userId.tsx
function UserPage() {
  const { userId } = Route.useParams()
  const { data: user } = useSuspenseQuery(userQueryOptions(userId))
  const { data: posts } = useSuspenseQuery(userPostsQueryOptions(userId))

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">{user.name}</h1>
      <p className="text-muted-foreground mt-2">{user.email}</p>
      {/* ... */}
    </div>
  )
}
```

## Route Files in This Project

| File                                  | URL                 | Purpose                               |
| ------------------------------------- | ------------------- | ------------------------------------- |
| `__root.tsx`                          | —                   | Root layout, error boundary, devtools |
| `_public/route.tsx`                   | —                   | Public layout wrapper                 |
| `_public/index.tsx`                   | `/`                 | Home page                             |
| `_public/login.tsx`                   | `/login`            | Login page                            |
| `_public/register.tsx`                | `/register`         | Registration page                     |
| `_authenticated/route.tsx`            | —                   | Auth guard + authenticated layout     |
| `_authenticated/dashboard.tsx`        | `/dashboard`        | Dashboard with stats                  |
| `_authenticated/users/$userId.tsx`    | `/users/:id`        | User profile + posts                  |
| `_authenticated/admin/users.tsx`      | `/admin/users`      | User management CRUD                  |
| `_authenticated/settings/index.tsx`   | `/settings`         | Settings index                        |
| `_authenticated/settings/profile.tsx` | `/settings/profile` | Profile settings                      |

See [Data Fetching](./04-data-fetching.md) for details on how loaders work with TanStack Query.
