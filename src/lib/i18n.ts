import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'de'],
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // React already handles escaping
    },

    // Namespace configuration
    ns: ['common', 'auth', 'dashboard', 'settings', 'validation'],
    defaultNS: 'common',

    // Backend configuration
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Detection configuration
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
    },

    // React-specific
    react: {
      useSuspense: true,
    },
  })

export default i18n
