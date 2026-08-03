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
    <div className="relative border-t-[3px] border-white bg-black/60 p-4 backdrop-blur-md">
      <motion.div
        className="ph-panel mx-auto flex max-w-3xl items-end gap-2 border-2 border-white/50 p-2 transition-shadow focus-within:border-red-600 focus-within:shadow-[0_0_28px_rgba(213,16,23,0.35)]"
        style={{ clipPath: 'polygon(0 0, 97% 0, 100% 25%, 100% 100%, 3% 100%, 0 75%)' }}
        whileHover={{ borderColor: 'rgba(213, 16, 23, 0.5)' }}
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
          className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-white bg-red-700 text-white shadow-[3px_3px_0px_black] transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:opacity-60 disabled:shadow-none"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}
          whileHover={{ scale: 1.08, rotate: -3, boxShadow: '5px 5px 0px black' }}
          whileTap={{ scale: 0.92, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          onMouseEnter={() => audioService.playSfx('hover')}
        >
          {isGenerating ? <FiSquare size={14} /> : <FiSend size={16} />}
        </motion.button>
      </motion.div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] uppercase tracking-wide text-neutral-600">
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