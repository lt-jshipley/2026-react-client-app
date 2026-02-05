import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .email({ error: 'Invalid email address' })
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
    email: z
      .email({ error: 'Invalid email address' })
      .min(1, { message: 'Email is required' }),
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, {
        message: 'Password must contain an uppercase letter',
      })
      .regex(/[0-9]/, { message: 'Password must contain a number' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
