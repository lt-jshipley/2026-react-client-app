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

export const Route = createFileRoute('/_public/login')({
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const login = useLogin()

  const handleSubmit = async (data: { email: string; password: string }) => {
    await login.mutateAsync(data)
    void navigate({ to: '/dashboard' })
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
