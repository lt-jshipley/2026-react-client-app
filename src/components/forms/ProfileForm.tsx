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
import { profileSchema, type ProfileFormData } from '@/lib/validators/user'

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => void | Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<ProfileFormData>
}

export function ProfileForm({
  onSubmit,
  isLoading,
  defaultValues,
}: ProfileFormProps) {
  const { t } = useTranslation('settings')

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('profile.namePlaceholder')}
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
              <FormLabel>{t('profile.email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('profile.emailPlaceholder')}
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('profile.saving') : t('profile.saveChanges')}
        </Button>
      </form>
    </Form>
  )
}
