import React, { useState } from 'react'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripHorizontal, Trash2 } from 'lucide-react'
import { Column, Task } from '../../types'
import { useBoardStore } from '../../store/boardStore'
import { TaskCard } from './TaskCard'
import { AddTask } from './AddTask'
import { EditableText } from '../../components/EditableText'
import { IconButton } from '../../components/IconButton'
import { EmptyState } from '../../components/EmptyState'
import { cn } from '../../utils/cn'

interface BoardColumnProps {
  column: Column
  tasks: Record<string, Task>
}

export function BoardColumn({ column, tasks }: BoardColumnProps) {
  const { updateColumnTitle, deleteColumn } = useBoardStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column' as const,
      column,
    },
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform) ?? undefined,
    transition,
  }

  const columnTasks = column.taskIds.map((id) => tasks[id]).filter(Boolean)

  const handleDelete = () => {
    if (column.taskIds.length > 0 && !confirmDelete) {
      setConfirmDelete(true)
      window.setTimeout(() => setConfirmDelete(false), 2500)
      return
    }
    deleteColumn(column.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex-shrink-0 w-72 flex flex-col rounded-xl',
        'bg-surface-100 dark:bg-surface-800/70',
        'shadow-card',
        'transition-opacity duration-150',
        isDragging ? 'opacity-40' : 'opacity-100'
      )}
    >
      {/* ── Column header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 flex-shrink-0">
        {/* Drag handle — only this triggers column drag */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className={cn(
            'flex-shrink-0 cursor-grab active:cursor-grabbing',
            'text-gray-300 dark:text-gray-600',
            'hover:text-gray-500 dark:hover:text-gray-400',
            'transition-colors duration-100 rounded p-0.5 -m-0.5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60'
          )}
          aria-label="Drag to reorder column"
        >
          <GripHorizontal size={15} />
        </button>

        {/* Editable column title */}
        <div className="flex-1 min-w-0">
          <EditableText
            value={column.title}
            onSave={(title) => updateColumnTitle(column.id, title)}
            className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate"
            as="h2"
            placeholder="Column title…"
          />
        </div>

        {/* Task count badge */}
        <span
          className={cn(
            'flex-shrink-0 text-[11px] font-mono font-medium',
            'text-gray-400 dark:text-gray-500',
            'bg-gray-200/70 dark:bg-gray-700/70',
            'rounded px-1.5 py-0.5 leading-none'
          )}
        >
          {column.taskIds.length}
        </span>

        {/* Delete column */}
        <IconButton
          variant={confirmDelete ? 'danger' : 'ghost'}
          onClick={handleDelete}
          aria-label={
            confirmDelete
              ? 'Click again to permanently delete column'
              : 'Delete column'
          }
          title={
            confirmDelete
              ? `Delete "${column.title}" and all its tasks?`
              : 'Delete column'
          }
        >
          <Trash2 size={13} />
        </IconButton>
      </div>

      {/* ── Task list ──────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex flex-col gap-2 px-2 flex-1',
          'overflow-y-auto scrollbar-thin',
          'max-h-[calc(100vh-14rem)]',
          // Ensure empty columns still receive task drops
          columnTasks.length === 0 ? 'min-h-[80px]' : 'min-h-0'
        )}
      >
        <SortableContext
          items={column.taskIds}
          strategy={verticalListSortingStrategy}
        >
          {columnTasks.length === 0 ? (
            <EmptyState message="No tasks yet — add one below" icon="📋" />
          ) : (
            columnTasks.map((task) => (
              <TaskCard key={task.id} task={task} columnId={column.id} />
            ))
          )}
        </SortableContext>
      </div>

      {/* ── Add task ───────────────────────────────────────────────────── */}
      <div className="px-2 pb-2.5 pt-1 flex-shrink-0">
        <AddTask columnId={column.id} />
      </div>

      {/* Delete confirmation ring */}
      {confirmDelete && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-red-400/50 dark:ring-red-500/40 pointer-events-none animate-scale-in" />
      )}
    </div>
  )
}
