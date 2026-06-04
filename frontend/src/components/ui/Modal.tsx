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
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start sm:items-center justify-center p-2 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className={clsx(
          'relative bg-white dark:bg-primary-800 rounded-lg shadow-xl w-full mx-2 sm:mx-0',
          'max-h-[90vh] overflow-y-auto',
          sizes[size]
        )}>
          {title && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-primary-700 sticky top-0 bg-white dark:bg-primary-800">
              <h3 className="text-base sm:text-lg font-semibold truncate pr-2">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          )}
          <div className="px-4 sm:px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  )
}