import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '../utils/id'
import type { Profile } from '../types'

interface ProfileState {
  profiles: Record<string, Profile>
  profileOrder: string[]
  activeProfileId: string
}

interface ProfileActions {
  addProfile: (name: string, emoji: string) => string
  updateProfile: (id: string, changes: Partial<Pick<Profile, 'name' | 'emoji'>>) => void
  deleteProfile: (id: string) => void
  setActiveProfileId: (id: string) => void
}

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set, get) => {
      const defaultId = generateId()
      return {
        profiles: {
          [defaultId]: { id: defaultId, name: 'Personal', emoji: '👤', createdAt: Date.now() },
        },
        profileOrder: [defaultId],
        activeProfileId: defaultId,

        addProfile: (name, emoji) => {
          const id = generateId()
          set((state) => ({
            profiles: {
              ...state.profiles,
              [id]: { id, name, emoji, createdAt: Date.now() },
            },
            profileOrder: [...state.profileOrder, id],
          }))
          return id
        },

        updateProfile: (id, changes) =>
          set((state) => ({
            profiles: {
              ...state.profiles,
              [id]: { ...state.profiles[id], ...changes },
            },
          })),

        deleteProfile: (id) => {
          if (get().profileOrder.length <= 1) return
          set((state) => ({
            profiles: Object.fromEntries(
              Object.entries(state.profiles).filter(([pid]) => pid !== id)
            ) as Record<string, Profile>,
            profileOrder: state.profileOrder.filter((pid) => pid !== id),
          }))
        },

        setActiveProfileId: (id) => set({ activeProfileId: id }),
      }
    },
    { name: 'kanban-profiles-v1' }
  )
)
