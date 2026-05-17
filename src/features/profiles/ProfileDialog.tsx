import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { IconButton } from '../../components/IconButton'

const EMOJIS = [
  '👤', '💼', '🎮', '🏠', '📚', '💪',
  '🎨', '🌱', '🛒', '✈️', '🎵', '🔬',
  '💡', '📝', '🎯', '⭐', '🔥', '⚡',
  '🏆', '🌙', '🎲', '🧩', '🌍', '🐾',
]

interface ProfileDialogProps {
  mode: 'create' | 'edit'
  initialName?: string
  initialEmoji?: string
  onSave: (name: string, emoji: string) => void
  onClose: () => void
}

export function ProfileDialog({
  mode,
  initialName = '',
  initialEmoji = '👤',
  onSave,
  onClose,
}: ProfileDialogProps) {
  const [name, setName] = useState(initialName)
  const [emoji, setEmoji] = useState(initialEmoji)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed, emoji)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal
        aria-label={mode === 'create' ? 'Create profile' : 'Edit profile'}
        className={cn(
          'w-full max-w-sm rounded-xl shadow-overlay',
          'bg-surface-0 dark:bg-surface-800',
          'border border-surface-200/80 dark:border-surface-700/60',
          'animate-scale-in'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200/70 dark:border-surface-700/50">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {mode === 'create' ? 'New profile' : 'Edit profile'}
          </h2>
          <IconButton onClick={onClose} aria-label="Close">
            <X size={14} />
          </IconButton>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Emoji picker */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    'h-9 w-full rounded-lg text-xl flex items-center justify-center transition-all duration-100',
                    'hover:bg-surface-100 dark:hover:bg-surface-700',
                    emoji === e
                      ? 'bg-accent-50 dark:bg-accent-500/15 ring-2 ring-accent-500/60'
                      : 'bg-transparent'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label
              htmlFor="profile-name"
              className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5"
            >
              Name
            </label>
            <input
              ref={inputRef}
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Gaming, Learning…"
              maxLength={32}
              className={cn(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-surface-50 dark:bg-surface-900',
                'border border-surface-200 dark:border-surface-700',
                'text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600',
                'focus:outline-none focus:ring-2 focus:ring-accent-500/60 focus:border-accent-500/60',
                'transition-all duration-100'
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-100',
                'text-gray-600 dark:text-gray-400',
                'hover:bg-surface-100 dark:hover:bg-surface-700',
                'border border-surface-200 dark:border-surface-700'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-100',
                'bg-accent-500 text-white',
                'hover:bg-accent-600',
                'disabled:opacity-40 disabled:pointer-events-none'
              )}
            >
              {mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
