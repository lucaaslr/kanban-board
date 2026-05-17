# Kanban — Personal Board

A minimal, local-first Kanban board built for single-user personal use. No accounts, no cloud, no complexity — just a fast, polished drag-and-drop board that lives entirely in your browser.

---

## ✨ Features

- **Drag & drop** — reorder columns and cards, move cards between columns
- **Inline editing** — click any title or description to edit in place
- **Dark mode** — follows your system preference, persists your choice
- **localStorage persistence** — board state is saved automatically on every change
- **Seeded first run** — a sample board is pre-populated on first launch

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (opens at http://localhost:5173)
npm run dev
```

### Other commands

```bash
npm run build       # Type-check + Vite production build → dist/
npm run preview     # Serve the production build locally
npm run typecheck   # TypeScript validation only
```

---

## 📁 Project Structure

```
src/
├── App.tsx                     # Root layout (header + board)
├── main.tsx                    # React entry point
│
├── types/
│   └── index.ts                # Task, Column, BoardState, DnD types
│
├── store/
│   ├── boardStore.ts           # Zustand board store with persist middleware
│   └── uiStore.ts              # UI preferences (dark mode)
│
├── hooks/
│   └── useTheme.ts             # Syncs dark mode class to <html>
│
├── utils/
│   ├── id.ts                   # UUID generation via 'uuid'
│   ├── cn.ts                   # Lightweight classname merger
│   └── seed.ts                 # Initial board factory
│
├── components/                 # Shared primitives
│   ├── EditableText.tsx        # Click-to-edit inline text field
│   ├── IconButton.tsx          # Accessible icon button with variants
│   └── EmptyState.tsx          # Empty placeholder with dashed border
│
├── features/board/             # Board feature
│   ├── Board.tsx               # DndContext, drag handlers, board layout
│   ├── BoardColumn.tsx         # Sortable column with task SortableContext
│   ├── TaskCard.tsx            # Sortable task card
│   ├── AddColumn.tsx           # Inline form to add a column
│   ├── AddTask.tsx             # Inline form to add a task
│   ├── DragOverlayCard.tsx     # Visual clone shown during task drag
│   └── DragOverlayColumn.tsx   # Visual clone shown during column drag
│
└── styles/
    └── index.css               # Tailwind directives + global utilities
```

---

## 🏗 Architecture

### Data Model

```typescript
type Task = {
  id: string          // UUID v4
  title: string
  description?: string
  createdAt: number   // Unix ms timestamp
}

type Column = {
  id: string
  title: string
  taskIds: string[]   // Ordered references into tasks map
}

type BoardState = {
  columns: Record<string, Column>
  tasks: Record<string, Task>
  columnOrder: string[]           // Ordered column IDs
}
```

### State Management

The board uses two Zustand stores:

- **`boardStore`** — all board data. Persisted to `localStorage` key `kanban-board-v1`. Every action (add, rename, delete, reorder, move) produces a new immutable state snapshot, which Zustand's `persist` middleware immediately writes to localStorage.
- **`uiStore`** — UI preferences (dark mode). Persisted to `kanban-ui-prefs-v1`. Defaults to the OS-level colour scheme preference.

### Drag & Drop

Built with **dnd-kit**:

| Event | Responsibility |
|---|---|
| `onDragStart` | Record which item type is being dragged (column or task) |
| `onDragOver` | Handle **cross-column** task moves in real time |
| `onDragEnd` | Finalise **column reorder** and **same-column task sort** |

Columns use a `horizontalListSortingStrategy`; tasks within each column use a `verticalListSortingStrategy`. A `DragOverlay` renders a floating clone with a slight rotation to give depth.

### Persistence

Zustand's `persist` middleware with `createJSONStorage(() => localStorage)` handles all read/write automatically. Only the data shape (`columns`, `tasks`, `columnOrder`) is persisted — not the store actions.

---

## 🛠 Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI |
| TypeScript 5 | Types throughout |
| Vite 5 | Dev server + build |
| Zustand 4 | State management |
| @dnd-kit | Drag and drop |
| Tailwind CSS 3 | Styling |
| lucide-react | Icons |
| uuid | ID generation |

---

## 🗑 Resetting the Board

Open your browser's DevTools console and run:

```javascript
localStorage.removeItem('kanban-board-v1')
location.reload()
```

This resets the board to the initial seeded state.
