import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { audioService } from '../services/audioService'
import { loadState, saveState, resetSettings } from '../utils/storage'

interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
  resetAllSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => loadState().settings)

  useEffect(() => {
    audioService.initialize()
  }, [])

  useEffect(() => {
    audioService.setMusicEnabled(settings.musicEnabled)
    audioService.setMusicVolume(settings.musicVolume)
    audioService.setSfxEnabled(settings.sfxEnabled)
    audioService.setSfxVolume(settings.sfxVolume)
  }, [settings])

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      const state = loadState()
      saveState({ ...state, settings: next })
      return next
    })
  }, [])

  const resetAllSettings = useCallback(() => {
    const defaults = resetSettings()
    setSettings(defaults)
    const state = loadState()
    saveState({ ...state, settings: defaults })
  }, [])

  const value = useMemo(
    () => ({ settings, updateSettings, resetAllSettings }),
    [settings, updateSettings, resetAllSettings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export { DEFAULT_SETTINGS }
