import { api } from './client'
import type { BoardState } from '../types'

// ── Board sync ──────────────────────────────────────────────────────────────

let boardSyncTimer: ReturnType<typeof setTimeout> | null = null
let pendingProfileId: string | null = null

export function scheduleBoardSync(profileId: string, getState: () => BoardState, delay = 600) {
  pendingProfileId = profileId
  if (boardSyncTimer) clearTimeout(boardSyncTimer)
  boardSyncTimer = setTimeout(() => {
    const { columns, tasks, columnOrder } = getState()
    api.put(`/boards/${pendingProfileId}`, { columns, tasks, columnOrder }).catch(console.error)
    boardSyncTimer = null
  }, delay)
}

export function flushBoardSync(profileId: string, state: BoardState): Promise<unknown> {
  if (boardSyncTimer) {
    clearTimeout(boardSyncTimer)
    boardSyncTimer = null
  }
  const { columns, tasks, columnOrder } = state
  return api.put(`/boards/${profileId}`, { columns, tasks, columnOrder })
}

// ── Settings sync ───────────────────────────────────────────────────────────

export function syncSettings(patch: { activeProfileId?: string; profileOrder?: string[] }) {
  api.patch('/settings', patch).catch(console.error)
}
