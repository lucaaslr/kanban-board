import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'

export function useTheme() {
  const { darkMode, toggleDarkMode } = useUIStore()

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  return { darkMode, toggleDarkMode }
}
