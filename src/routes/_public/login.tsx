import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoginForm } from '@/components/forms/LoginForm'
import { useLogin } from '@/api/mutations/auth'
import { ApiError } from '@/api/client'

export const Route = createFileRoute('/_public/login')({
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const login = useLogin()

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      await login.mutateAsync(data)
      void navigate({ to: '/dashboard' })
    } catch {
      // Error is captured by mutation state and displayed in the form
    }
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
    return t('loginFailed')
  }

  return (
    <>
      <Helmet>
        <title>{t('signIn')} | My Application</title>
      </Helmet>
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('signIn')}</CardTitle>
            <CardDescription>{t('emailPlaceholder')}</CardDescription>
          </CardHeader>
          <CardContent>
            {login.error && (
              <div
                role="alert"
                className="bg-destructive/10 text-destructive border-destructive/20 mb-4 rounded-md border px-4 py-3 text-sm"
              >
                {getErrorMessage(login.error)}
              </div>
            )}
            <LoginForm onSubmit={handleSubmit} isLoading={login.isPending} />
            <p className="text-muted-foreground mt-4 text-center text-sm">
              {t('noAccount')}{' '}
              <Link to="/register" className="text-primary hover:underline">
                {t('signUp')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
