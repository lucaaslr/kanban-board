import React from 'react'
import { Task } from '../../types'
import { cn } from '../../utils/cn'

interface DragOverlayCardProps {
  task: Task
}

export function DragOverlayCard({ task }: DragOverlayCardProps) {
  return (
    <div
      className={cn(
        'w-full rounded-lg p-3 select-none',
        'bg-surface-0 dark:bg-surface-800',
        'border border-accent-300/60 dark:border-accent-500/40',
        'shadow-overlay',
        'rotate-[1.5deg] scale-[1.03]',
        'cursor-grabbing'
      )}
    >
      <p className="text-sm font-medium leading-snug text-gray-800 dark:text-gray-100">
        {task.title}
      </p>
      {task.description && (
        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 truncate">
          {task.description}
        </p>
      )}
    </div>
  )
}
