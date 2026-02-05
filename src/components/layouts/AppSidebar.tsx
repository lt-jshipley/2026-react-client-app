import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Home,
  LayoutDashboard,
  Settings,
  Users,
  ShieldCheck,
  LogOut,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

type NavKey =
  | 'navigation.home'
  | 'navigation.dashboard'
  | 'navigation.settings'
  | 'navigation.users'
  | 'navigation.admin'

interface NavItem {
  label: NavKey
  to: string
  icon: React.ComponentType<{ className?: string }>
}

interface AppSidebarProps extends Omit<
  React.ComponentProps<typeof Sidebar>,
  'variant'
> {
  navVariant: 'public' | 'authenticated'
  user?: { id: string; name: string } | null
  onLogout?: () => void
}

const publicNav: NavItem[] = [
  { label: 'navigation.home', to: '/', icon: Home },
  { label: 'navigation.dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'navigation.settings', to: '/settings', icon: Settings },
  { label: 'navigation.users', to: '/users', icon: Users },
]

const authNav: NavItem[] = [
  { label: 'navigation.dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'navigation.settings', to: '/settings', icon: Settings },
  { label: 'navigation.users', to: '/users', icon: Users },
  { label: 'navigation.admin', to: '/admin/users', icon: ShieldCheck },
]

export function AppSidebar({
  navVariant,
  user,
  onLogout,
  ...props
}: AppSidebarProps) {
  const { t } = useTranslation('common')
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const items = navVariant === 'public' ? publicNav : authNav

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={navVariant === 'public' ? '/' : '/dashboard'}>
                <span className="text-lg font-semibold">{t('appName')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation.home')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={pathname === item.to}>
                    <Link to={item.to}>
                      <item.icon />
                      <span>{t(item.label)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {navVariant === 'authenticated' && user && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center justify-between px-2 py-1.5">
                <Link
                  to="/users/$userId"
                  params={{ userId: user.id }}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {user.name}
                </Link>
                {onLogout && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onLogout}
                    className="h-7 w-7 shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">{t('navigation.logout')}</span>
                  </Button>
                )}
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  )
}
