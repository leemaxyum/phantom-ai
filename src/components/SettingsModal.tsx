import { memo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX,
  FiMusic,
  FiVolume2,
  FiMic,
  FiDownload,
  FiUpload,
  FiRotateCcw,
  FiTrash2,
  FiKey,
  FiEyeOff,
} from 'react-icons/fi'
import { useSettings } from '../context/SettingsContext'
import { useChat } from '../context/ChatContext'
import { useAvailableVoices } from '../hooks/useSpeech'
import { audioService } from '../services/audioService'
import { setStoredApiKey, clearStoredApiKey } from '../services/gemini'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs text-neutral-400">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-700 accent-red-700"
      />
      <span className="w-8 text-right text-xs text-neutral-500">{value.toFixed(1)}</span>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1">
      <span className="text-sm text-neutral-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => {
          onChange(!checked)
          audioService.playSfx('toggle')
        }}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-red-800' : 'bg-neutral-700'
        }`}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </label>
  )
}

function SettingsModalInner({ open, onClose }: SettingsModalProps) {
  const { settings, updateSettings, resetAllSettings } = useSettings()
  const { exportAllChats, importAllChats, clearAllConversations } = useChat()
  const voices = useAvailableVoices()

  const [replacingMask, setReplacingMask] = useState(false)
  const [newMaskValue, setNewMaskValue] = useState('')
  const [maskError, setMaskError] = useState('')
  const [savingMask, setSavingMask] = useState(false)

  useEffect(() => {
    if (open) audioService.playSfx('modal')
  }, [open])

  useEffect(() => {
    if (!open) {
      setReplacingMask(false)
      setNewMaskValue('')
      setMaskError('')
      setSavingMask(false)
    }
  }, [open])

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) importAllChats(file)
    }
    input.click()
  }

  const handleSaveNewMask = () => {
    const trimmed = newMaskValue.trim()
    if (!trimmed) {
      setMaskError('A mask cannot be empty.')
      return
    }
    setMaskError('')
    setSavingMask(true)
    setStoredApiKey(trimmed)
    // phantom:apikey-changed event handles the rest; nothing else to do here.
  }

  const handleForgetMask = () => {
    audioService.playSfx('click')
    clearStoredApiKey()
    // phantom:apikey-changed event system takes it from here — App.tsx will
    // swap back to AwakeningScreen automatically, unmounting this modal.
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-lg overflow-y-auto rounded-2xl border border-neutral-800/60 bg-neutral-950/95 p-6 shadow-2xl backdrop-blur-xl md:inset-x-auto"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <FiX size={18} />
              </button>
            </div>

            <section className="mb-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-red-400">
                <FiMusic size={14} /> Music
              </div>
              <ToggleRow
                label="Enable music"
                checked={settings.musicEnabled}
                onChange={(v) => updateSettings({ musicEnabled: v })}
              />
              <SliderRow
                label="Volume"
                value={settings.musicVolume}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => updateSettings({ musicVolume: v })}
              />
            </section>

            <section className="mb-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-red-400">
                <FiVolume2 size={14} /> Sound Effects
              </div>
              <ToggleRow
                label="Enable SFX"
                checked={settings.sfxEnabled}
                onChange={(v) => updateSettings({ sfxEnabled: v })}
              />
              <SliderRow
                label="Volume"
                value={settings.sfxVolume}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => updateSettings({ sfxVolume: v })}
              />
            </section>

            <section className="mb-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-red-400">
                <FiMic size={14} /> Voice
              </div>
              <ToggleRow
                label="Read replies aloud"
                checked={settings.voiceEnabled}
                onChange={(v) => updateSettings({ voiceEnabled: v })}
              />
              <div className="mt-2">
                <label className="text-xs text-neutral-400">Voice</label>
                <select
                  value={settings.voiceName}
                  onChange={(e) => updateSettings({ voiceName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 outline-none focus:border-red-800"
                >
                  <option value="">System default</option>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 space-y-2">
                <SliderRow
                  label="Rate"
                  value={settings.voiceRate}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onChange={(v) => updateSettings({ voiceRate: v })}
                />
                <SliderRow
                  label="Pitch"
                  value={settings.voicePitch}
                  min={0}
                  max={2}
                  step={0.1}
                  onChange={(v) => updateSettings({ voicePitch: v })}
                />
                <SliderRow
                  label="Volume"
                  value={settings.voiceVolume}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(v) => updateSettings({ voiceVolume: v })}
                />
              </div>
            </section>

            <section className="mb-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-red-400">
                <FiKey size={14} /> Mask Management
              </div>

              <div className="flex flex-wrap gap-2">
                <ActionButton
                  icon={FiKey}
                  label="Replace Mask"
                  onClick={() => {
                    setReplacingMask((v) => !v)
                    setMaskError('')
                  }}
                />
                <ActionButton icon={FiEyeOff} label="Forget Mask" onClick={handleForgetMask} danger />
              </div>

              <AnimatePresence>
                {replacingMask && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <input
                      type="password"
                      value={newMaskValue}
                      onChange={(e) => {
                        setNewMaskValue(e.target.value)
                        if (maskError) setMaskError('')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveNewMask()
                      }}
                      placeholder="New Groq API key"
                      autoFocus
                      disabled={savingMask}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-800 disabled:opacity-60"
                    />
                    {maskError && <p className="mt-1 text-xs text-red-400">{maskError}</p>}
                    <button
                      type="button"
                      onClick={handleSaveNewMask}
                      disabled={savingMask}
                      className="mt-2 w-full rounded-lg border border-red-900/40 bg-red-800/20 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-800/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingMask ? 'Saving…' : 'Save New Mask'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section className="mb-6">
              <div className="mb-3 text-sm font-medium text-red-400">Data</div>
              <div className="flex flex-wrap gap-2">
                <ActionButton icon={FiDownload} label="Export chats" onClick={exportAllChats} />
                <ActionButton icon={FiUpload} label="Import chats" onClick={handleImport} />
                <ActionButton
                  icon={FiTrash2}
                  label="Clear conversations"
                  onClick={clearAllConversations}
                  danger
                />
                <ActionButton
                  icon={FiRotateCcw}
                  label="Reset settings"
                  onClick={() => {
                    resetAllSettings()
                    audioService.playSfx('notification')
                  }}
                />
              </div>
            </section>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof FiDownload
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => {
        audioService.playSfx('click')
        onClick()
      }}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
        danger
          ? 'border-red-900/40 text-red-400 hover:bg-red-950/30'
          : 'border-neutral-800 text-neutral-400 hover:bg-neutral-800/40 hover:text-white'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}

export const SettingsModal = memo(SettingsModalInner)