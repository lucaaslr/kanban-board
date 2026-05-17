import React, { useState, useRef, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { useBoardStore } from '../../store/boardStore'
import { cn } from '../../utils/cn'

export function AddColumn() {
  const { addColumn } = useBoardStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  const submit = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    addColumn(trimmed)
    setTitle('')
    setOpen(false)
  }

  const cancel = () => {
    setTitle('')
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
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
          'flex-shrink-0 w-72 flex items-center gap-2.5 px-4 py-3',
          'rounded-xl border-2 border-dashed',
          'border-gray-200 dark:border-gray-700',
          'text-sm font-medium text-gray-400 dark:text-gray-500',
          'hover:border-accent-300 dark:hover:border-accent-700/60',
          'hover:text-accent-500 dark:hover:text-accent-400',
          'hover:bg-accent-50/50 dark:hover:bg-accent-900/20',
          'transition-all duration-150'
        )}
      >
        <Plus size={16} />
        Add column
      </button>
    )
  }

  return (
    <div
      className={cn(
        'flex-shrink-0 w-72 rounded-xl p-3 animate-scale-in',
        'bg-surface-100 dark:bg-surface-800/80',
        'shadow-card'
      )}
    >
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Column title…"
        className={cn(
          'w-full px-3 py-2 rounded-lg text-sm font-semibold outline-none',
          'bg-surface-0 dark:bg-surface-700',
          'border border-surface-200 dark:border-surface-600/60',
          'text-gray-800 dark:text-gray-100',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'focus:ring-2 focus:ring-accent-500/40 focus:border-accent-400',
          'transition-all duration-100'
        )}
      />
      <div className="flex items-center gap-2 mt-2.5">
        <button
          type="button"
          onClick={submit}
          disabled={!title.trim()}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold',
            'bg-accent-500 hover:bg-accent-600 text-white',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'transition-colors duration-100'
          )}
        >
          Add column
        </button>
        <button
          type="button"
          onClick={cancel}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
