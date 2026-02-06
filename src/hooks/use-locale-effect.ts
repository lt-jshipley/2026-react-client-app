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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void i18n.changeLanguage(locale)
    document.documentElement.lang = locale
  }, [locale])
}
