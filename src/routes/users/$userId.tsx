import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { userQueryOptions, userPostsQueryOptions } from '@/api/queries/users'
import { RootLayout } from '@/components/layouts/RootLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/users/$userId')({
  loader: ({ params, context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(userQueryOptions(params.userId)),
      context.queryClient.ensureQueryData(userPostsQueryOptions(params.userId)),
    ]),
  component: UserPage,
})

function UserPage() {
  const { userId } = Route.useParams()
  const { t } = useTranslation('users')
  const { data: user } = useSuspenseQuery(userQueryOptions(userId))
  const { data: posts } = useSuspenseQuery(userPostsQueryOptions(userId))

  return (
    <RootLayout>
      <Helmet>
        <title>{user.name} | App Name</title>
      </Helmet>
      <div className="container py-8">
        <h1 className="text-3xl font-bold">{user.name}</h1>
        <p className="text-muted-foreground mt-2">{user.email}</p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">
            {t('postsHeading', { count: posts.length })}
          </h2>

          {posts.length === 0 ? (
            <p className="text-muted-foreground mt-4">{t('noPosts')}</p>
          ) : (
            <div className="mt-4 grid gap-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {t('publishedOn', {
                        date: new Date(post.createdAt).toLocaleDateString(),
                      })}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p>{post.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </RootLayout>
  )
}
