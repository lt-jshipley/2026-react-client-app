# Data Fetching

TanStack Query (formerly React Query) manages server state — data that lives on the backend and needs to be fetched, cached, and kept in sync. It is not an HTTP client itself; it wraps whatever fetching mechanism you give it and handles caching, retries, background refetching, and cache invalidation.

## Why Not Just `useEffect` + `fetch`?

With plain `useEffect`, every component that needs the same data makes its own request, manages its own loading/error states, and has no caching. TanStack Query solves all of this: it deduplicates requests, caches results, refetches stale data in the background, and gives you consistent loading/error states.

## The API Client

Before looking at queries, understand our fetch wrapper in `src/api/client.ts`. It handles two things every request needs: the base URL and the auth token.

```typescript
// src/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
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

  // Add query parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  // Get token from Zustand store (works outside React components)
  const token = useAuthStore.getState().token

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  })

  const response = await fetch(url, { ...init, headers })

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

Key details:

- **`ApiError`** — a custom error class that includes the HTTP status code and response body, so error handlers can show meaningful messages
- **`useAuthStore.getState().token`** — reads the auth token from Zustand synchronously (no hook needed since this isn't a React component)
- **`api.get/post/put/delete`** — convenience methods that set the HTTP method for you

## Query Definitions

Queries are defined as factory functions using `queryOptions()`. Each one declares a **query key** (for caching) and a **query function** (how to fetch).

### Simple Query

```typescript
// src/api/queries/dashboard.ts
import { queryOptions } from '@tanstack/react-query'
import { api } from '../client'

interface DashboardData {
  totalUsers: number
  totalPosts: number
  recentActivity: {
    id: string
    type: string
    description: string
    createdAt: string
  }[]
}

export const dashboardQueryOptions = queryOptions({
  queryKey: ['dashboard'],
  queryFn: () => api.get<DashboardData>('/dashboard'),
})
```

### Parameterized Queries

When the query depends on a parameter (like a user ID), use a function that returns query options:

```typescript
// src/api/queries/users.ts
import { queryOptions } from '@tanstack/react-query'
import { api } from '../client'
import type { User, Post } from '@/types'

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

Notice the query key structure: `['users']` for the list, `['users', userId]` for a specific user, `['users', userId, 'posts']` for that user's posts. This hierarchy is important for cache invalidation — invalidating `['users']` also invalidates all child keys.

The `enabled` flag prevents the query from running if the parameter is missing.

## Using Queries in Components

### With Route Loaders (`useSuspenseQuery`)

When a route loader has already ensured the data exists, use `useSuspenseQuery`. The data is guaranteed to be available at render time — no loading state needed:

```typescript
// src/routes/_authenticated/dashboard.tsx
export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQueryOptions),
  component: DashboardPage,
})

function DashboardPage() {
  const { data } = useSuspenseQuery(dashboardQueryOptions)
  // data is always defined here — no undefined check needed
  return <p>{data.totalUsers} users</p>
}
```

## Mutations

Mutations handle write operations (create, update, delete). They don't use query keys for caching — instead they invalidate relevant queries after succeeding.

### Login Mutation

```typescript
// src/api/mutations/auth.ts
import { useMutation } from '@tanstack/react-query'
import { api } from '../client'
import { useAuthStore } from '@/stores/authStore'

interface LoginInput {
  email: string
  password: string
}

interface AuthResponse {
  token: string
  user: { id: string; name: string; email: string }
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: LoginInput) =>
      api.post<AuthResponse>('/auth/login', data),
    onSuccess: (data) => {
      setAuth(data.token, data.user)
    },
  })
}
```

### CRUD Mutations with Cache Invalidation

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
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateUserInput & { id: string }) =>
      api.put<User>(`/users/${id}`, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['users', variables.id] })
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

The pattern: after a mutation succeeds, invalidate the relevant query keys. This causes TanStack Query to refetch the data, keeping the UI in sync with the server.

### Using Mutations in Components

```typescript
// In a page component
const createUser = useCreateUser()

const handleCreate = (data: CreateUserFormData) => {
  createUser.mutate(data, {
    onSuccess: () => {
      setDialogOpen(false)
      showSuccess('User created successfully.')
    },
  })
}

// In JSX
<Button disabled={createUser.isPending}>
  {createUser.isPending ? 'Creating...' : 'Create User'}
</Button>
```

## Default Settings

The QueryClient in `src/main.tsx` is configured with these defaults:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})
```

- **`staleTime: 5 minutes`** — after fetching, data is considered "fresh" for 5 minutes. During this time, navigating back to a page shows cached data instantly without a new request.
- **`retry: 1`** — failed queries retry once before showing an error.

## File Organization

```
src/api/
├── client.ts           # Fetch wrapper (used by all queries/mutations)
├── queries/            # Read operations
│   ├── dashboard.ts    # dashboardQueryOptions
│   └── users.ts        # usersQueryOptions, userQueryOptions, userPostsQueryOptions
└── mutations/          # Write operations
    ├── auth.ts         # useLogin, useRegister
    └── users.ts        # useCreateUser, useUpdateUser, useDeleteUser
```

See [Routing](./03-routing.md) for how route loaders integrate with queries, and [State Management](./05-state-management.md) for when to use TanStack Query vs Zustand.
