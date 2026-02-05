import { z } from 'zod'

export const createUserSchema = z.object({
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
    .min(8, { message: 'Password must be at least 8 characters' }),
  role: z.enum(['admin', 'user']).optional(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name must be under 50 characters' })
    .optional(),
  email: z.email({ error: 'Invalid email address' }).optional(),
  role: z.enum(['admin', 'user']).optional(),
})

export type UpdateUserFormData = z.infer<typeof updateUserSchema>
