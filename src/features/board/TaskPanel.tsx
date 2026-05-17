import React, { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useBoardStore } from '../../store/boardStore'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../utils/cn'

interface TaskPanelProps {
  taskId: string
}

export function TaskPanel({ taskId }: TaskPanelProps) {
  const task = useBoardStore((s) => s.tasks[taskId])
  const updateTask = useBoardStore((s) => s.updateTask)
  const setSelectedTaskId = useUIStore((s) => s.setSelectedTaskId)

  const [notes, setNotes] = useState(task?.notes ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea on open
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // If the task disappears (profile switch, deletion), close the panel
  useEffect(() => {
    if (!task) setSelectedTaskId(null)
  }, [task, setSelectedTaskId])

  // Debounced auto-save
  useEffect(() => {
    if (!task) return
    const timer = setTimeout(() => {
      updateTask(taskId, { notes })
    }, 600)
    return () => clearTimeout(timer)
  }, [notes, taskId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTaskId(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setSelectedTaskId])

  if (!task) return null

  return (
    <div
      className={cn(
        'absolute top-0 right-0 bottom-0 z-20 w-[360px]',
        'flex flex-col',
        'bg-surface-0 dark:bg-surface-900',
        'border-l border-surface-200/80 dark:border-surface-800/60',
        'shadow-overlay animate-slide-right'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex-shrink-0 flex items-start gap-3 px-5 py-4',
          'border-b border-surface-200/70 dark:border-surface-800/50'
        )}
      >
        <h2 className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug pt-0.5">
          {task.title}
        </h2>
        <button
          type="button"
          onClick={() => setSelectedTaskId(null)}
          aria-label="Close panel"
          className={cn(
            'flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md',
            'text-gray-400 hover:text-gray-700 hover:bg-surface-100',
            'dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-surface-800',
            'transition-colors duration-100'
          )}
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-5 overflow-hidden">
        <label
          htmlFor="task-notes"
          className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2"
        >
          Notes
        </label>
        <textarea
          ref={textareaRef}
          id="task-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Take notes, save URLs, add reminders…"
          className={cn(
            'flex-1 w-full resize-none rounded-lg p-3 text-sm leading-relaxed',
            'bg-surface-50 dark:bg-surface-800',
            'border border-surface-200 dark:border-surface-700',
            'text-gray-800 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50',
            'transition-all duration-100'
          )}
        />
      </div>
    </div>
  )
}
