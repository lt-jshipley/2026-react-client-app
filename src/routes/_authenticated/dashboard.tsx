import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { dashboardQueryOptions } from '@/api/queries/dashboard'

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQueryOptions),
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation('dashboard')
  const { data } = useSuspenseQuery(dashboardQueryOptions)

  return (
    <>
      <Helmet>
        <title>{t('pageTitle')} | App Name</title>
      </Helmet>
      <div className="container py-8">
        <h1 className="text-3xl font-bold">{t('welcome')}</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Total Users</p>
            <p className="text-2xl font-bold">{data.totalUsers}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Total Posts</p>
            <p className="text-2xl font-bold">{data.totalPosts}</p>
          </div>
        </div>
      </div>
    </>
  )
}
