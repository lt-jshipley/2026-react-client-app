# Internationalization

i18next handles all user-facing text in the app. Instead of hardcoding strings like `"Sign In"`, we use translation keys like `t('signIn')` that resolve to the correct language at runtime. This lets us add new languages without changing component code.

## How i18next Is Configured

The setup lives in `src/lib/i18n.ts`:

```typescript
// src/lib/i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

void i18n
  .use(HttpBackend) // Loads translation files via HTTP
  .use(LanguageDetector) // Detects user's browser language
  .use(initReactI18next) // Connects to React
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'de'],
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // React already escapes output
    },

    // Namespace configuration
    ns: ['common', 'auth', 'dashboard', 'settings', 'users', 'validation'],
    defaultNS: 'common',

    // Loads from: /locales/{language}/{namespace}.json
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Language detection priority
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
    },

    react: {
      useSuspense: true, // Wait for translations to load before rendering
    },
  })

export default i18n
```

Three plugins work together:

- **HttpBackend** — loads JSON files from `public/locales/` at runtime (not bundled)
- **LanguageDetector** — checks the URL query string, cookies, localStorage, then browser settings
- **initReactI18next** — provides the `useTranslation` hook

## Namespaces

Translations are split into namespaces to keep files small and organized:

| Namespace    | File              | Contains                                             |
| ------------ | ----------------- | ---------------------------------------------------- |
| `common`     | `common.json`     | App name, navigation, shared actions, generic errors |
| `auth`       | `auth.json`       | Sign in, sign up, password labels                    |
| `dashboard`  | `dashboard.json`  | Dashboard page text                                  |
| `settings`   | `settings.json`   | Settings page text                                   |
| `users`      | `users.json`      | User profiles, admin CRUD                            |
| `validation` | `validation.json` | Generic validation messages                          |

## Translation File Location

Translation files live in `public/locales/`:

```
public/locales/
├── en/
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   ├── settings.json
│   ├── users.json
│   └── validation.json
└── es/
    ├── common.json
    ├── auth.json
    ├── dashboard.json
    ├── settings.json
    ├── users.json
    └── validation.json
```

They're in `public/` (not `src/`) so they're served as static files, loaded on demand by the HttpBackend plugin. Only the namespaces needed by the current page are fetched.

### Example Translation File

```json
// public/locales/en/auth.json
{
  "signIn": "Sign In",
  "signUp": "Sign Up",
  "signingIn": "Signing in...",
  "email": "Email",
  "emailPlaceholder": "Enter your email",
  "password": "Password",
  "passwordPlaceholder": "Enter your password",
  "rememberMe": "Remember me",
  "noAccount": "Don't have an account?",
  "hasAccount": "Already have an account?",
  "loginFailed": "Unable to sign in. Please check your credentials and try again."
}
```

## Using Translations in Components

### Basic Usage

```typescript
import { useTranslation } from 'react-i18next'

function DashboardPage() {
  const { t } = useTranslation('dashboard')  // Load the 'dashboard' namespace

  return <h1>{t('welcome')}</h1>
  // Renders: "Welcome to your dashboard"
}
```

### Multiple Namespaces

When a component needs text from different namespaces, call `useTranslation` multiple times:

```typescript
function UserTable() {
  const { t } = useTranslation('users')
  const { t: tCommon } = useTranslation('common')

  return (
    <table>
      <th>{t('admin.table.name')}</th>      {/* From users namespace */}
      <button>{tCommon('actions.edit')}</button> {/* From common namespace */}
    </table>
  )
}
```

### Interpolation

Pass dynamic values into translations:

```typescript
// Translation key: "postsHeading": "Posts ({{count}})"
<h2>{t('postsHeading', { count: posts.length })}</h2>
// Renders: "Posts (5)"

// Translation key: "pageTitle": "{{name}}'s Profile"
<h1>{t('pageTitle', { name: user.name })}</h1>
// Renders: "John Doe's Profile"
```

### Nested Keys

Translation files support nested objects. Access nested keys with dot notation:

```json
{
  "admin": {
    "table": {
      "name": "Name",
      "email": "Email"
    }
  }
}
```

```typescript
t('admin.table.name') // "Name"
```

## The Locale Store and Effect Hook

The user's language preference is stored in the Zustand UI store and synced to i18next via a custom hook:

```typescript
// src/hooks/use-locale-effect.ts
import { useEffect } from 'react'
import i18n from '@/lib/i18n'
import { useUIStore } from '@/stores/uiStore'

export function useLocaleEffect() {
  const locale = useUIStore((s) => s.locale)
  const setLocale = useUIStore((s) => s.setLocale)

  // On mount: if no persisted preference, adopt i18next's detected language
  useEffect(() => {
    if (!localStorage.getItem('ui-storage')) {
      const detected = i18n.language
      if (detected && detected !== locale) {
        setLocale(detected)
      }
    }
  }, [])

  // When locale changes, update i18next and the HTML lang attribute
  useEffect(() => {
    void i18n.changeLanguage(locale)
    document.documentElement.lang = locale
  }, [locale])
}
```

This hook runs in the root route (`__root.tsx`), so it's always active.

### The Locale Picker

```typescript
// src/components/features/locale/LocalePicker.tsx
const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Espanol' },
] as const

export function LocalePicker() {
  const locale = useUIStore((s) => s.locale)
  const setLocale = useUIStore((s) => s.setLocale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => setLocale(value)}
        >
          {LOCALES.map(({ value, label }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Adding a New Language

Follow these steps to add a new language (e.g., French):

1. **Create translation files** — copy `public/locales/en/` to `public/locales/fr/` and translate all values:

   ```bash
   cp -r public/locales/en public/locales/fr
   # Then edit each JSON file in public/locales/fr/
   ```

2. **Update `supportedLngs`** in `src/lib/i18n.ts` (already includes `'fr'`):

   ```typescript
   supportedLngs: ['en', 'es', 'fr', 'de'],
   ```

3. **Add the locale option** to the `LocalePicker` component:
   ```typescript
   const LOCALES = [
     { value: 'en', label: 'English' },
     { value: 'es', label: 'Espanol' },
     { value: 'fr', label: 'Francais' },
   ] as const
   ```

That's it. The HttpBackend plugin will load the new translation files automatically when a user selects French.

## Testing Considerations

In tests, we don't load translations via HTTP. Instead, `src/test/test-utils.tsx` creates a standalone i18n instance with inline English translations and `useSuspense: false`:

```typescript
const testI18n = i18n.createInstance()
void testI18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'auth', 'dashboard', 'settings', 'users', 'validation'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  resources: {
    en: {
      common: { appName: 'My Application' /* ... */ },
      auth: { signIn: 'Sign In', email: 'Email' /* ... */ },
      // ... other namespaces
    },
  },
})
```

This avoids network requests in tests and gives predictable, English-only output for assertions like `screen.getByText('Sign In')`.

See [Testing](./09-testing.md) for more on how the custom render function wraps components with this i18n provider.
