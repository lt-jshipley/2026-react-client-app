import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { usersQueryOptions } from '@/api/queries/users'
import { RootLayout } from '@/components/layouts/RootLayout'

export const Route = createFileRoute('/users/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(usersQueryOptions),
  component: UsersPage,
})

function UsersPage() {
  const { data: users } = useSuspenseQuery(usersQueryOptions)

  return (
    <RootLayout>
      <Helmet>
        <title>Users | App Name</title>
      </Helmet>
      <div className="container py-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="mt-6 space-y-2">
          {users.map((user) => (
            <div key={user.id} className="rounded-lg border p-4">
              <Link
                to="/users/$userId"
                params={{ userId: user.id }}
                className="text-primary hover:underline"
              >
                {user.name}
              </Link>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          ))}
        </div>
      </div>
    </RootLayout>
  )
}
