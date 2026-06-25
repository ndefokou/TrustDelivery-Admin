import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { 
  Bell, 
  Package, 
  XCircle, 
  UserPlus, 
  Store, 
  CheckCircle, 
  Receipt,
  CheckCheck
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Notification, NotificationType } from '../types'
import { Link } from 'react-router-dom'

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  new_paid_delivery: <Package className="text-primary" size={20} />,
  failed_delivery: <XCircle className="text-danger" size={20} />,
  expense_submission: <Receipt className="text-warning" size={20} />,
  new_merchant_registration: <Store className="text-success" size={20} />,
  new_carrier_registration: <UserPlus className="text-secondary" size={20} />,
  delivery_assigned: <CheckCircle className="text-info" size={20} />,
}

const notificationColors: Record<NotificationType, string> = {
  new_paid_delivery: 'bg-primary-50 dark:bg-primary-900',
  failed_delivery: 'bg-danger-50 dark:bg-danger-900',
  expense_submission: 'bg-warning-50 dark:bg-warning-900',
  new_merchant_registration: 'bg-success-50 dark:bg-success-900',
  new_carrier_registration: 'bg-secondary-50 dark:bg-secondary-900',
  delivery_assigned: 'bg-info-50 dark:bg-info-900',
}

export default function Notifications() {
  const { data, isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const notifications = data?.notifications || []
  const unreadCount = data?.unread_count || 0

  const handleMarkRead = (id: string) => {
    markRead.mutate(id)
  }

  const handleMarkAllRead = () => {
    markAllRead.mutate()
  }

  const getNotificationLink = (notification: Notification): string => {
    switch (notification.notification_type) {
      case 'new_paid_delivery':
      case 'failed_delivery':
      case 'delivery_assigned':
        return notification.reference_id ? `/deliveries/${notification.reference_id}` : '/deliveries'
      case 'expense_submission':
        return '/carriers'
      case 'new_merchant_registration':
        return notification.reference_id ? `/merchants/${notification.reference_id}` : '/merchants'
      case 'new_carrier_registration':
        return notification.reference_id ? `/carriers/${notification.reference_id}` : '/carriers'
      default:
        return '#'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-primary-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-primary-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-primary-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="danger" size="sm">
              {unreadCount} unread
            </Badge>
          )}
        </div>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
            >
              <CheckCheck size={18} />
              <span className="ml-2">Mark all as read</span>
            </Button>
          )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto text-gray-300 dark:text-primary-600 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors
                    ${notification.is_read 
                      ? 'bg-gray-50 dark:bg-primary-800/50' 
                      : `${notificationColors[notification.notification_type]} border-l-4 border-l-current`
                    }
                    hover:bg-gray-100 dark:hover:bg-primary-700/50
                  `}
                >
                  <Link 
                    to={getNotificationLink(notification)}
                    className="flex-1 flex items-start gap-3 sm:gap-4 min-w-0"
                    onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                  >
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                      ${notification.is_read ? 'bg-gray-200 dark:bg-primary-700' : 'bg-white dark:bg-primary-800'}
                    `}>
                      {notificationIcons[notification.notification_type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${notification.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </Link>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(notification.id)}
                      disabled={markRead.isPending}
                      title="Mark as read"
                    >
                      <CheckCheck size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
