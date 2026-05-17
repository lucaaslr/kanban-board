import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { arrayMove } from '@dnd-kit/sortable'
import { generateId } from '../utils/id'
import { createSeedState } from '../utils/seed'
import type { BoardState, Task } from '../types'

// ─── Action Definitions ────────────────────────────────────────────────────

interface BoardActions {
  // Column actions
  addColumn: (title: string) => void
  renameColumn: (columnId: string, title: string) => void
  updateColumnTitle: (columnId: string, title: string) => void
  deleteColumn: (columnId: string) => void
  moveColumn: (fromIndex: number, toIndex: number) => void
  reorderColumns: (newOrder: string[]) => void

  // Task actions
  addTask: (columnId: string, title: string, description?: string) => void
  updateTask: (taskId: string, changes: Partial<Pick<Task, 'title' | 'description'>>) => void
  deleteTask: (taskId: string, columnId: string) => void
  moveTask: (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    toIndex: number
  ) => void
  reorderTasksInColumn: (columnId: string, newTaskIds: string[]) => void
}

// ─── Store Type ────────────────────────────────────────────────────────────

type Store = BoardState & BoardActions

// ─── Store Implementation ──────────────────────────────────────────────────

export const useBoardStore = create<Store>()(
  persist(
    (set) => ({
      // Initial state (overridden by persisted state if available)
      ...createSeedState(),

      // ── Column Actions ──────────────────────────────────────────────────

      addColumn: (title) => {
        const id = generateId()
        set((state) => ({
          columns: {
            ...state.columns,
            [id]: { id, title, taskIds: [] },
          },
          columnOrder: [...state.columnOrder, id],
        }))
      },

      renameColumn: (columnId, title) =>
        set((state) => ({
          columns: {
            ...state.columns,
            [columnId]: { ...state.columns[columnId], title },
          },
        })),

      // Alias for renameColumn (used by BoardColumn component)
      updateColumnTitle: (columnId, title) =>
        set((state) => ({
          columns: {
            ...state.columns,
            [columnId]: { ...state.columns[columnId], title },
          },
        })),

      deleteColumn: (columnId) =>
        set((state) => {
          const column = state.columns[columnId]
          if (!column) return state

          // Remove all tasks belonging to this column
          const taskIdSet = new Set(column.taskIds)
          const newTasks = Object.fromEntries(
            Object.entries(state.tasks).filter(([id]) => !taskIdSet.has(id))
          ) as Record<string, Task>

          // Remove column from record
          const newColumns = Object.fromEntries(
            Object.entries(state.columns).filter(([id]) => id !== columnId)
          ) as typeof state.columns

          return {
            columns: newColumns,
            tasks: newTasks,
            columnOrder: state.columnOrder.filter((id) => id !== columnId),
          }
        }),

      moveColumn: (fromIndex, toIndex) =>
        set((state) => ({
          columnOrder: arrayMove(state.columnOrder, fromIndex, toIndex),
        })),

      reorderColumns: (newOrder) =>
        set(() => ({ columnOrder: newOrder })),

      // ── Task Actions ────────────────────────────────────────────────────

      addTask: (columnId, title, description) => {
        const id = generateId()
        const task: Task = { id, title, description, createdAt: Date.now() }
        set((state) => ({
          tasks: { ...state.tasks, [id]: task },
          columns: {
            ...state.columns,
            [columnId]: {
              ...state.columns[columnId],
              taskIds: [...state.columns[columnId].taskIds, id],
            },
          },
        }))
      },

      updateTask: (taskId, changes) =>
        set((state) => ({
          tasks: {
            ...state.tasks,
            [taskId]: { ...state.tasks[taskId], ...changes },
          },
        })),

      deleteTask: (taskId, columnId) =>
        set((state) => {
          const newTasks = Object.fromEntries(
            Object.entries(state.tasks).filter(([id]) => id !== taskId)
          ) as Record<string, Task>

          return {
            tasks: newTasks,
            columns: {
              ...state.columns,
              [columnId]: {
                ...state.columns[columnId],
                taskIds: state.columns[columnId].taskIds.filter((id) => id !== taskId),
              },
            },
          }
        }),

      moveTask: (taskId, fromColumnId, toColumnId, toIndex) =>
        set((state) => {
          // Same-column reorder
          if (fromColumnId === toColumnId) {
            const taskIds = state.columns[fromColumnId].taskIds
            const fromIndex = taskIds.indexOf(taskId)
            if (fromIndex === -1) return state
            return {
              columns: {
                ...state.columns,
                [fromColumnId]: {
                  ...state.columns[fromColumnId],
                  taskIds: arrayMove(taskIds, fromIndex, toIndex),
                },
              },
            }
          }

          // Cross-column move
          const fromTaskIds = state.columns[fromColumnId].taskIds.filter(
            (id) => id !== taskId
          )
          const toTaskIds = [...state.columns[toColumnId].taskIds]
          toTaskIds.splice(toIndex, 0, taskId)

          return {
            columns: {
              ...state.columns,
              [fromColumnId]: { ...state.columns[fromColumnId], taskIds: fromTaskIds },
              [toColumnId]:   { ...state.columns[toColumnId],   taskIds: toTaskIds   },
            },
          }
        }),

      reorderTasksInColumn: (columnId, newTaskIds) =>
        set((state) => ({
          columns: {
            ...state.columns,
            [columnId]: { ...state.columns[columnId], taskIds: newTaskIds },
          },
        })),
    }),
    {
      name: 'kanban-board-v1',
    }
  )
)
