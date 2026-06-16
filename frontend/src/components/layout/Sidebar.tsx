import { NavLink, useLocation } from 'react-router-dom'
import { useUIStore } from '../../stores'
import {
  LayoutDashboard,
  Package,
  Bike,
  Store,
  FileText,
  CreditCard,
  Settings,
  ChevronDown,
  X,
  Banknote
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface NavItem {
  name: string
  path: string
  icon: React.ReactNode
  children?: { name: string; path: string }[]
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
  {
    name: 'Deliveries',
    path: '/deliveries',
    icon: <Package size={20} />,
    children: [
      { name: 'All Deliveries', path: '/deliveries' },
      { name: 'Awaiting Assignment', path: '/deliveries/awaiting' },
      { name: 'Assigned', path: '/deliveries?status=assigned' },
      { name: 'In Transit', path: '/deliveries?status=in_transit' },
      { name: 'Delivered', path: '/deliveries?status=delivered' },
      { name: 'Failed', path: '/deliveries?status=failed' },
    ],
  },
  {
    name: 'Riders',
    path: '/riders',
    icon: <Bike size={20} />,
    children: [
      { name: 'Rider List', path: '/riders' },
      { name: 'Rider Performance', path: '/riders?tab=performance' },
      { name: 'Rider Expenses', path: '/riders?tab=expenses' },
      { name: 'Rider Collections', path: '/riders/collections' },
    ],
  },
  {
    name: 'Merchants',
    path: '/merchants',
    icon: <Store size={20} />,
    children: [
      { name: 'Merchant List', path: '/merchants' },
      { name: 'Merchant Activity', path: '/merchants?tab=activity' },
    ],
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: <FileText size={20} />,
    children: [
      { name: 'Daily Reports', path: '/reports?tab=daily' },
      { name: 'Weekly Reports', path: '/reports?tab=weekly' },
      { name: 'Monthly Reports', path: '/reports?tab=monthly' },
      { name: 'Revenue Reports', path: '/reports?tab=revenue' },
      { name: 'Failed Deliveries', path: '/reports?tab=failed' },
    ],
  },
  { name: 'Payments', path: '/payments', icon: <CreditCard size={20} /> },
  { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
]

function isActivePath(path: string, pathname: string, search: string) {
  const [expectedPath, expectedSearch] = path.split('?')
  if (pathname !== expectedPath) return false
  return search === (expectedSearch ? `?${expectedSearch}` : '')
}

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Deliveries'])
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024

  useEffect(() => {
    for (const item of navItems) {
      if (item.children) {
        for (const child of item.children) {
          if (isActivePath(child.path, location.pathname, location.search)) {
            setExpandedItems((prev) => (prev.includes(item.name) ? prev : [...prev, item.name]))
            return
          }
        }
      }
    }
  }, [location])

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    )
  }

  const handleNavClick = () => {
    if (isMobile && sidebarOpen) {
      toggleSidebar()
    }
  }

  return (
    <>
      <aside
        className={`h-full bg-primary-900 text-white transition-all duration-300 overflow-y-auto scrollbar-thin ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-16'
        }`}
      >
        {/* Logo / Title */}
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 border-b border-primary-700">
          {sidebarOpen && (
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">TrustDelivery</h1>
          )}
          {/* Mobile close button */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 sm:p-2 hover:bg-primary-700 rounded lg:hidden"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-3 sm:mt-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.name)}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-primary-700 ${
                        expandedItems.includes(item.name) ? 'bg-primary-700' : ''
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left truncate">{item.name}</span>
                          <ChevronDown
                            size={16}
                            className={`transition-transform flex-shrink-0 ${
                              expandedItems.includes(item.name) ? 'rotate-180' : ''
                            }`}
                          />
                        </>
                      )}
                    </button>
                    {sidebarOpen && expandedItems.includes(item.name) && (
                      <ul className="mt-1 ml-3 sm:ml-4 pl-3 sm:pl-4 border-l border-primary-700 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <NavLink
                              to={child.path}
                              onClick={handleNavClick}
                              className={() =>
                                `block px-2 sm:px-3 py-1.5 sm:py-2 text-sm rounded-lg transition-colors truncate ${
                                  isActivePath(child.path, location.pathname, location.search)
                                    ? 'bg-secondary text-white'
                                    : 'text-gray-300 hover:bg-primary-700'
                                }`
                              }
                            >
                              <span className="truncate">{child.name}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-secondary text-white'
                          : 'text-gray-300 hover:bg-primary-700'
                      }`
                    }
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {sidebarOpen && <span className="truncate">{item.name}</span>}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}