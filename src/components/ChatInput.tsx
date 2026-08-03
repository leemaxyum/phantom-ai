import { memo, useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiSquare } from 'react-icons/fi'
import { audioService } from '../services/audioService'

interface ChatInputProps {
  onSend: (message: string) => void
  isGenerating: boolean
  disabled?: boolean
}

function ChatInputInner({ onSend, isGenerating, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || isGenerating || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative border-t border-neutral-800/50 bg-black/40 p-4 backdrop-blur-md">
      <motion.div
        className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-neutral-800/60 bg-neutral-900/60 p-2 transition-shadow focus-within:border-red-900/50 focus-within:shadow-[0_0_20px_rgba(139,0,0,0.15)]"
        whileHover={{ borderColor: 'rgba(139, 0, 0, 0.3)' }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Phantom..."
          rows={1}
          disabled={disabled}
          className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
        />
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim() || isGenerating || disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-900/80 text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => audioService.playSfx('hover')}
        >
          {isGenerating ? <FiSquare size={14} /> : <FiSend size={16} />}
        </motion.button>
      </motion.div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-neutral-600">
        Phantom AI may make mistakes. Verify important information.
      </p>
    </div>
  )
}

export const ChatInput = memo(ChatInputInner)

export function useChatInputFocus() {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])
  return { inputRef, focusInput }
}
