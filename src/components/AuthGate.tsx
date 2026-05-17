import React, { useState } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { setToken } from '../api/client'
import { cn } from '../utils/cn'

interface AuthGateProps {
  onAuth: () => void
}

export function AuthGate({ onAuth }: AuthGateProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const token = value.trim()
    if (!token) return
    setToken(token)
    setError(false)
    onAuth()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
      <div className={cn(
        'w-full max-w-xs rounded-2xl p-8',
        'bg-surface-0 dark:bg-surface-900',
        'border border-surface-200/80 dark:border-surface-800/60',
        'shadow-overlay'
      )}>
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100">Kanban Board</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Enter your access token to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false) }}
            placeholder="Access token"
            autoFocus
            className={cn(
              'w-full px-3 py-2.5 rounded-lg text-sm',
              'bg-surface-50 dark:bg-surface-800',
              'border border-surface-200 dark:border-surface-700',
              'text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600',
              'focus:outline-none focus:ring-2 focus:ring-accent-500/60 focus:border-accent-500/60',
              error && 'border-red-400 dark:border-red-500 focus:ring-red-400/60',
              'transition-all duration-100'
            )}
          />
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400">Invalid token — try again.</p>
          )}
          <button
            type="submit"
            disabled={!value.trim()}
            className={cn(
              'w-full py-2.5 rounded-lg text-sm font-medium',
              'bg-accent-500 text-white hover:bg-accent-600',
              'disabled:opacity-40 disabled:pointer-events-none',
              'transition-colors duration-100'
            )}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
