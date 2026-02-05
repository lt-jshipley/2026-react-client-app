import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  updateUserSchema,
  type UpdateUserFormData,
} from '@/lib/validators/user'

interface EditUserFormProps {
  onSubmit: (data: UpdateUserFormData) => void | Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<UpdateUserFormData>
}

export function EditUserForm({
  onSubmit,
  isLoading,
  defaultValues,
}: EditUserFormProps) {
  const { t } = useTranslation('users')

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      role: defaultValues?.role ?? 'user',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('admin.form.name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('admin.form.namePlaceholder')}
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('admin.form.email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('admin.form.emailPlaceholder')}
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('admin.form.role')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('admin.form.rolePlaceholder')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">
                    {t('admin.form.roleUser')}
                  </SelectItem>
                  <SelectItem value="admin">
                    {t('admin.form.roleAdmin')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('admin.form.saving') : t('admin.editUser')}
        </Button>
      </form>
    </Form>
  )
}
