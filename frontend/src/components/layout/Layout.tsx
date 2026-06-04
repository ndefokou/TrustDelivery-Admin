import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useUIStore } from '../../stores'
import { useEffect } from 'react'

export default function Layout() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      toggleSidebar()
    }
  }, [location.pathname])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-primary-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-40 h-full bg-primary-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-16'
        }`}
      >
        <Sidebar />
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet key={location.pathname} />
        </main>
      </div>
    </div>
  )
}