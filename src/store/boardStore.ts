import { create } from 'zustand'
import { arrayMove } from '@dnd-kit/sortable'
import { generateId } from '../utils/id'
import { scheduleBoardSync, flushBoardSync, syncSettings } from '../api/sync'
import { api } from '../api/client'
import { useProfileStore } from './profileStore'
import type { BoardState, Task, Column } from '../types'

// ─── Helpers ───────────────────────────────────────────────────────────────

function activeProfileId() {
  return useProfileStore.getState().activeProfileId
}

// ─── Action Definitions ────────────────────────────────────────────────────

interface BoardActions {
  // Hydration
  setBoard: (state: BoardState) => void

  // Column actions
  addColumn: (title: string) => void
  renameColumn: (columnId: string, title: string) => void
  updateColumnTitle: (columnId: string, title: string) => void
  deleteColumn: (columnId: string) => void
  moveColumn: (fromIndex: number, toIndex: number) => void
  reorderColumns: (newOrder: string[]) => void

  // Task actions
  addTask: (columnId: string, title: string, description?: string) => void
  updateTask: (taskId: string, changes: Partial<Pick<Task, 'title' | 'description' | 'notes'>>) => void
  deleteTask: (taskId: string, columnId: string) => void
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string, toIndex: number) => void
  reorderTasksInColumn: (columnId: string, newTaskIds: string[]) => void

  // Profile switching
  switchToProfile: (newProfileId: string) => Promise<void>
}

type Store = BoardState & BoardActions

// ─── Sync helper ───────────────────────────────────────────────────────────

function scheduleSync(getState: () => BoardState) {
  scheduleBoardSync(activeProfileId(), getState)
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useBoardStore = create<Store>()((set, get) => ({
  columns: {},
  tasks: {},
  columnOrder: [],

  setBoard: (state) => set({ columns: state.columns, tasks: state.tasks, columnOrder: state.columnOrder }),

  // ── Column Actions ────────────────────────────────────────────────────

  addColumn: (title) => {
    const id = generateId()
    set((s) => ({
      columns: { ...s.columns, [id]: { id, title, taskIds: [] } },
      columnOrder: [...s.columnOrder, id],
    }))
    scheduleSync(get)
  },

  renameColumn: (columnId, title) => {
    set((s) => ({ columns: { ...s.columns, [columnId]: { ...s.columns[columnId], title } } }))
    scheduleSync(get)
  },

  updateColumnTitle: (columnId, title) => {
    set((s) => ({ columns: { ...s.columns, [columnId]: { ...s.columns[columnId], title } } }))
    scheduleSync(get)
  },

  deleteColumn: (columnId) => {
    set((s) => {
      const col = s.columns[columnId]
      if (!col) return s
      const taskIdSet = new Set(col.taskIds)
      return {
        tasks: Object.fromEntries(
          Object.entries(s.tasks).filter(([id]) => !taskIdSet.has(id))
        ) as Record<string, Task>,
        columns: Object.fromEntries(
          Object.entries(s.columns).filter(([id]) => id !== columnId)
        ) as Record<string, Column>,
        columnOrder: s.columnOrder.filter((id) => id !== columnId),
      }
    })
    scheduleSync(get)
  },

  moveColumn: (fromIndex, toIndex) => {
    set((s) => ({ columnOrder: arrayMove(s.columnOrder, fromIndex, toIndex) }))
    scheduleSync(get)
  },

  reorderColumns: (newOrder) => {
    set(() => ({ columnOrder: newOrder }))
    scheduleSync(get)
  },

  // ── Task Actions ──────────────────────────────────────────────────────

  addTask: (columnId, title, description) => {
    const id = generateId()
    const task: Task = { id, title, description, createdAt: Date.now() }
    set((s) => ({
      tasks: { ...s.tasks, [id]: task },
      columns: {
        ...s.columns,
        [columnId]: { ...s.columns[columnId], taskIds: [...s.columns[columnId].taskIds, id] },
      },
    }))
    scheduleSync(get)
  },

  updateTask: (taskId, changes) => {
    set((s) => ({ tasks: { ...s.tasks, [taskId]: { ...s.tasks[taskId], ...changes } } }))
    scheduleSync(get)
  },

  deleteTask: (taskId, columnId) => {
    set((s) => ({
      tasks: Object.fromEntries(
        Object.entries(s.tasks).filter(([id]) => id !== taskId)
      ) as Record<string, Task>,
      columns: {
        ...s.columns,
        [columnId]: {
          ...s.columns[columnId],
          taskIds: s.columns[columnId].taskIds.filter((id) => id !== taskId),
        },
      },
    }))
    scheduleSync(get)
  },

  moveTask: (taskId, fromColumnId, toColumnId, toIndex) => {
    set((s) => {
      if (fromColumnId === toColumnId) {
        const taskIds = s.columns[fromColumnId].taskIds
        const fromIndex = taskIds.indexOf(taskId)
        if (fromIndex === -1) return s
        return {
          columns: {
            ...s.columns,
            [fromColumnId]: { ...s.columns[fromColumnId], taskIds: arrayMove(taskIds, fromIndex, toIndex) },
          },
        }
      }
      const fromTaskIds = s.columns[fromColumnId].taskIds.filter((id) => id !== taskId)
      const toTaskIds = [...s.columns[toColumnId].taskIds]
      toTaskIds.splice(toIndex, 0, taskId)
      return {
        columns: {
          ...s.columns,
          [fromColumnId]: { ...s.columns[fromColumnId], taskIds: fromTaskIds },
          [toColumnId]:   { ...s.columns[toColumnId],   taskIds: toTaskIds   },
        },
      }
    })
    scheduleSync(get)
  },

  reorderTasksInColumn: (columnId, newTaskIds) => {
    set((s) => ({
      columns: { ...s.columns, [columnId]: { ...s.columns[columnId], taskIds: newTaskIds } },
    }))
    scheduleSync(get)
  },

  // ── Profile switching ─────────────────────────────────────────────────

  switchToProfile: async (newProfileId) => {
    const oldProfileId = activeProfileId()
    if (oldProfileId === newProfileId) return

    // Flush any pending sync for the current board first
    await flushBoardSync(oldProfileId, get())

    // Update active profile
    useProfileStore.getState().setActiveProfileId(newProfileId)
    syncSettings({ activeProfileId: newProfileId })

    // Load the new board
    const newBoard = await api.get<BoardState>(`/boards/${newProfileId}`)
    set({ columns: newBoard.columns, tasks: newBoard.tasks, columnOrder: newBoard.columnOrder })
  },
}))
