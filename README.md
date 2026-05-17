# Kanban Board

A minimal, self-hosted Kanban board built for personal use. Supports multiple profiles, per-task notes, dark mode, and full drag-and-drop. Data lives on your own server — host it on a Raspberry Pi and access it from any device on your network.

---

## Features

- **Multiple profiles** — separate boards for Work, Gaming, Personal, etc.
- **Drag & drop** — reorder columns and cards, move cards between columns
- **Inline editing** — click any title or description to edit in place
- **Task notes panel** — click any task to open a side panel with a free-form notes field (auto-saved)
- **Dark mode** — follows your system preference, toggle in the header
- **Self-hosted backend** — data stored server-side in a JSON file, synced across all devices
- **Optional token auth** — protect your board with a shared secret

---

## Quick Start (development)

```bash
# 1. Install dependencies
npm install

# 2. Start client + server together
npm run dev
```

- React app → `http://localhost:5173`
- API server → `http://localhost:3001`

The Vite dev server proxies all `/api/*` requests to the Express server automatically.

### Other commands

```bash
npm run build        # Type-check + production build → dist/
npm run start        # Run production server (serves built app + API on :3001)
npm run dev:client   # Vite only
npm run dev:server   # Express server only (with hot reload)
```

---

## Raspberry Pi Setup

### Recommended OS

**Raspberry Pi OS Lite (64-bit)** — Bookworm.

- No desktop environment (saves ~300 MB RAM)
- 64-bit = full Docker image support
- Official Pi hardware support out of the box
- ~150 MB idle RAM, leaving ~850 MB free for containers

Flash it with [Raspberry Pi Imager](https://www.raspberrypi.com/software/). Before writing, click the ⚙️ settings icon to pre-configure:
- Enable SSH
- Set username and password
- Configure your Wi-Fi

This gives you a fully headless setup — no monitor or keyboard needed.

### 1. First boot

```bash
# Find the Pi's IP on your network, then SSH in
ssh <your-user>@<pi-ip>

# Update the system
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker          # apply group change without re-logging in
```

### 3. Install Tailscale (remote access)

Tailscale creates a private encrypted network between all your devices. No port forwarding, no public IP exposure, free for personal use.

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Then install Tailscale on every device (phone, laptop, etc.) and sign in with the same account. Your Pi will get a stable private IP like `100.x.x.x`.

### 4. Deploy the board

```bash
# Clone the repo
git clone https://github.com/lucaaslr/kanban-board.git
cd kanban-board

# Set your access token and start
API_TOKEN=your-secret-token docker compose up -d --build
```

The first build takes a few minutes on the Pi. After that, updates are fast.

Your board is now available at `http://<pi-tailscale-ip>:3000` from any device on your Tailscale network.

### 5. Auth token

On first visit from each device, the app shows a token prompt. Enter the same `API_TOKEN` you set above — it's stored in the browser and never asked again.

To disable auth entirely (safe if you're only on Tailscale), leave `API_TOKEN` empty:

```bash
docker compose up -d --build   # no API_TOKEN= prefix
```

### Useful commands

```bash
# View logs
docker compose logs -f

# Update to latest version
git pull && docker compose up -d --build

# Stop
docker compose down

# Data location (persisted across restarts and updates)
docker volume inspect kanban-board_kanban-data
```

---

## Project Structure

```
├── server/                      # Express backend
│   ├── index.ts                 # Server entry — auth, routes, static serving
│   ├── db.ts                    # JSON file read/write (atomic)
│   └── routes/
│       ├── profiles.ts          # CRUD for profiles
│       ├── boards.ts            # Board state per profile
│       └── settings.ts         # Active profile + profile order
│
├── src/
│   ├── App.tsx                  # Root layout — auth gate, init, header, board
│   ├── main.tsx                 # React entry point
│   │
│   ├── api/
│   │   ├── client.ts            # Fetch wrapper with token auth
│   │   └── sync.ts              # Debounced board sync + settings sync
│   │
│   ├── types/
│   │   └── index.ts             # Profile, Task, Column, BoardState types
│   │
│   ├── store/
│   │   ├── boardStore.ts        # Board state — columns, tasks, profile switching
│   │   ├── profileStore.ts      # Profiles list + active profile
│   │   └── uiStore.ts           # UI state — dark mode, selected task
│   │
│   ├── hooks/
│   │   ├── useInitData.ts       # Bootstraps stores from API on startup
│   │   └── useTheme.ts          # Syncs dark mode class to <html>
│   │
│   ├── components/
│   │   ├── AuthGate.tsx         # Token entry screen
│   │   ├── EditableText.tsx     # Click-to-edit inline text field
│   │   ├── IconButton.tsx       # Icon button with variants
│   │   └── EmptyState.tsx       # Empty placeholder with dashed border
│   │
│   ├── features/
│   │   ├── board/
│   │   │   ├── Board.tsx            # DndContext + drag handlers
│   │   │   ├── BoardColumn.tsx      # Sortable column
│   │   │   ├── TaskCard.tsx         # Sortable task card (click → notes panel)
│   │   │   ├── TaskPanel.tsx        # Right-side notes panel (auto-save)
│   │   │   ├── AddColumn.tsx        # Inline form to add a column
│   │   │   ├── AddTask.tsx          # Inline form to add a task
│   │   │   ├── DragOverlayCard.tsx  # Floating clone during task drag
│   │   │   └── DragOverlayColumn.tsx
│   │   │
│   │   └── profiles/
│   │       ├── ProfileSwitcher.tsx  # Header dropdown — switch, create, edit, delete
│   │       └── ProfileDialog.tsx    # Modal — emoji picker + name input
│   │
│   └── styles/
│       └── index.css            # Tailwind directives + global utilities
│
├── Dockerfile                   # Multi-stage build (React → Node runtime)
├── docker-compose.yml           # Single-container deployment with volume
└── data/                        # db.json lives here (gitignored)
```

---

## Architecture

### Data Model

```typescript
type Profile = {
  id: string
  name: string
  emoji: string
  createdAt: number
}

type Task = {
  id: string
  title: string
  description?: string
  notes?: string          // free-form notes from the side panel
  createdAt: number
}

type Column = {
  id: string
  title: string
  taskIds: string[]       // ordered references into tasks map
}

type BoardState = {
  columns: Record<string, Column>
  tasks: Record<string, Task>
  columnOrder: string[]
}
```

### State Management

Three Zustand stores:

| Store | Responsibility |
|---|---|
| `boardStore` | Active board state (columns, tasks). Syncs to server with 600ms debounce after each mutation. |
| `profileStore` | Profile list and active profile ID. API calls on each mutation. |
| `uiStore` | Dark mode (localStorage) and selected task ID (in-memory). |

On startup, `useInitData` fetches all data from the server and hydrates both stores. If the server is empty (first run), it migrates existing `localStorage` data or seeds a default board.

### Sync Strategy

Board mutations are **optimistic** — local state updates instantly, then a debounced save fires to the server 600ms after the last change. Switching profiles flushes any pending sync first to prevent data loss.

### Drag & Drop

Built with **dnd-kit**:

| Event | Responsibility |
|---|---|
| `onDragStart` | Record which item is being dragged (column or task) |
| `onDragOver` | Handle cross-column task moves in real time |
| `onDragEnd` | Finalise column reorder and same-column task sort |

### Backend

Express server with a single JSON file database (`data/db.json`). Writes are atomic (write to `.tmp`, rename). Sufficient for single-user personal use with no concurrency concerns.

| Route | Description |
|---|---|
| `GET /api/profiles` | All profiles + order + active ID |
| `POST /api/profiles` | Create profile (also creates empty board) |
| `PUT /api/profiles/:id` | Rename / change emoji |
| `DELETE /api/profiles/:id` | Delete profile + its board |
| `GET /api/boards/:profileId` | Board state for a profile |
| `PUT /api/boards/:profileId` | Save board state |
| `PATCH /api/settings` | Update active profile or profile order |
| `GET /api/auth-config` | Whether auth token is required |

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI |
| TypeScript 5 | Types throughout |
| Vite 5 | Dev server + production build |
| Zustand 5 | State management |
| @dnd-kit | Drag and drop |
| Tailwind CSS 3 | Styling |
| Express 5 | API server |
| lucide-react | Icons |
