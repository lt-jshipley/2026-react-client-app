import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from './AppSidebar'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation('common')
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)

  const handleLogout = () => {
    logout()
    void navigate({ to: '/login' })
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar
        navVariant="authenticated"
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex min-h-svh flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-semibold">{t('appName')}</span>
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
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  )
}
