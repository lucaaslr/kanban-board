import React from 'react'
import { Column, Task } from '../../types'
import { cn } from '../../utils/cn'

interface DragOverlayColumnProps {
  column: Column
  tasks: Record<string, Task>
}

const MAX_PREVIEW_TASKS = 3

export function DragOverlayColumn({ column, tasks }: DragOverlayColumnProps) {
  const visibleTasks = column.taskIds
    .slice(0, MAX_PREVIEW_TASKS)
    .map((id) => tasks[id])
    .filter(Boolean)

  const hiddenCount = Math.max(0, column.taskIds.length - MAX_PREVIEW_TASKS)

  return (
    <div
      className={cn(
        'w-72 rounded-xl overflow-hidden select-none cursor-grabbing',
        'bg-surface-100 dark:bg-surface-800',
        'shadow-overlay',
        'rotate-[1deg] scale-[1.02]'
      )}
    >
      {/* Header */}
      <div className="px-3.5 pt-3.5 pb-2.5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {column.title}
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {column.taskIds.length} task{column.taskIds.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Task previews */}
      {visibleTasks.length > 0 && (
        <div className="flex flex-col gap-1.5 px-2 pb-2">
          {visibleTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'rounded-md px-3 py-2',
                'bg-surface-0 dark:bg-surface-700',
                'border border-surface-200/80 dark:border-surface-600/40'
              )}
            >
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {task.title}
              </p>
            </div>
          ))}
          {hiddenCount > 0 && (
            <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 py-1">
              +{hiddenCount} more
            </p>
          )}
        </div>
      )}
    </div>
  )
}
