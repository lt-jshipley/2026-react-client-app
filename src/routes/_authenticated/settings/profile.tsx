import { createFileRoute } from '@tanstack/react-router'
import { Helmet } from 'react-helmet-async'

export const Route = createFileRoute('/_authenticated/settings/profile')({
  component: ProfileSettingsPage,
})

function ProfileSettingsPage() {
  return (
    <>
      <Helmet>
        <title>Profile Settings | App Name</title>
      </Helmet>
      <div className="container py-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-4">
          Manage your profile information here.
        </p>
      </div>
    </>
  )
}
