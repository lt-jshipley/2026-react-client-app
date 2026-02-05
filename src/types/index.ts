export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role?: 'admin' | 'user'
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: 'admin' | 'user'
}

// API response wrappers
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
}
