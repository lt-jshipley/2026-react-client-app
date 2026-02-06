import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'

export function useThemeEffect() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'light') {
      root.classList.remove('dark')
      return
    }

    if (theme === 'dark') {
      root.classList.add('dark')
      return
    }

    // theme === 'system'
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      root.classList.toggle('dark', mql.matches)
    }
    apply()
    mql.addEventListener('change', apply)
    return () => {
      mql.removeEventListener('change', apply)
    }
  }, [theme])
}
