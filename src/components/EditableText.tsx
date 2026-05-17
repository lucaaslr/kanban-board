import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
} from 'react'
import { cn } from '../utils/cn'

interface EditableTextProps {
  value: string
  onSave: (value: string) => void
  className?: string
  inputClassName?: string
  placeholder?: string
  multiline?: boolean
  /** Render tag when in read mode */
  as?: 'p' | 'h2' | 'h3' | 'span'
  /** Called when editing starts — useful to stop parent drag */
  onEditStart?: () => void
  onEditEnd?: () => void
}

export function EditableText({
  value,
  onSave,
  className,
  inputClassName,
  placeholder = 'Click to edit…',
  multiline = false,
  as: Tag = 'span',
  onEditStart,
  onEditEnd,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  // Keep draft in sync if parent changes the value externally
  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  // Auto-focus + select on enter edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const startEditing = () => {
    setDraft(value)
    setEditing(true)
    onEditStart?.()
  }

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    } else {
      setDraft(value) // revert if empty or unchanged
    }
    setEditing(false)
    onEditEnd?.()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      commit()
    }
    if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
      onEditEnd?.()
    }
  }

  const sharedInputClass = cn(
    'w-full bg-transparent resize-none outline-none rounded',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    className,
    inputClassName
  )

  if (editing) {
    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => e.stopPropagation()} // prevent drag-start while typing
        placeholder={placeholder}
        className={sharedInputClass}
        rows={3}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder={placeholder}
        className={sharedInputClass}
      />
    )
  }

  return (
    <Tag
      className={cn(
        'cursor-text rounded px-0.5 -mx-0.5 transition-colors duration-100',
        'hover:bg-black/5 dark:hover:bg-white/8',
        !value && 'opacity-40 italic',
        className
      )}
      onClick={startEditing}
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          startEditing()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Edit: ${value || placeholder}`}
    >
      {value || placeholder}
    </Tag>
  )
}
