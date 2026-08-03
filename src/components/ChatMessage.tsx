import { memo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiCopy, FiCheck, FiRefreshCw, FiTrash2, FiEdit2, FiX, FiSend } from 'react-icons/fi'
import type { Message } from '../types'
import { formatTimestamp } from '../utils/helpers'
import { MarkdownRenderer } from './MarkdownRenderer'
import { TypingIndicator } from './TypingIndicator'
import { useToast } from '../context/ToastContext'
import { audioService } from '../services/audioService'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
  onEdit: (id: string, content: string) => void
  onDelete: (id: string) => void
  onRetry: (id: string) => void
}

function ChatMessageInner({
  message,
  isStreaming,
  onEdit,
  onDelete,
  onRetry,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const { showToast } = useToast()
  const isUser = message.role === 'user'

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    showToast('Message copied', 'success')
    setTimeout(() => setCopied(false), 2000)
  }, [message.content, showToast])

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(message.id, editContent)
      setEditing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`group flex gap-3 px-4 py-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isUser
            ? 'bg-neutral-700 text-neutral-200'
            : 'border border-red-800/40 bg-black/60 text-red-400'
        }`}
      >
        {isUser ? 'You' : 'P'}
      </div>

      <div className={`max-w-[75%] min-w-0 ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block rounded-2xl px-4 py-2.5 text-left ${
            isUser
              ? 'bg-neutral-800/80 text-neutral-100'
              : message.isError
                ? 'border border-red-900/50 bg-red-950/30 text-red-300'
                : 'border border-neutral-800/50 bg-neutral-900/60 text-neutral-200 backdrop-blur-sm'
          } ${isStreaming ? 'animate-pulse' : ''}`}
        >
          {editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] w-full resize-none rounded-lg border border-neutral-700 bg-neutral-900 p-2 text-sm text-white outline-none focus:border-red-800"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded p-1 text-neutral-400 hover:text-white"
                >
                  <FiX size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="rounded p-1 text-red-400 hover:text-red-300"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          ) : message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : isStreaming ? (
            <TypingIndicator />
          ) : null}
        </div>

        <div
          className={`mt-1 flex items-center gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
          <span className="text-[10px] text-neutral-600">
            {formatTimestamp(message.timestamp)}
          </span>
          <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
            <ActionButton icon={copied ? FiCheck : FiCopy} onClick={handleCopy} title="Copy" />
            {isUser && (
              <ActionButton
                icon={FiEdit2}
                onClick={() => {
                  setEditContent(message.content)
                  setEditing(true)
                  audioService.playSfx('click')
                }}
                title="Edit"
              />
            )}
            {!isUser && (
              <ActionButton
                icon={FiRefreshCw}
                onClick={() => onRetry(message.id)}
                title="Retry"
              />
            )}
            <ActionButton
              icon={FiTrash2}
              onClick={() => onDelete(message.id)}
              title="Delete"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ActionButton({
  icon: Icon,
  onClick,
  title,
}: {
  icon: typeof FiCopy
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      onClick={() => {
        audioService.playSfx('click')
        onClick()
      }}
      title={title}
      className="rounded p-1 text-neutral-500 transition-colors hover:text-neutral-300"
    >
      <Icon size={12} />
    </button>
  )
}

export const ChatMessage = memo(ChatMessageInner)
