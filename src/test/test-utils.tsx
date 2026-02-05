import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Create a test-specific i18n instance with inline translations
const testI18n = i18n.createInstance()
void testI18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'auth', 'dashboard', 'validation'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      common: {
        appName: 'My Application',
        navigation: {
          home: 'Home',
          dashboard: 'Dashboard',
          settings: 'Settings',
          logout: 'Log out',
        },
        actions: {
          save: 'Save',
          cancel: 'Cancel',
          delete: 'Delete',
          edit: 'Edit',
          loading: 'Loading...',
        },
        errors: {
          generic: 'Something went wrong. Please try again.',
          notFound: 'Page not found',
          unauthorized: 'You are not authorized to view this page',
        },
      },
      auth: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signingIn: 'Signing in...',
        email: 'Email',
        emailPlaceholder: 'Enter your email',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
      },
      dashboard: {
        pageTitle: 'Dashboard',
        welcome: 'Welcome to your dashboard',
      },
      validation: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        minLength: 'Must be at least {{min}} characters',
        maxLength: 'Must be under {{max}} characters',
      },
    },
  },
})

// Create a fresh query client for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

interface WrapperProps {
  children: ReactNode
}

function AllTheProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
    </QueryClientProvider>
  )
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  }
}

export * from '@testing-library/react'
export { customRender as render }
