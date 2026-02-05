import { useMutation } from '@tanstack/react-query'
import { api } from '../client'
import { useAuthStore } from '@/stores/authStore'

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  name: string
  email: string
  password: string
}

interface AuthResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
  }
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: LoginInput) =>
      api.post<AuthResponse>('/auth/login', data),
    onSuccess: (data) => {
      setAuth(data.token, data.user)
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: RegisterInput) =>
      api.post<AuthResponse>('/auth/register', data),
    onSuccess: (data) => {
      setAuth(data.token, data.user)
    },
  })
}
