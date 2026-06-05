import { useAuthStore, useUIStore } from '../../stores'
import { useNotifications } from '../../hooks/useApi'
import {
  Bell,
  Moon,
  Sun,
  User,
  LogOut
} from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuthStore()
  const { darkMode, toggleDarkMode } = useUIStore()
  const { data: notifications } = useNotifications()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const unreadCount = notifications?.unread_count || 0

  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-primary-800 border-b border-gray-200 dark:border-primary-700 flex items-center justify-end px-3 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-primary-700"
        >
          {darkMode ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
        </button>

        <div className="relative">
          <button
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-primary-700 relative"
          >
            <Bell size={18} className="sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-danger text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-primary-700"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-secondary rounded-full flex items-center justify-center">
              <User size={14} className="sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="text-sm font-medium hidden sm:block truncate max-w-[120px]">
              {user?.full_name || 'Admin'}
            </span>
          </button>

          {userMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 sm:hidden"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white dark:bg-primary-800 rounded-lg shadow-lg border border-gray-200 dark:border-primary-700 py-1 z-50">
                <button
                  onClick={() => {
                    logout()
                    setUserMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-danger hover:bg-gray-100 dark:hover:bg-primary-700"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}