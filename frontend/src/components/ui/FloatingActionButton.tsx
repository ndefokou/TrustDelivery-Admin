import { ReactNode } from 'react'
import clsx from 'clsx'

interface FloatingActionButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
}

export function FloatingActionButton({
  children,
  onClick,
  className,
  variant = 'secondary',
  size = 'md',
}: FloatingActionButtonProps) {
  const variants = {
    primary: 'bg-secondary text-white shadow-secondary/30 hover:bg-secondary-700',
    secondary: 'bg-primary-800 text-white shadow-primary-900/30 hover:bg-primary-700',
    danger: 'bg-danger text-white shadow-danger/30 hover:bg-danger-700',
    success: 'bg-success text-white shadow-success/30 hover:bg-success-700',
    warning: 'bg-warning text-white shadow-warning/30 hover:bg-warning-700',
  }

  const sizes = {
    sm: 'p-3 rounded-full text-sm',
    md: 'p-4 rounded-full text-base',
    lg: 'p-4 sm:p-5 rounded-full text-lg',
  }

  return (
    <button
      onClick={onClick}
      className={clsx(
        'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40',
        'flex items-center justify-center gap-2',
        'shadow-lg hover:shadow-xl transition-all duration-300',
        'hover:-translate-y-1 active:translate-y-0',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  )
}

interface ScrollToTopButtonProps {
  className?: string
}

export function ScrollToTopButton({ className }: ScrollToTopButtonProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      className={clsx(
        'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40',
        'p-3 rounded-full bg-white dark:bg-primary-700',
        'text-gray-700 dark:text-white shadow-lg',
        'hover:shadow-xl transition-all duration-300',
        'hover:-translate-y-1 active:translate-y-0',
        className
      )}
      aria-label="Scroll to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  )
}
