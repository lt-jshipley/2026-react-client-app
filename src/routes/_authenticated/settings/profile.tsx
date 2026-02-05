import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ProfileForm } from '@/components/forms/ProfileForm'
import { useUpdateUser } from '@/api/mutations/users'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/api/client'
import type { ProfileFormData } from '@/lib/validators/user'

export const Route = createFileRoute('/_authenticated/settings/profile')({
  component: ProfileSettingsPage,
})

function ProfileSettingsPage() {
  const { t } = useTranslation('settings')
  const user = useAuthStore((s) => s.user)
  const updateAuthUser = useAuthStore((s) => s.updateUser)
  const updateUser = useUpdateUser()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = (data: ProfileFormData) => {
    if (!user) return
    setSuccessMessage(null)
    updateUser.mutate(
      { id: user.id, ...data },
      {
        onSuccess: () => {
          updateAuthUser(data)
          setSuccessMessage(t('profile.updateSuccess'))
        },
      }
    )
  }

  function getErrorMessage(error: Error): string {
    if (
      error instanceof ApiError &&
      error.data != null &&
      typeof error.data === 'object' &&
      'message' in error.data
    ) {
      return (error.data as { message: string }).message
    }
    return t('profile.updateFailed')
  }

  return (
    <>
      <Helmet>
        <title>{t('profile.pageTitle')} | My Application</title>
      </Helmet>
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('profile.pageTitle')}</CardTitle>
            <CardDescription>{t('profile.pageDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {updateUser.error && (
              <div
                role="alert"
                className="bg-destructive/10 text-destructive border-destructive/20 mb-4 rounded-md border px-4 py-3 text-sm"
              >
                {getErrorMessage(updateUser.error)}
              </div>
            )}
            {successMessage && (
              <div
                role="status"
                className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
              >
                {successMessage}
              </div>
            )}
            <ProfileForm
              onSubmit={handleSubmit}
              isLoading={updateUser.isPending}
              defaultValues={{
                name: user?.name ?? '',
                email: user?.email ?? '',
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
