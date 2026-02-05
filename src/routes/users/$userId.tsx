import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { userQueryOptions } from '@/api/queries/users'
import { RootLayout } from '@/components/layouts/RootLayout'

export const Route = createFileRoute('/users/$userId')({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(userQueryOptions(params.userId)),
  component: UserPage,
})

function UserPage() {
  const { userId } = Route.useParams()
  const { data: user } = useSuspenseQuery(userQueryOptions(userId))

  return (
    <RootLayout>
      <Helmet>
        <title>{user.name} | App Name</title>
      </Helmet>
      <div className="container py-8">
        <h1 className="text-3xl font-bold">{user.name}</h1>
        <p className="text-muted-foreground mt-2">{user.email}</p>
      </div>
    </RootLayout>
  )
}
