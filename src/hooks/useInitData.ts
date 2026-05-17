import { useCallback, useEffect, useState } from 'react'
import { api, clearToken } from '../api/client'
import { useProfileStore } from '../store/profileStore'
import { useBoardStore } from '../store/boardStore'
import { generateId } from '../utils/id'
import { createSeedState } from '../utils/seed'
import type { BoardState, Profile } from '../types'

type Status = 'loading' | 'ready' | 'unauthorized' | 'error'

interface ProfilesResponse {
  profiles: Record<string, Profile>
  profileOrder: string[]
  activeProfileId: string | null
}

function migrateFromLocalStorage(): { profiles: Record<string, Profile>; profileOrder: string[]; activeProfileId: string; boards: Record<string, BoardState> } | null {
  try {
    const profileRaw = localStorage.getItem('kanban-profiles-v1')
    const boardRaw = localStorage.getItem('kanban-boards-v1')
    if (!profileRaw || !boardRaw) return null

    const { state: ps } = JSON.parse(profileRaw)
    const { state: bs } = JSON.parse(boardRaw)
    if (!ps?.profiles || !ps?.profileOrder || !bs) return null

    const boards: Record<string, BoardState> = {}
    for (const pid of ps.profileOrder as string[]) {
      if (pid === ps.activeProfileId) {
        boards[pid] = { columns: bs.columns ?? {}, tasks: bs.tasks ?? {}, columnOrder: bs.columnOrder ?? [] }
      } else {
        boards[pid] = bs.savedBoards?.[pid] ?? { columns: {}, tasks: {}, columnOrder: [] }
      }
    }
    return { profiles: ps.profiles, profileOrder: ps.profileOrder, activeProfileId: ps.activeProfileId, boards }
  } catch {
    return null
  }
}

export function useInitData() {
  const [status, setStatus] = useState<Status>('loading')

  const run = useCallback(async () => {
    setStatus('loading')
    try {
      let data = await api.get<ProfilesResponse>('/profiles')

      // First-ever launch — seed the server
      if (data.profileOrder.length === 0) {
        const migrated = migrateFromLocalStorage()

        if (migrated) {
          // Restore existing profiles + boards from localStorage
          for (const pid of migrated.profileOrder) {
            const p = migrated.profiles[pid]
            await api.post('/profiles', p)
            await api.put(`/boards/${pid}`, migrated.boards[pid])
          }
          await api.patch('/settings', {
            activeProfileId: migrated.activeProfileId,
            profileOrder: migrated.profileOrder,
          })
        } else {
          // Brand-new install — create default profile with seed board
          const id = generateId()
          const profile: Profile = { id, name: 'Personal', emoji: '👤', createdAt: Date.now() }
          await api.post('/profiles', profile)
          await api.put(`/boards/${id}`, createSeedState())
          await api.patch('/settings', { activeProfileId: id, profileOrder: [id] })
        }

        data = await api.get<ProfilesResponse>('/profiles')
      }

      const activeId = data.activeProfileId ?? data.profileOrder[0]
      useProfileStore.getState().setAll({
        profiles: data.profiles,
        profileOrder: data.profileOrder,
        activeProfileId: activeId,
      })

      const board = await api.get<BoardState>(`/boards/${activeId}`)
      useBoardStore.getState().setBoard(board)

      setStatus('ready')
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'UNAUTHORIZED') {
        setStatus('unauthorized')
      } else {
        console.error('Init error:', err)
        setStatus('error')
      }
    }
  }, [])

  useEffect(() => { run() }, [run])

  const handleAuth = useCallback(() => run(), [run])
  const handleAuthFail = useCallback(() => { clearToken(); setStatus('unauthorized') }, [])

  return { status, retry: run, handleAuth, handleAuthFail }
}
