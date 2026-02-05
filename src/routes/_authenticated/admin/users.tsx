import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { usersQueryOptions } from '@/api/queries/users'
import { useCreateUser } from '@/api/mutations/users'
import { useUpdateUser } from '@/api/mutations/users'
import { useDeleteUser } from '@/api/mutations/users'
import { UserTable } from '@/components/features/admin/UserTable'
import { CreateUserDialog } from '@/components/features/admin/CreateUserDialog'
import { EditUserDialog } from '@/components/features/admin/EditUserDialog'
import { DeleteUserDialog } from '@/components/features/admin/DeleteUserDialog'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/api/client'
import type { User } from '@/types'
import type {
  CreateUserFormData,
  UpdateUserFormData,
} from '@/lib/validators/user'

export const Route = createFileRoute('/_authenticated/admin/users')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(usersQueryOptions),
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const { t } = useTranslation('users')
  const { data: users } = useSuspenseQuery(usersQueryOptions)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)
  }

  const handleCreate = (data: CreateUserFormData) => {
    createUser.mutate(data, {
      onSuccess: () => {
        setCreateDialogOpen(false)
        showSuccess(t('admin.feedback.createSuccess'))
      },
    })
  }

  const handleUpdate = (data: UpdateUserFormData) => {
    if (!editingUser) return
    updateUser.mutate(
      { id: editingUser.id, ...data },
      {
        onSuccess: () => {
          setEditingUser(null)
          showSuccess(t('admin.feedback.updateSuccess'))
        },
      }
    )
  }

  const handleDelete = () => {
    if (!deletingUser) return
    deleteUser.mutate(deletingUser.id, {
      onSuccess: () => {
        setDeletingUser(null)
        showSuccess(t('admin.feedback.deleteSuccess'))
      },
    })
  }

  const errorMessage = (() => {
    const error = createUser.error ?? updateUser.error ?? deleteUser.error
    if (!error) return null
    if (error instanceof ApiError) return error.message
    return t('admin.feedback.createFailed')
  })()

  return (
    <>
      <Helmet>
        <title>{t('admin.pageTitle')} | App Name</title>
      </Helmet>
      <div className="container py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('admin.pageTitle')}</h1>
          <Button
            onClick={() => {
              setCreateDialogOpen(true)
            }}
          >
            {t('admin.createUser')}
          </Button>
        </div>

        {successMessage && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        <div className="mt-6">
          <UserTable
            users={users}
            onEdit={setEditingUser}
            onDelete={setDeletingUser}
          />
        </div>

        <CreateUserDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreate}
          isLoading={createUser.isPending}
        />

        <EditUserDialog
          open={!!editingUser}
          onOpenChange={(open) => {
            if (!open) setEditingUser(null)
          }}
          user={editingUser}
          onSubmit={handleUpdate}
          isLoading={updateUser.isPending}
        />

        <DeleteUserDialog
          open={!!deletingUser}
          onOpenChange={(open) => {
            if (!open) setDeletingUser(null)
          }}
          user={deletingUser}
          onConfirm={handleDelete}
          isLoading={deleteUser.isPending}
        />
      </div>
    </>
  )
}
