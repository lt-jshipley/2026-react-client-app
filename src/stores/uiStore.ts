import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  locale: string
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: UIState['theme']) => void
  setLocale: (locale: string) => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: 'system',
        locale: 'en',

        toggleSidebar: () =>
          set(
            (state) => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            'ui/toggleSidebar'
          ),

        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }, false, 'ui/setSidebarOpen'),

        setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),

        setLocale: (locale) => set({ locale }, false, 'ui/setLocale'),
      }),
      { name: 'ui-storage' }
    ),
    { name: 'UIStore' }
  )
)
