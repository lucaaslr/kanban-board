import { create } from 'zustand'
import { api } from '../api/client'
import { syncSettings } from '../api/sync'
import type { Profile } from '../types'

interface ProfileState {
  profiles: Record<string, Profile>
  profileOrder: string[]
  activeProfileId: string
  hydrated: boolean
}

interface ProfileActions {
  // Called once on startup by useInitData
  setAll: (data: Pick<ProfileState, 'profiles' | 'profileOrder' | 'activeProfileId'>) => void
  setActiveProfileId: (id: string) => void

  addProfile: (name: string, emoji: string, id: string) => void
  updateProfile: (id: string, changes: Partial<Pick<Profile, 'name' | 'emoji'>>) => void
  deleteProfile: (id: string) => void
}

export const useProfileStore = create<ProfileState & ProfileActions>()((set, get) => ({
  profiles: {},
  profileOrder: [],
  activeProfileId: '',
  hydrated: false,

  setAll: (data) => set({ ...data, hydrated: true }),

  setActiveProfileId: (id) => {
    set({ activeProfileId: id })
    syncSettings({ activeProfileId: id })
  },

  addProfile: (name, emoji, id) => {
    const profile: Profile = { id, name, emoji, createdAt: Date.now() }
    set((s) => ({
      profiles: { ...s.profiles, [id]: profile },
      profileOrder: [...s.profileOrder, id],
    }))
    api.post('/profiles', profile).catch(console.error)
    syncSettings({ profileOrder: [...get().profileOrder] })
  },

  updateProfile: (id, changes) => {
    set((s) => ({
      profiles: { ...s.profiles, [id]: { ...s.profiles[id], ...changes } },
    }))
    const p = get().profiles[id]
    api.put(`/profiles/${id}`, { name: p.name, emoji: p.emoji }).catch(console.error)
  },

  deleteProfile: (id) => {
    const { profileOrder } = get()
    if (profileOrder.length <= 1) return
    set((s) => ({
      profiles: Object.fromEntries(
        Object.entries(s.profiles).filter(([pid]) => pid !== id)
      ) as Record<string, Profile>,
      profileOrder: s.profileOrder.filter((pid) => pid !== id),
    }))
    api.del(`/profiles/${id}`).catch(console.error)
    syncSettings({ profileOrder: get().profileOrder })
  },
}))
