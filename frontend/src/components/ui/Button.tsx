import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-secondary text-white hover:bg-secondary-700',
    secondary: 'bg-gray-100 dark:bg-primary-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-primary-600',
    danger: 'bg-danger text-white hover:bg-danger-700',
    success: 'bg-success text-white hover:bg-success-700',
    warning: 'bg-warning text-white hover:bg-warning-700',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-primary-700',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}