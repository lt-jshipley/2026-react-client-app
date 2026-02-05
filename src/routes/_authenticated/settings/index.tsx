import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const { t } = useTranslation('common')

  return (
    <>
      <Helmet>
        <title>{t('navigation.settings')} | App Name</title>
      </Helmet>
      <div className="container py-8">
        <h1 className="text-3xl font-bold">{t('navigation.settings')}</h1>
        <div className="mt-6">
          <Link to="/settings/profile" className="text-primary hover:underline">
            Profile Settings
          </Link>
        </div>
      </div>
    </>
  )
}
