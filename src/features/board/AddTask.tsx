import React, { useState, useRef, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { useBoardStore } from '../../store/boardStore'
import { cn } from '../../utils/cn'

interface AddTaskProps {
  columnId: string
}

export function AddTask({ columnId }: AddTaskProps) {
  const { addTask } = useBoardStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      textareaRef.current?.focus()
    }
  }, [open])

  const submit = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    addTask(columnId, trimmed)
    setTitle('')
    // Keep form open for rapid task entry
    textareaRef.current?.focus()
  }

  const cancel = () => {
    setTitle('')
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
    if (e.key === 'Escape') {
      cancel()
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg',
          'text-xs font-medium text-gray-400 dark:text-gray-500',
          'hover:text-gray-600 dark:hover:text-gray-300',
          'hover:bg-black/5 dark:hover:bg-white/6',
          'transition-colors duration-100'
        )}
      >
        <Plus size={13} />
        Add task
      </button>
    )
  }

  return (
    <div className="animate-scale-in">
      <div
        className={cn(
          'rounded-lg bg-surface-0 dark:bg-surface-800',
          'border border-surface-200 dark:border-surface-700/60',
          'shadow-card-md ring-1 ring-accent-500/25'
        )}
      >
        <textarea
          ref={textareaRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task title… (Enter to add, Shift+Enter for new line)"
          rows={2}
          className={cn(
            'w-full px-3 pt-2.5 pb-1 text-sm resize-none outline-none',
            'bg-transparent text-gray-800 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'font-medium'
          )}
        />
        <div className="flex items-center gap-2 px-3 pb-2.5">
          <button
            type="button"
            onClick={submit}
            disabled={!title.trim()}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-semibold',
              'bg-accent-500 hover:bg-accent-600 text-white',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-colors duration-100'
            )}
          >
            Add
          </button>
          <button
            type="button"
            onClick={cancel}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={13} />
          </button>
          <span className="ml-auto text-[10px] text-gray-300 dark:text-gray-600 font-mono">
            ↵ add · esc cancel
          </span>
        </div>
      </div>
    </div>
  )
}
