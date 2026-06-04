import clsx from 'clsx'
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-3 py-2 border rounded-lg bg-white dark:bg-primary-700 border-gray-300 dark:border-primary-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export function Select({ label, error, className, children, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'w-full px-3 py-2 border rounded-lg bg-white dark:bg-primary-700 border-gray-300 dark:border-primary-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent',
          error && 'border-danger',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        className={clsx(
          'w-full px-3 py-2 border rounded-lg bg-white dark:bg-primary-700 border-gray-300 dark:border-primary-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}