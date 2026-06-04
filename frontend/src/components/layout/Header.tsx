import { useAuthStore, useUIStore } from '../../stores'
import { useNotifications } from '../../hooks/useApi'
import {
  Bell,
  Menu,
  Moon,
  Sun,
  User,
  LogOut
} from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuthStore()
  const { darkMode, toggleDarkMode, toggleSidebar } = useUIStore()
  const { data: notifications } = useNotifications()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const unreadCount = notifications?.unread_count || 0

  return (
    <header className="h-16 bg-white dark:bg-primary-800 border-b border-gray-200 dark:border-primary-700 flex items-center justify-between px-4">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-primary-700 lg:hidden"
      >
        <Menu size={20} />
      </button>
      <div className="hidden lg:block w-8" />

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-primary-700"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-primary-700 relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-primary-700"
          >
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium hidden sm:block">
              {user?.full_name || 'Admin'}
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-primary-800 rounded-lg shadow-lg border border-gray-200 dark:border-primary-700 py-1 z-50">
              <button
                onClick={() => {
                  logout()
                  setUserMenuOpen(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-gray-100 dark:hover:bg-primary-700"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}