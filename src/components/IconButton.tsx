import React from 'react'
import { cn } from '../utils/cn'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'danger' | 'accent'
  size?: 'sm' | 'md'
}

export function IconButton({
  children,
  className,
  variant = 'ghost',
  size = 'sm',
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-all duration-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/70',
        'disabled:pointer-events-none disabled:opacity-40',
        // sizes
        size === 'sm' && 'h-6 w-6',
        size === 'md' && 'h-8 w-8',
        // variants
        variant === 'ghost' && [
          'text-gray-400 hover:text-gray-700 hover:bg-black/6',
          'dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-white/10',
        ],
        variant === 'danger' && [
          'text-gray-400 hover:text-red-500 hover:bg-red-50',
          'dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-500/12',
        ],
        variant === 'accent' && [
          'text-accent-500 hover:text-accent-600 hover:bg-accent-50',
          'dark:text-accent-400 dark:hover:text-accent-300 dark:hover:bg-accent-500/12',
        ],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
