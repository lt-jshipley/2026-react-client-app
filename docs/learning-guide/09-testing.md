# Testing

Vitest runs unit and integration tests. Testing Library renders components and simulates user interactions. MSW (Mock Service Worker) intercepts API calls so tests don't hit a real backend. vitest-axe checks for accessibility violations.

## Testing Philosophy

Test behavior, not implementation. Ask "what does the user see and do?" rather than "what internal state changed?"

- **Forms** — fill inputs, submit, check that validation errors appear or the submit handler was called
- **Pages with data** — mock the API response, check that the data renders
- **Interactions** — click buttons, check that the right thing happens (dialog opens, navigation occurs)
- **Accessibility** — run `axe()` on every component to catch ARIA violations

## Vitest Configuration

Vitest is configured inline in `vite.config.ts` (no separate config file):

```typescript
// vite.config.ts
test: {
  globals: true,          // describe, it, expect, vi available without imports
  environment: 'jsdom',   // Simulates browser DOM
  setupFiles: './src/test/setup.ts',
  css: true,
  include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    exclude: ['node_modules/', 'src/test/', '**/*.d.ts'],
  },
},
```

## Test Setup

`src/test/setup.ts` runs before every test file:

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom' // Adds .toBeInTheDocument(), etc.
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi, expect } from 'vitest'
import * as matchers from 'vitest-axe/matchers'

expect.extend(matchers) // Adds .toHaveNoViolations()
import { server } from './mocks/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' }) // Start MSW server
})

afterEach(() => {
  cleanup() // Unmount rendered components
  server.resetHandlers() // Reset MSW to default handlers
})

afterAll(() => {
  server.close() // Stop MSW server
})

// Mock browser APIs not available in jsdom
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

global.ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
```

## Custom Render Function

`src/test/test-utils.tsx` provides a `render()` that wraps components with all the providers they need (QueryClient, i18n):

```typescript
// src/test/test-utils.tsx
import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Standalone i18n instance with inline translations (no HTTP loading)
const testI18n = i18n.createInstance()
void testI18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'auth', 'dashboard', 'settings', 'users', 'validation'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  resources: {
    en: {
      common: { appName: 'My Application', /* ... */ },
      auth: { signIn: 'Sign In', email: 'Email', password: 'Password', /* ... */ },
      // ... other namespaces with English values
    },
  },
})

// Fresh QueryClient per test (no shared cache between tests)
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,   // Don't retry in tests
        gcTime: 0,      // Don't cache between tests
      },
    },
  })
}

function AllTheProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
    </QueryClientProvider>
  )
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return {
    user: userEvent.setup(),  // Pre-configured user event instance
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  }
}

export * from '@testing-library/react'
export { customRender as render }
```

Import `render` from `@/test/test-utils` instead of `@testing-library/react`. It returns a `user` object for simulating interactions.

## Testing Library Query Priorities

When finding elements in tests, prefer queries in this order:

1. **`getByRole`** — best for accessibility (`getByRole('button', { name: /sign in/i })`)
2. **`getByLabelText`** — for form inputs (`getByLabelText(/email/i)`)
3. **`getByText`** — for non-interactive text content
4. **`getByTestId`** — last resort (use `data-testid` attribute)

```typescript
// Good: finds the button by its accessible role and label
screen.getByRole('button', { name: /sign in/i })

// Good: finds an input by its associated label
screen.getByLabelText(/email/i)

// OK: finds text on the page
screen.getByText('Welcome to your dashboard')

// Avoid unless there's no semantic alternative
screen.getByTestId('submit-button')
```

## MSW: Mocking API Calls

MSW intercepts `fetch` calls in tests and returns mock data. Handlers are defined in `src/test/mocks/handlers.ts`:

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

const API_URL = '/api'

export const handlers = [
  // Login endpoint
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

  // Users list
  http.get(`${API_URL}/users`, () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin' /* ... */,
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'user' /* ... */,
      },
    ])
  }),

  // Single user by ID
  http.get(`${API_URL}/users/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      /* ... */
    })
  }),

  // Create user
  http.post(`${API_URL}/users`, async ({ request }) => {
    const body = (await request.json()) as { name: string; email: string }
    return HttpResponse.json(
      { id: '3', name: body.name, email: body.email, role: 'user' /* ... */ },
      { status: 201 }
    )
  }),

  // Delete user
  http.delete(`${API_URL}/users/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
```

The MSW server is set up in `src/test/mocks/server.ts`:

```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### Overriding Handlers for Specific Tests

Use `server.use()` to override a handler for one test (e.g., to simulate an error):

```typescript
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

it('shows error message on login failure', async () => {
  // Override the login handler for this test only
  server.use(
    http.post('/api/auth/login', () => {
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    })
  )

  // ... test code that expects an error message
})
// After this test, server.resetHandlers() restores the defaults
```

## Testing Forms

Here's a complete form test from `src/components/forms/LoginForm.test.tsx`:

```typescript
// src/components/forms/LoginForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { axe } from 'vitest-axe'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn<(data: unknown) => Promise<void>>()

  beforeEach(() => {
    mockOnSubmit.mockClear()
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

### Testing Patterns

- **`render()`** returns `{ user }` — use `user.type()`, `user.click()` instead of `fireEvent`
- **`waitFor()`** — waits for async operations (validation runs asynchronously)
- **`vi.fn()`** — creates a mock function to verify the form calls `onSubmit`
- **`axe(container)`** — runs accessibility checks and asserts no violations

## Testing Route Components

Route components need mocked TanStack Router and Query. Here's the pattern from `src/routes/_authenticated/users/$userId.test.tsx`:

```typescript
// Mock TanStack Router
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as Record<string, unknown>),
    createFileRoute: () => {
      const routeFn = (options: Record<string, unknown>) => ({
        ...options,
        useParams: () => ({ userId: '1' }),
      })
      return routeFn
    },
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  }
})

// Mock useSuspenseQuery to return test data
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as Record<string, unknown>),
    useSuspenseQuery: (options: { queryKey: string[] }) => {
      const key = options.queryKey.join('/')
      if (key === 'users/1') return { data: mockUser }
      if (key === 'users/1/posts') return { data: mockPosts }
      return { data: null }
    },
  }
})
```

This lets you test the page component without a real router or API.

## Running Tests

```bash
pnpm test              # Run all tests once
pnpm test:watch        # Re-run on file changes
pnpm test:coverage     # Generate coverage report
pnpm test:ui           # Open Vitest UI in browser
```

## Playwright for E2E

Playwright runs end-to-end tests in real browsers. The config is in `playwright.config.ts` and tests live in `e2e/`. Run with:

```bash
pnpm test:e2e          # Run E2E tests headless
pnpm test:e2e:ui       # Open Playwright UI for debugging
```

E2E tests are separate from unit tests and test full user flows (login → navigate → perform action → verify result).

## File Organization

```
src/test/
├── setup.ts           # Global setup: MSW server, jest-dom, axe matchers, browser mocks
├── test-utils.tsx     # Custom render() with QueryClient + i18n providers
└── mocks/
    ├── handlers.ts    # MSW request handlers (mock API responses)
    ├── server.ts      # MSW server instance (for tests)
    └── browser.ts     # MSW worker instance (for dev mode)

# Test files live next to the code they test:
src/components/forms/LoginForm.tsx
src/components/forms/LoginForm.test.tsx
src/routes/_authenticated/users/$userId.tsx
src/routes/_authenticated/users/$userId.test.tsx
```

See [Forms and Validation](./06-forms-and-validation.md) for the form components these tests exercise.
