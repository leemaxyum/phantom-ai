import { useEffect } from 'react'

interface ShortcutHandlers {
  onNewChat?: () => void
  onToggleSidebar?: () => void
  onOpenSettings?: () => void
  onFocusInput?: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey

      if (mod && e.key === 'n') {
        e.preventDefault()
        handlers.onNewChat?.()
      }
      if (mod && e.key === 'b') {
        e.preventDefault()
        handlers.onToggleSidebar?.()
      }
      if (mod && e.key === ',') {
        e.preventDefault()
        handlers.onOpenSettings?.()
      }
      if (mod && e.key === 'k') {
        e.preventDefault()
        handlers.onFocusInput?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
