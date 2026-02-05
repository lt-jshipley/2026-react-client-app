import { queryOptions } from '@tanstack/react-query'
import { api } from '../client'

interface DashboardData {
  totalUsers: number
  totalPosts: number
  recentActivity: {
    id: string
    type: string
    description: string
    createdAt: string
  }[]
}

export const dashboardQueryOptions = queryOptions({
  queryKey: ['dashboard'],
  queryFn: () => api.get<DashboardData>('/dashboard'),
})

export function fetchDashboardData() {
  return api.get<DashboardData>('/dashboard')
}
