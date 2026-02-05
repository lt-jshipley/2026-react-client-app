import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RootLayout } from '@/components/layouts/RootLayout'

export const Route = createFileRoute('/_public')({
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  ),
})
