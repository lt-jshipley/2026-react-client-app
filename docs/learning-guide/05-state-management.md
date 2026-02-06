# State Management

Not all state is the same. We use different tools depending on where the data comes from and how it's used. Zustand handles client-only state like UI preferences. TanStack Query handles server state. React Hook Form handles form state.

## The Decision Matrix

| State Type                                  | Tool             | Examples                           |
| ------------------------------------------- | ---------------- | ---------------------------------- |
| **Server state** (data from the API)        | TanStack Query   | User list, dashboard stats, posts  |
| **Client state** (UI preferences)           | Zustand          | Theme, sidebar open/closed, locale |
| **Auth state** (token + current user)       | Zustand          | JWT token, logged-in user          |
| **Form state** (input values, validation)   | React Hook Form  | Login form, create user form       |
| **URL state** (current page, search params) | TanStack Router  | Active route, query parameters     |
| **Local component state** (toggles, modals) | React `useState` | Dialog open/closed, selected item  |

The general rule: if data comes from the server, it goes in TanStack Query. If it's a user preference that persists across sessions, it goes in Zustand. If it's form input, it goes in React Hook Form. If it's local to one component, use `useState`.

## What Zustand Is

Zustand is a minimal state management library. Unlike Redux, there's no boilerplate — no action types, no reducers, no dispatch. You create a store with `create()`, define state and actions in one place, and read/write from any component.

## The Auth Store

`src/stores/authStore.ts` manages authentication state:

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

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        // State
        token: null,
        user: null,
        isAuthenticated: false,

        // Actions
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
        // Only persist user info, NOT the token (for security)
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: 'AuthStore' }
  )
)
```

### Middleware

Two middleware are used:

- **`persist`** — saves state to `localStorage` so it survives page refreshes. The `partialize` option controls what gets saved — we intentionally exclude the token for security (it stays in memory only).
- **`devtools`** — enables the Redux DevTools browser extension for time-travel debugging. The third argument to `set()` (e.g., `'auth/setAuth'`) is the action name that appears in devtools.

### Security Note

The JWT token is stored **only in memory** (not in localStorage). This means:

- Refreshing the page loses the token (you'd re-authenticate via a refresh token in an HttpOnly cookie)
- XSS attacks can't read the token from localStorage

The user object **is** persisted so we can show the user's name immediately on page load.

## The UI Store

`src/stores/uiStore.ts` manages user interface preferences:

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

Everything in the UI store is persisted to localStorage (under the key `ui-storage`), so preferences survive page refreshes and browser restarts.

## Reading State in Components

Use the **selector pattern** to subscribe to only the state you need. This prevents unnecessary re-renders:

```typescript
// Good — only re-renders when `theme` changes
const theme = useUIStore((s) => s.theme)

// Good — only re-renders when `setTheme` changes (it doesn't, it's stable)
const setTheme = useUIStore((s) => s.setTheme)

// Avoid — re-renders on ANY store change
const { theme, sidebarOpen, locale } = useUIStore()
```

Use individual selectors for reading, and call actions directly:

```typescript
function ThemeToggle() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  return (
    <button onClick={() => setTheme('dark')}>
      Current: {theme}
    </button>
  )
}
```

## Reading State Outside React

Sometimes you need store state outside a component (e.g., in the API client). Use `getState()`:

```typescript
// src/api/client.ts
const token = useAuthStore.getState().token
```

This reads the current value synchronously, without subscribing to updates.

## When NOT to Use Zustand

- **Server data** (users, posts, dashboard stats) → Use TanStack Query. It handles caching, background refetching, and deduplication. See [Data Fetching](./04-data-fetching.md).
- **Form inputs** (email, password, name fields) → Use React Hook Form. It handles validation, dirty tracking, and submission. See [Forms and Validation](./06-forms-and-validation.md).
- **Component-local state** (is this modal open?) → Use React `useState`. If only one component needs it, a global store is overkill.
- **URL state** (current page, search/filter params) → Use TanStack Router. The URL is the source of truth. See [Routing](./03-routing.md).
