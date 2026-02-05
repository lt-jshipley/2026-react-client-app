import { useTranslation } from 'react-i18next'
import { MoreHorizontal } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@/types'

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const { t } = useTranslation('users')
  const { t: tCommon } = useTranslation('common')

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('admin.table.name')}</TableHead>
          <TableHead>{t('admin.table.email')}</TableHead>
          <TableHead>{t('admin.table.role')}</TableHead>
          <TableHead>{t('admin.table.createdAt')}</TableHead>
          <TableHead className="w-[70px]">{t('admin.table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="capitalize">{user.role}</TableCell>
            <TableCell>
              {new Date(user.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('admin.table.actions')}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      onEdit(user)
                    }}
                  >
                    {tCommon('actions.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      onDelete(user)
                    }}
                  >
                    {tCommon('actions.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
