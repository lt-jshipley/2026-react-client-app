import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
}

interface AuthActions {
  setAuth: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

type AuthStore = AuthState & AuthActions

// NOTE: Only store token in memory for security
// The refresh token should be in an HttpOnly cookie
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        user: null,
        isAuthenticated: false,

        setAuth: (token, user) =>
          set({ token, user, isAuthenticated: true }, false, 'auth/setAuth'),

        logout: () =>
          set(
            { token: null, user: null, isAuthenticated: false },
            false,
            'auth/logout'
          ),

        updateUser: (userData) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...userData } : null,
            }),
            false,
            'auth/updateUser'
          ),
      }),
      {
        name: 'auth-storage',
        // Only persist user, not token (for security)
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: 'AuthStore' }
  )
)
