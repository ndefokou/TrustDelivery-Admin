import clsx from 'clsx'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-gray-200 dark:border-primary-700',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-primary-700', className)}>
      {children}
    </div>
  )
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('px-4 sm:px-6 py-3 sm:py-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={clsx('text-base sm:text-lg font-semibold', className)}>{children}</h3>
}