import clsx from 'clsx'
import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-2xl',
    xl: 'max-w-xl sm:max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-2 md:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className={clsx(
          'relative bg-white dark:bg-primary-800 rounded-t-lg sm:rounded-lg shadow-xl w-full sm:mx-2',
          'max-h-[95vh] sm:max-h-[90vh] overflow-y-auto',
          sizes[size]
        )}>
          {title && (
            <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-primary-700 sticky top-0 bg-white dark:bg-primary-800">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold truncate pr-2">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          )}
          <div className="px-3 sm:px-6 py-3 sm:py-4">{children}</div>
        </div>
      </div>
    </div>
  )
}