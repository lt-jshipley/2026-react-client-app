import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'
import type { User, CreateUserInput, UpdateUserInput } from '@/types'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserInput) => api.post<User>('/users', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateUserInput & { id: string }) =>
      api.put<User>(`/users/${id}`, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['users', variables.id],
      })
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
