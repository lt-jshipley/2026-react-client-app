import 'i18next'

// Import translation types
import type common from '../../public/locales/en/common.json'
import type auth from '../../public/locales/en/auth.json'
import type dashboard from '../../public/locales/en/dashboard.json'
import type settings from '../../public/locales/en/settings.json'
import type users from '../../public/locales/en/users.json'
import type validation from '../../public/locales/en/validation.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      auth: typeof auth
      dashboard: typeof dashboard
      settings: typeof settings
      users: typeof users
      validation: typeof validation
    }
  }
}
