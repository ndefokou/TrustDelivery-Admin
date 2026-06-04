import clsx from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300',
    success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size]
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, BadgeProps['variant']> = {
    awaiting_assignment: 'warning',
    assigned: 'info',
    in_transit: 'primary',
    delivered: 'success',
    failed: 'danger',
    active: 'success',
    offline: 'default',
    busy: 'warning',
    suspended: 'danger',
    pending: 'warning',
    completed: 'success',
    approved: 'success',
    rejected: 'danger',
  }

  const formatStatus = (s: string) => {
    return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return <Badge variant={statusColors[status] || 'default'}>{formatStatus(status)}</Badge>
}