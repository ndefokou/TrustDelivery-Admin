import { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={`overflow-x-auto -mx-4 sm:mx-0 ${className}`}>
      <div className="min-w-[500px] px-4 sm:px-0">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-primary-700">
          {children}
        </table>
      </div>
    </div>
  )
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="bg-gray-50 dark:bg-primary-700">{children}</thead>
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="bg-white dark:bg-primary-800 divide-y divide-gray-200 dark:divide-primary-700">{children}</tbody>
}

export function Tr({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-primary-700 ${className}` } onClick={onClick}>
      {children}
    </tr>
  )
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  )
}

export function Td({ children, className, colSpan }: { children: ReactNode; className?: string; colSpan?: number }) {
  return <td className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm ${className}`} colSpan={colSpan}>{children}</td>
}