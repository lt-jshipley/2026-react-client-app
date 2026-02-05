import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation('common')
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    void navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-lg font-semibold">
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
            <Link
              to="/users"
              className="text-muted-foreground hover:text-foreground"
            >
              {t('navigation.users')}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/users/$userId"
              params={{ userId: user?.id ?? '' }}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              {user?.name}
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              {t('navigation.logout')}
            </Button>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
