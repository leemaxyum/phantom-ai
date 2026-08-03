import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiKey } from 'react-icons/fi'
import { setStoredApiKey } from '../services/gemini'

export function AwakeningScreen() {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAwaken = () => {
    const trimmed = apiKey.trim()
    if (!trimmed) {
      setError('A mask cannot be empty. Enter your Groq API key.')
      return
    }

    setError('')
    setSaving(true)
    setStoredApiKey(trimmed)
    // App.tsx listens for the apikey-changed event and will unmount this
    // screen once it sees the key, so no further local action is needed.
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6"
    >
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800/60 bg-neutral-950/95 p-6 text-center shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-center gap-2 text-red-500">
          <FiKey size={18} />
          <h1 className="text-lg font-semibold tracking-widest text-white">PHANTOM AI</h1>
        </div>

        <p className="mb-1 text-sm text-neutral-300">Welcome, Phantom.</p>
        <p className="mb-6 text-xs italic text-neutral-500">
          "Every phantom requires a mask."
        </p>

        <p className="mb-4 text-xs text-neutral-400">
          To awaken Phantom AI, enter your own Groq API key.
        </p>

        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAwaken()
          }}
          placeholder="Groq API key"
          autoFocus
          disabled={saving}
          className="mb-2 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-red-800 disabled:opacity-60"
        />

        {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

        <button
          type="button"
          onClick={handleAwaken}
          disabled={saving}
          className="mt-2 w-full rounded-lg border border-red-900/40 bg-red-800/20 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-800/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Awakening…' : 'AWAKEN'}
        </button>
      </div>
    </motion.div>
  )
}