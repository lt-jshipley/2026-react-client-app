import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { RootLayout } from '@/components/layouts/RootLayout'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { t } = useTranslation('common')

  return (
    <RootLayout>
      <Helmet>
        <title>{t('appName')}</title>
      </Helmet>
      <div className="container py-8">
        <h1 className="text-3xl font-bold">{t('navigation.home')}</h1>
        <p className="text-muted-foreground mt-4">Welcome to {t('appName')}.</p>
        <div className="mt-6 flex gap-4">
          <Link
            to="/login"
            className="bg-primary text-primary-foreground rounded px-4 py-2"
          >
            {t('navigation.dashboard')}
          </Link>
        </div>
      </div>
    </RootLayout>
  )
}
