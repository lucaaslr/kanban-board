import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UIState {
  darkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (value) => set({ darkMode: value }),
    }),
    {
      name: 'kanban-ui-prefs-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ darkMode: state.darkMode }),
    }
  )
)
