import React, { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useBoardStore } from '../../store/boardStore'
import { BoardColumn } from './BoardColumn'
import { AddColumn } from './AddColumn'
import { DragOverlayCard } from './DragOverlayCard'
import { DragOverlayColumn } from './DragOverlayColumn'
import { ActiveDragItem, DragItemType } from '../../types'

// ─── Drop animation config ──────────────────────────────────────────────────

const dropAnimation: DropAnimation = {
  duration: 220,
  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0' } },
  }),
}

// ─── Board ──────────────────────────────────────────────────────────────────

export function Board() {
  // Subscribe only to what drives rendering. Actions are stable references.
  const columns = useBoardStore((s) => s.columns)
  const tasks = useBoardStore((s) => s.tasks)
  const columnOrder = useBoardStore((s) => s.columnOrder)

  const [activeItem, setActiveItem] = useState<ActiveDragItem | null>(null)

  // ── Sensors ────────────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require 6px of movement before activating — allows clicks through
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Find the column ID that currently owns the given task ID.
   * Reads from getState() so it is always fresh — even mid-drag when React
   * has not re-rendered yet after a preceding moveTask call.
   */
  const findColumnForTask = useCallback((taskId: string): string | null => {
    const { columns: cols } = useBoardStore.getState()
    for (const [colId, col] of Object.entries(cols)) {
      if (col.taskIds.includes(taskId)) return colId
    }
    return null
  }, [])

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const onDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveItem({
      id: active.id as string,
      type: active.data.current?.type as DragItemType,
    })
  }, [])

  /**
   * onDragOver fires continuously as the pointer moves.
   * We handle cross-column task movement here so the user sees real-time feedback.
   * Same-column reordering is handled in onDragEnd via arrayMove.
   */
  const onDragOver = useCallback(
    ({ active, over }: DragOverEvent) => {
      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      if (activeId === overId) return

      const activeType = active.data.current?.type as DragItemType
      if (activeType !== 'task') return // columns reorder only on dragEnd

      const activeColId = findColumnForTask(activeId)
      if (!activeColId) return

      const isOverColumn = over.data.current?.type === 'column'
      const overColId = isOverColumn ? overId : findColumnForTask(overId)

      if (!overColId) return
      if (activeColId === overColId) return // same column — handled in onDragEnd

      // ── Cross-column move ────────────────────────────────────────────────
      const overColumn = useBoardStore.getState().columns[overColId]
      if (!overColumn) return

      const overTaskIds = overColumn.taskIds
      const overTaskIndex = isOverColumn
        ? overTaskIds.length      // append to end of the column
        : overTaskIds.indexOf(overId) // insert before the hovered task

      useBoardStore.getState().moveTask(activeId, activeColId, overColId, Math.max(0, overTaskIndex))
    },
    [findColumnForTask]
  )

  /**
   * onDragEnd fires once when the user releases.
   * - Columns: finalise reorder with arrayMove
   * - Tasks: finalise same-column sort (cross-column already done in onDragOver)
   */
  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setActiveItem(null)

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      if (activeId === overId) return

      const activeType = active.data.current?.type as DragItemType

      // ── Column reorder ───────────────────────────────────────────────────
      if (activeType === 'column') {
        const current = useBoardStore.getState().columnOrder
        const fromIndex = current.indexOf(activeId)
        const toIndex = current.indexOf(overId)

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          useBoardStore.getState().reorderColumns(arrayMove(current, fromIndex, toIndex))
        }
        return
      }

      // ── Task same-column sort ────────────────────────────────────────────
      if (activeType === 'task') {
        const activeColId = findColumnForTask(activeId)
        if (!activeColId) return

        const isOverColumn = over.data.current?.type === 'column'
        const overColId = isOverColumn ? overId : findColumnForTask(overId)

        if (!overColId) return

        // Cross-column moves were already persisted in onDragOver
        if (activeColId !== overColId) return

        const taskIds = useBoardStore.getState().columns[activeColId]?.taskIds ?? []
        const fromIndex = taskIds.indexOf(activeId)

        let toIndex: number
        if (isOverColumn) {
          // Dropped on the column itself (e.g. below all cards) → move to end
          toIndex = taskIds.length - 1
        } else {
          toIndex = taskIds.indexOf(overId)
        }

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          useBoardStore.getState().reorderTasksInColumn(activeColId, arrayMove(taskIds, fromIndex, toIndex))
        }
      }
    },
    [findColumnForTask]
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  const activeTask = activeItem?.type === 'task' ? tasks[activeItem.id] : null
  const activeColumn =
    activeItem?.type === 'column' ? columns[activeItem.id] : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {/* ── Board scroll area ─────────────────────────────────────────────── */}
      <div className="h-full flex items-start gap-3 overflow-x-auto px-6 py-4 scrollbar-thin">
        <SortableContext
          items={columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          {columnOrder.map((colId) => {
            const column = columns[colId]
            if (!column) return null
            return (
              <BoardColumn key={colId} column={column} tasks={tasks} />
            )
          })}
        </SortableContext>

        {/* Sticky "Add column" button at the end */}
        <AddColumn />
      </div>

      {/* ── Drag overlay (rendered into body via portal) ──────────────────── */}
      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask && <DragOverlayCard task={activeTask} />}
          {activeColumn && (
            <DragOverlayColumn column={activeColumn} tasks={tasks} />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
}
