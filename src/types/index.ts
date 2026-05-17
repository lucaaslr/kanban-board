export type Profile = {
  id: string
  name: string
  emoji: string
  createdAt: number
}

export type Task = {
  id: string
  title: string
  description?: string
  notes?: string
  createdAt: number
}

export type Column = {
  id: string
  title: string
  taskIds: string[]
}

export type BoardState = {
  columns: Record<string, Column>
  tasks: Record<string, Task>
  columnOrder: string[]
}

export type DragType = 'column' | 'task'
export type DragItemType = DragType

export type ActiveDragItem = {
  id: string
  type: DragItemType
}
