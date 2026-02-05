import 'i18next'

// Import translation types
import type common from '../../public/locales/en/common.json'
import type auth from '../../public/locales/en/auth.json'
import type dashboard from '../../public/locales/en/dashboard.json'
import type validation from '../../public/locales/en/validation.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      auth: typeof auth
      dashboard: typeof dashboard
      validation: typeof validation
    }
  }
}
