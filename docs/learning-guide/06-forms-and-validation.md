# Forms and Validation

React Hook Form manages form state (input values, dirty/touched tracking, submission) without re-rendering the entire form on every keystroke. Zod v4 defines validation schemas that produce both runtime validation and TypeScript types. The shadcn/ui `<Form>` wrapper connects them together with accessible labels, error messages, and ARIA attributes.

## The Pattern

Every form follows this flow:

```
1. Define a Zod schema     → validates input at runtime
2. Infer a TypeScript type → type-checks the form data
3. Create a useForm hook   → manages form state with zodResolver
4. Build the JSX           → FormField + FormItem + FormLabel + FormControl + FormMessage
```

## Zod v4 Schemas

Zod v4 has a breaking change from v3: email validation uses `z.email()`, not `z.string().email()`. This project uses Zod v4.

### Auth Schemas

```typescript
// src/lib/validators/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .email({ error: 'Invalid email address' }) // Zod v4: z.email(), not z.string().email()
    .min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
  rememberMe: z.boolean(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name is required' })
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(50, { message: 'Name must be under 50 characters' }),
    email: z.email({ error: 'Invalid email address' }).min(1),
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain an uppercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain a number' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
```

### User Schemas

```typescript
// src/lib/validators/user.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.email({ error: 'Invalid email address' }).min(1),
  password: z.string().min(8),
  role: z.enum(['admin', 'user']).optional(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.email({ error: 'Invalid email address' }).optional(),
  role: z.enum(['admin', 'user']).optional(),
})

export type UpdateUserFormData = z.infer<typeof updateUserSchema>
```

Key Zod v4 details:

- **`z.email()`** — validates an email string. This is a top-level type in Zod v4, not a string method.
- **`z.infer<typeof schema>`** — extracts the TypeScript type from a schema, so you don't define the type twice.
- **`.refine()`** — adds cross-field validation (e.g., confirming passwords match).
- **`.optional()`** — makes a field not required (for update forms where you only send changed fields).

## The `@hookform/resolvers` Bridge

`zodResolver` from `@hookform/resolvers` connects Zod schemas to React Hook Form:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validators/auth'

const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: '',
    password: '',
    rememberMe: false,
  },
})
```

When the form submits, the resolver runs the Zod schema. If validation fails, errors are set on the corresponding fields. If it passes, the `onSubmit` handler receives typed, validated data.

## A Complete Form Example

```typescript
// src/components/forms/LoginForm.tsx
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
import { Checkbox } from '@/components/ui/checkbox'
import { loginSchema, type LoginFormData } from '@/lib/validators/auth'

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>
  isLoading?: boolean
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const { t } = useTranslation('auth')

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('emailPlaceholder')}
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0 font-normal">
                {t('rememberMe')}
              </FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('signingIn') : t('signIn')}
        </Button>
      </form>
    </Form>
  )
}
```

### How the shadcn Form Wrappers Work

- **`<Form {...form}>`** — wraps the React Hook Form context provider (so child components can access form state)
- **`<FormField>`** — connects a form field to React Hook Form's `Controller`, making the field controlled
- **`<FormItem>`** — container that generates a unique ID for accessibility
- **`<FormLabel>`** — renders a `<label>` linked to the input via `htmlFor`, turns red when there's an error
- **`<FormControl>`** — applies `aria-describedby` and `aria-invalid` to the input
- **`<FormMessage />`** — automatically shows the Zod validation error for that field (no props needed)

## Using Forms in Pages

The form component receives an `onSubmit` prop and an `isLoading` flag. The page handles the mutation:

```typescript
// src/routes/_public/login.tsx
function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()   // TanStack Query mutation

  const handleSubmit = (data: LoginFormData) => {
    login.mutate(data, {
      onSuccess: () => {
        void navigate({ to: '/dashboard' })
      },
    })
  }

  return (
    <Card>
      {login.error && (
        <div role="alert">{/* error message */}</div>
      )}
      <LoginForm onSubmit={handleSubmit} isLoading={login.isPending} />
    </Card>
  )
}
```

This separation keeps the form component reusable and testable — it doesn't know about routing or API calls.

## File Organization

```
src/lib/validators/        # Zod schemas
├── auth.ts                # loginSchema, registerSchema
└── user.ts                # createUserSchema, updateUserSchema, profileSchema

src/components/forms/      # Form components
├── LoginForm.tsx          # Login form
├── CreateUserForm.tsx     # Create user form
├── EditUserForm.tsx       # Edit user form
└── ProfileForm.tsx        # Profile settings form
```

See [Testing](./09-testing.md) for how to test forms (filling inputs, submitting, checking validation errors).
