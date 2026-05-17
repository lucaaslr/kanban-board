import React from 'react'
import { cn } from '../utils/cn'

interface EmptyStateProps {
  message: string
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({ message, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-6 px-3 rounded-lg',
        'border-2 border-dashed border-gray-200 dark:border-gray-700/60',
        'text-center transition-colors',
        className
      )}
    >
      {icon && (
        <span className="text-2xl opacity-30 select-none" aria-hidden>
          {icon}
        </span>
      )}
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{message}</p>
    </div>
  )
}
