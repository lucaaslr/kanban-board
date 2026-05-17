import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UIState {
  darkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (value) => set({ darkMode: value }),
      selectedTaskId: null,
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
    }),
    {
      name: 'kanban-ui-prefs-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ darkMode: state.darkMode }),
    }
  )
)
