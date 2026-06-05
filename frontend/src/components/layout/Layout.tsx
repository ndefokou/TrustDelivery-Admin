import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useUIStore } from '../../stores'
import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Menu } from 'lucide-react'

export default function Layout() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const location = useLocation()
  const mainRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      toggleSidebar()
    }
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track scroll position for scroll-to-top button
  useEffect(() => {
    const main = mainRef.current
    if (!main) return

    const handleScroll = () => {
      setShowScrollTop(main.scrollTop > 400)
    }

    main.addEventListener('scroll', handleScroll)
    return () => main.removeEventListener('scroll', handleScroll)
  }, [])

  // Reset scroll position on route change
  useEffect(() => {
    const main = mainRef.current
    if (main) {
      main.scrollTop = 0
    }
  }, [location.pathname])

  const scrollToTop = () => {
    const main = mainRef.current
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

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
        <main ref={mainRef} className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 relative">
          <Outlet key={location.pathname} />

          {/* Scroll to top button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-20 right-4 sm:right-6 z-30 p-3 rounded-full bg-white dark:bg-primary-700 text-gray-700 dark:text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0 border border-gray-200 dark:border-primary-600"
              aria-label="Scroll to top"
            >
              <ArrowUp size={20} />
            </button>
          )}

          {/* Menu FAB - always visible on mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden fixed bottom-4 right-4 sm:right-6 z-30 p-4 rounded-full bg-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </main>
      </div>
    </div>
  )
}