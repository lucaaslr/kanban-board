import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, AlignLeft, ChevronUp } from 'lucide-react'
import { Task } from '../../types'
import { useBoardStore } from '../../store/boardStore'
import { EditableText } from '../../components/EditableText'
import { IconButton } from '../../components/IconButton'
import { cn } from '../../utils/cn'

interface TaskCardProps {
  task: Task
  columnId: string
}

export function TaskCard({ task, columnId }: TaskCardProps) {
  const { updateTask, deleteTask } = useBoardStore()
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task' as const,
      task,
      columnId,
    },
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform) ?? undefined,
    transition,
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      window.setTimeout(() => setConfirmDelete(false), 2500)
      return
    }
    deleteTask(task.id, columnId)
  }

  // Ghost placeholder shown while dragging
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[72px] rounded-lg border-2 border-dashed border-accent-300/50 dark:border-accent-500/25 bg-accent-50/40 dark:bg-accent-900/10"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg bg-surface-0 dark:bg-surface-800',
        'border border-surface-200/80 dark:border-surface-700/50',
        'shadow-card hover:shadow-card-md',
        'transition-all duration-150 cursor-grab active:cursor-grabbing',
        'animate-fade-in'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="p-3">
        {/* Actions — top-right, visible on hover */}
        <div
          className={cn(
            'absolute top-2 right-2 flex items-center gap-0.5',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-100'
          )}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((v) => !v)
            }}
            aria-label={expanded ? 'Collapse description' : 'Expand description'}
            title={expanded ? 'Collapse' : 'Add/edit description'}
          >
            {expanded ? <ChevronUp size={12} /> : <AlignLeft size={12} />}
          </IconButton>
          <IconButton
            variant={confirmDelete ? 'danger' : 'ghost'}
            onClick={handleDelete}
            aria-label={confirmDelete ? 'Confirm delete task' : 'Delete task'}
            title={confirmDelete ? 'Click again to confirm' : 'Delete task'}
          >
            <Trash2 size={12} />
          </IconButton>
        </div>

        {/* Title */}
        <div onPointerDown={(e) => e.stopPropagation()}>
          <EditableText
            value={task.title}
            onSave={(title) => updateTask(task.id, { title })}
            className={cn(
              'block w-full text-sm font-medium leading-snug pr-12',
              'text-gray-800 dark:text-gray-100'
            )}
            as="p"
            placeholder="Task title…"
          />
        </div>

        {/* Description — shown when expanded or already has content */}
        {(expanded || task.description) && (
          <div
            className="mt-2 animate-fade-in"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <EditableText
              value={task.description ?? ''}
              onSave={(description) => updateTask(task.id, { description })}
              className={cn(
                'block w-full text-xs leading-relaxed',
                'text-gray-500 dark:text-gray-400'
              )}
              as="p"
              multiline
              placeholder="Add a description…"
            />
          </div>
        )}

        {/* Description preview — when collapsed and has description */}
        {!expanded && task.description && (
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 truncate leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Delete confirmation indicator */}
      {confirmDelete && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-red-400/50 dark:ring-red-500/40 pointer-events-none animate-scale-in" />
      )}
    </div>
  )
}
