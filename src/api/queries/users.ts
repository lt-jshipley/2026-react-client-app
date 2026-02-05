import { queryOptions } from '@tanstack/react-query'
import { api } from '../client'
import type { User, Post } from '@/types'

export const usersQueryOptions = queryOptions({
  queryKey: ['users'],
  queryFn: () => api.get<User[]>('/users'),
})

export const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['users', userId],
    queryFn: () => api.get<User>(`/users/${userId}`),
    enabled: !!userId,
  })

export const userPostsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['users', userId, 'posts'],
    queryFn: () => api.get<Post[]>(`/users/${userId}/posts`),
    enabled: !!userId,
  })
