import React from 'react'
import { Moon, Sun, LayoutDashboard } from 'lucide-react'
import { Board } from './features/board/Board'
import { useTheme } from './hooks/useTheme'
import { cn } from './utils/cn'

export function App() {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <div className="flex flex-col h-full bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className={cn(
          'flex-shrink-0 flex items-center justify-between',
          'px-6 py-3',
          'bg-surface-0/80 dark:bg-surface-900/80 backdrop-blur-md',
          'border-b border-surface-200/70 dark:border-surface-800/70',
          'z-10'
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
              'bg-accent-500'
            )}
            aria-hidden
          >
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-none">
              Kanban
            </h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mt-0.5 font-mono">
              personal board
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
              'text-gray-500 dark:text-gray-400',
              'hover:text-gray-700 dark:hover:text-gray-200',
              'hover:bg-surface-100 dark:hover:bg-surface-800',
              'border border-surface-200 dark:border-surface-700/60',
              'transition-all duration-150'
            )}
          >
            {darkMode ? (
              <>
                <Sun size={13} />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon size={13} />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Board ───────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden">
        <Board />
      </main>
    </div>
  )
}
