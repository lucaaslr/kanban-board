import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useProfileStore } from '../../store/profileStore'
import { useBoardStore } from '../../store/boardStore'
import { ProfileDialog } from './ProfileDialog'

type DialogState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; profileId: string }

export function ProfileSwitcher() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dialog, setDialog] = useState<DialogState>({ open: false })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const profiles = useProfileStore((s) => s.profiles)
  const profileOrder = useProfileStore((s) => s.profileOrder)
  const activeProfileId = useProfileStore((s) => s.activeProfileId)
  const addProfile = useProfileStore((s) => s.addProfile)
  const updateProfile = useProfileStore((s) => s.updateProfile)
  const deleteProfile = useProfileStore((s) => s.deleteProfile)
  const setActiveProfileId = useProfileStore((s) => s.setActiveProfileId)

  const switchToProfile = useBoardStore((s) => s.switchToProfile)
  const deleteProfileBoard = useBoardStore((s) => s.deleteProfileBoard)

  const activeProfile = profiles[activeProfileId]

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setConfirmDeleteId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  // Close dropdown on Escape
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false)
        setConfirmDeleteId(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dropdownOpen])

  const handleSwitch = (profileId: string) => {
    if (profileId === activeProfileId) return
    switchToProfile(profileId, activeProfileId)
    setActiveProfileId(profileId)
    setDropdownOpen(false)
    setConfirmDeleteId(null)
  }

  const handleCreate = (name: string, emoji: string) => {
    const newId = addProfile(name, emoji)
    switchToProfile(newId, activeProfileId)
    setActiveProfileId(newId)
    setDialog({ open: false })
    setDropdownOpen(false)
  }

  const handleEdit = (name: string, emoji: string) => {
    if (dialog.open && dialog.mode === 'edit') {
      updateProfile(dialog.profileId, { name, emoji })
    }
    setDialog({ open: false })
  }

  const handleDelete = (profileId: string) => {
    if (profileOrder.length <= 1) return

    // If deleting the active profile, switch to the nearest other one first
    if (profileId === activeProfileId) {
      const nextId = profileOrder.find((id) => id !== profileId)!
      switchToProfile(nextId, profileId)
      setActiveProfileId(nextId)
    }

    deleteProfileBoard(profileId)
    deleteProfile(profileId)
    setConfirmDeleteId(null)
  }

  if (!activeProfile) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setDropdownOpen((v) => !v)
          setConfirmDeleteId(null)
        }}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2 py-1 -mx-2 -my-1',
          'text-left transition-colors duration-100',
          'hover:bg-surface-100 dark:hover:bg-surface-800',
          dropdownOpen && 'bg-surface-100 dark:bg-surface-800'
        )}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
      >
        <div>
          <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-none flex items-center gap-1">
            Kanban
          </h1>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mt-0.5 font-mono flex items-center gap-0.5">
            <span>{activeProfile.emoji}</span>
            <span>{activeProfile.name}</span>
            <ChevronDown
              size={9}
              className={cn(
                'ml-0.5 transition-transform duration-150',
                dropdownOpen && 'rotate-180'
              )}
            />
          </p>
        </div>
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div
          className={cn(
            'absolute left-0 top-full mt-2 z-40',
            'w-52 rounded-xl shadow-overlay py-1',
            'bg-surface-0 dark:bg-surface-800',
            'border border-surface-200/80 dark:border-surface-700/60',
            'animate-fade-in'
          )}
        >
          {profileOrder.map((pid) => {
            const profile = profiles[pid]
            if (!profile) return null
            const isActive = pid === activeProfileId
            const isConfirming = confirmDeleteId === pid

            return (
              <div key={pid} className="px-1">
                {isConfirming ? (
                  // Inline delete confirmation
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg">
                    <span className="flex-1 text-xs text-gray-500 dark:text-gray-400">
                      Delete "{profile.name}"?
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-[10px] px-1.5 py-0.5 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(pid)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      Yes
                    </button>
                  </div>
                ) : (
                  <div className="group flex items-center rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleSwitch(pid)}
                      className={cn(
                        'flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-left',
                        'transition-colors duration-100',
                        isActive
                          ? 'text-accent-600 dark:text-accent-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-surface-700/60'
                      )}
                    >
                      <span className="text-base leading-none">{profile.emoji}</span>
                      <span className="flex-1 text-xs font-medium truncate">{profile.name}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 flex-shrink-0" />
                      )}
                    </button>

                    {/* Edit / Delete icons */}
                    <div className="flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDialog({ open: true, mode: 'edit', profileId: pid })
                          setDropdownOpen(false)
                        }}
                        className={cn(
                          'p-1 rounded-md transition-colors duration-100',
                          'text-gray-400 hover:text-gray-700 hover:bg-surface-100',
                          'dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-surface-700'
                        )}
                        aria-label={`Edit ${profile.name}`}
                      >
                        <Pencil size={11} />
                      </button>
                      {profileOrder.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmDeleteId(pid)
                          }}
                          className={cn(
                            'p-1 rounded-md transition-colors duration-100',
                            'text-gray-400 hover:text-red-500 hover:bg-red-50',
                            'dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-500/12'
                          )}
                          aria-label={`Delete ${profile.name}`}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Divider + New profile */}
          <div className="mx-2 my-1 border-t border-surface-200/70 dark:border-surface-700/50" />
          <div className="px-1">
            <button
              type="button"
              onClick={() => {
                setDialog({ open: true, mode: 'create' })
                setDropdownOpen(false)
              }}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg',
                'text-xs font-medium text-gray-500 dark:text-gray-400',
                'hover:text-gray-700 dark:hover:text-gray-200',
                'hover:bg-surface-100 dark:hover:bg-surface-700/60',
                'transition-colors duration-100'
              )}
            >
              <Plus size={13} />
              New profile
            </button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {dialog.open && dialog.mode === 'create' && (
        <ProfileDialog
          mode="create"
          onSave={handleCreate}
          onClose={() => setDialog({ open: false })}
        />
      )}
      {dialog.open && dialog.mode === 'edit' && (
        <ProfileDialog
          mode="edit"
          initialName={profiles[dialog.profileId]?.name}
          initialEmoji={profiles[dialog.profileId]?.emoji}
          onSave={handleEdit}
          onClose={() => setDialog({ open: false })}
        />
      )}
    </div>
  )
}
