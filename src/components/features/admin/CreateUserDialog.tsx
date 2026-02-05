import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreateUserForm } from '@/components/forms/CreateUserForm'
import type { CreateUserFormData } from '@/lib/validators/user'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateUserFormData) => void | Promise<void>
  isLoading?: boolean
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateUserDialogProps) {
  const { t } = useTranslation('users')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.createUser')}</DialogTitle>
        </DialogHeader>
        <CreateUserForm
          key={open ? 'open' : 'closed'}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
