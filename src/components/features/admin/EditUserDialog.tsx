import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EditUserForm } from '@/components/forms/EditUserForm'
import type { UpdateUserFormData } from '@/lib/validators/user'
import type { User } from '@/types'

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSubmit: (data: UpdateUserFormData) => void | Promise<void>
  isLoading?: boolean
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading,
}: EditUserDialogProps) {
  const { t } = useTranslation('users')

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.editUser')}</DialogTitle>
        </DialogHeader>
        <EditUserForm
          key={user.id}
          onSubmit={onSubmit}
          isLoading={isLoading}
          defaultValues={{
            name: user.name,
            email: user.email,
            role: user.role,
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
