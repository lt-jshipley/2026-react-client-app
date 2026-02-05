import { Suspense } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, render } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { axe } from 'vitest-axe'
import { HelmetProvider } from 'react-helmet-async'
import type { User, Post } from '@/types'

// Create a test-specific i18n instance
const testI18n = i18n.createInstance()
void testI18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'users'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  resources: {
    en: {
      common: {
        appName: 'My Application',
        navigation: { dashboard: 'Dashboard', settings: 'Settings' },
      },
      users: {
        pageTitle: "{{name}}'s Profile",
        postsHeading: 'Posts ({{count}})',
        noPosts: 'No posts yet.',
        publishedOn: 'Published on {{date}}',
      },
    },
  },
})

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'First Post',
    content: 'This is the first post content.',
    authorId: '1',
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2025-02-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Second Post',
    content: 'This is the second post content.',
    authorId: '1',
    createdAt: '2025-02-10T00:00:00.000Z',
    updatedAt: '2025-02-10T00:00:00.000Z',
  },
]

let currentPosts: Post[] = mockPosts

// Mock TanStack Router
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as Record<string, unknown>),
    createFileRoute: () => {
      const routeFn = (options: Record<string, unknown>) => {
        const route = {
          ...options,
          useParams: () => ({ userId: '1' }),
        }
        return route
      }
      return routeFn
    },
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  }
})

// Mock useSuspenseQuery to return data synchronously
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as Record<string, unknown>),
    useSuspenseQuery: (options: { queryKey: string[] }) => {
      const key = options.queryKey.join('/')
      if (key === 'users/1') {
        return { data: mockUser }
      }
      if (key === 'users/1/posts') {
        return { data: currentPosts }
      }
      return { data: null }
    },
  }
})

// Import after mocks are established
const { Route } = await import('./$userId')

// The component is wrapped by lazyRouteComponent — preload it
const LazyUserPage = (
  Route as unknown as {
    component: React.ComponentType & { preload: () => Promise<void> }
  }
).component
await LazyUserPage.preload()

function renderPage() {
  return render(
    <I18nextProvider i18n={testI18n}>
      <HelmetProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyUserPage />
        </Suspense>
      </HelmetProvider>
    </I18nextProvider>
  )
}

describe('UserPage', () => {
  it('renders user info and posts', () => {
    currentPosts = mockPosts
    renderPage()

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Posts (2)')).toBeInTheDocument()
    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(
      screen.getByText('This is the first post content.')
    ).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()
    expect(
      screen.getByText('This is the second post content.')
    ).toBeInTheDocument()
  })

  it('shows empty state when user has no posts', () => {
    currentPosts = []
    renderPage()

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Posts (0)')).toBeInTheDocument()
    expect(screen.getByText('No posts yet.')).toBeInTheDocument()
  })

  it('should have no accessibility violations', async () => {
    currentPosts = mockPosts
    const { container } = renderPage()

    expect(screen.getByText('John Doe')).toBeInTheDocument()

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
