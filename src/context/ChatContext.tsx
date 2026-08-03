import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Conversation, Message } from '../types'
import { streamChatResponse } from '../services/gemini'
import { audioService } from '../services/audioService'
import {
  loadState,
  saveState,
  exportChats,
  importChats,
} from '../utils/storage'
import { generateId, generateTitle } from '../utils/helpers'
import { useToast } from './ToastContext'
import { useSettings } from './SettingsContext'
import { useSpeech } from '../hooks/useSpeech'

interface ChatContextValue {
  conversations: Conversation[]
  activeConversation: Conversation | null
  isGenerating: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  filteredConversations: Conversation[]
  createConversation: () => void
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  sendMessage: (content: string) => void
  editMessage: (messageId: string, content: string) => void
  deleteMessage: (messageId: string) => void
  retryMessage: (messageId: string) => void
  exportAllChats: () => void
  importAllChats: (file: File) => void
  clearAllConversations: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast()
  const { settings } = useSettings()
  const { speak } = useSpeech()
  const [conversations, setConversations] = useState<Conversation[]>(
    () => loadState().conversations,
  )
  const [activeId, setActiveId] = useState<string | null>(
    () => loadState().activeConversationId,
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const persist = useCallback(
    (convs: Conversation[], active: string | null) => {
      const state = loadState()
      saveState({ ...state, conversations: convs, activeConversationId: active })
    },
    [],
  )

  useEffect(() => {
    persist(conversations, activeId)
  }, [conversations, activeId, persist])

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  )

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q)),
    )
  }, [conversations, searchQuery])

  const updateConversation = useCallback(
    (id: string, updater: (conv: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? updater(c) : c)),
      )
    },
    [],
  )

  const createConversation = useCallback(() => {
    const conv: Conversation = {
      id: generateId(),
      title: 'New conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
    audioService.playSfx('click')
  }, [])

  const selectConversation = useCallback((id: string) => {
    setActiveId(id)
    audioService.playSfx('click')
  }, [])

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id)
        if (activeId === id) {
          setActiveId(next[0]?.id ?? null)
        }
        return next
      })
      audioService.playSfx('toggle')
      showToast('Conversation deleted', 'info')
    },
    [activeId, showToast],
  )

  const renameConversation = useCallback(
    (id: string, title: string) => {
      updateConversation(id, (c) => ({
        ...c,
        title: title.trim() || 'Untitled',
        updatedAt: Date.now(),
      }))
    },
    [updateConversation],
  )

  const generateResponse = useCallback(
    async (convId: string, history: Message[]) => {
      const assistantId = generateId()
      setIsGenerating(true)

      updateConversation(convId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() },
        ],
        updatedAt: Date.now(),
      }))

      abortRef.current = new AbortController()
      let fullContent = ''

      await streamChatResponse(
        history.map((m) => ({ role: m.role, content: m.content })),
        {
          onChunk: (text) => {
            fullContent += text
            updateConversation(convId, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantId ? { ...m, content: fullContent } : m,
              ),
            }))
          },
          onError: (error) => {
            updateConversation(convId, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantId
                  ? { ...m, content: error, isError: true }
                  : m,
              ),
            }))
            showToast(error, 'error')
            audioService.playSfx('notification')
          },
          onComplete: () => {
            if (settings.voiceEnabled && fullContent) {
              speak(fullContent)
            }
            audioService.playSfx('receive')
          },
        },
        abortRef.current.signal,
      )

      setIsGenerating(false)
      abortRef.current = null
    },
    [updateConversation, showToast, settings.voiceEnabled, speak],
  )

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isGenerating) return

      audioService.onUserInteraction()
      audioService.playSfx('send')

      let convId = activeId
      if (!convId) {
        const conv: Conversation = {
          id: generateId(),
          title: generateTitle(trimmed),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        setConversations((prev) => [conv, ...prev])
        setActiveId(conv.id)
        convId = conv.id
      }

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }

      updateConversation(convId, (c) => {
        const isFirst = c.messages.length === 0
        return {
          ...c,
          title: isFirst ? generateTitle(trimmed) : c.title,
          messages: [...c.messages, userMsg],
          updatedAt: Date.now(),
        }
      })

      const conv = conversations.find((c) => c.id === convId)
      const history = conv ? [...conv.messages, userMsg] : [userMsg]
      await generateResponse(convId, history)
    },
    [activeId, isGenerating, conversations, updateConversation, generateResponse],
  )

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!activeId || isGenerating) return
      const trimmed = content.trim()
      if (!trimmed) return

      const conv = conversations.find((c) => c.id === activeId)
      if (!conv) return

      const msgIndex = conv.messages.findIndex((m) => m.id === messageId)
      if (msgIndex === -1 || conv.messages[msgIndex].role !== 'user') return

      const newMessages = conv.messages.slice(0, msgIndex + 1).map((m) =>
        m.id === messageId ? { ...m, content: trimmed, timestamp: Date.now() } : m,
      )

      updateConversation(activeId, (c) => ({
        ...c,
        messages: newMessages,
        updatedAt: Date.now(),
      }))

      await generateResponse(activeId, newMessages)
    },
    [activeId, isGenerating, conversations, updateConversation, generateResponse],
  )

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!activeId) return
      updateConversation(activeId, (c) => ({
        ...c,
        messages: c.messages.filter((m) => m.id !== messageId),
        updatedAt: Date.now(),
      }))
      audioService.playSfx('toggle')
    },
    [activeId, updateConversation],
  )

  const retryMessage = useCallback(
    async (messageId: string) => {
      if (!activeId || isGenerating) return
      const conv = conversations.find((c) => c.id === activeId)
      if (!conv) return

      const msgIndex = conv.messages.findIndex((m) => m.id === messageId)
      if (msgIndex === -1) return

      const history = conv.messages.slice(0, msgIndex)
      updateConversation(activeId, (c) => ({
        ...c,
        messages: history,
        updatedAt: Date.now(),
      }))

      if (history.length === 0) return
      const lastUser = [...history].reverse().find((m) => m.role === 'user')
      if (!lastUser) return

      await generateResponse(activeId, history)
    },
    [activeId, isGenerating, conversations, updateConversation, generateResponse],
  )

  const exportAllChats = useCallback(() => {
    const state = loadState()
    const blob = new Blob([exportChats(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `phantom-ai-chats-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Chats exported successfully', 'success')
    audioService.playSfx('notification')
  }, [showToast])

  const importAllChats = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const state = loadState()
          const merged = importChats(reader.result as string, state)
          setConversations(merged.conversations)
          setActiveId(merged.activeConversationId)
          saveState(merged)
          showToast('Chats imported successfully', 'success')
        } catch {
          showToast('Failed to import chats. Invalid file.', 'error')
        }
      }
      reader.readAsText(file)
    },
    [showToast],
  )

  const clearAllConversations = useCallback(() => {
    setConversations([])
    setActiveId(null)
    showToast('All conversations cleared', 'info')
    audioService.playSfx('notification')
  }, [showToast])

  const value = useMemo(
    () => ({
      conversations,
      activeConversation,
      isGenerating,
      searchQuery,
      setSearchQuery,
      filteredConversations,
      createConversation,
      selectConversation,
      deleteConversation,
      renameConversation,
      sendMessage,
      editMessage,
      deleteMessage,
      retryMessage,
      exportAllChats,
      importAllChats,
      clearAllConversations,
    }),
    [
      conversations,
      activeConversation,
      isGenerating,
      searchQuery,
      filteredConversations,
      createConversation,
      selectConversation,
      deleteConversation,
      renameConversation,
      sendMessage,
      editMessage,
      deleteMessage,
      retryMessage,
      exportAllChats,
      importAllChats,
      clearAllConversations,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
