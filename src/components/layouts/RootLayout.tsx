import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

interface RootLayoutProps {
  children: ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  const { t } = useTranslation('common')

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="container flex h-16 items-center gap-6">
          <Link to="/" className="text-lg font-semibold">
            {t('appName')}
          </Link>
          <Link
            to="/dashboard"
            className="text-muted-foreground hover:text-foreground"
          >
            {t('navigation.dashboard')}
          </Link>
          <Link
            to="/settings"
            className="text-muted-foreground hover:text-foreground"
          >
            {t('navigation.settings')}
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
