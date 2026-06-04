import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: { id: '1', email: 'admin@trustdelivery.cm', full_name: 'Admin User', role: 'admin' },
      token: 'demo-token',
      isAuthenticated: true,
      login: (user: User, token: string) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: true })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface UIState {
  sidebarOpen: boolean
  darkMode: boolean
  notificationsOpen: boolean
  toggleSidebar: () => void
  toggleDarkMode: () => void
  toggleNotifications: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  darkMode: false,
  notificationsOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return { darkMode: newMode }
  }),
  toggleNotifications: () => set((state) => ({ notificationsOpen: !state.notificationsOpen })),
}))