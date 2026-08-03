import { memo, useState, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useChat } from '../context/ChatContext'
import { useSettings } from '../context/SettingsContext'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { Sidebar } from '../components/Sidebar'
import { ChatMessage } from '../components/ChatMessage'
import { ChatInput } from '../components/ChatInput'
import { EmptyChat } from '../components/EmptyChat'
import { WelcomeScreen } from '../components/WelcomeScreen'
import { SettingsModal } from '../components/SettingsModal'
import { ThinkingOverlay } from '../components/TypingIndicator'

function ChatPageInner() {
  const {
    activeConversation,
    isGenerating,
    sendMessage,
    editMessage,
    deleteMessage,
    retryMessage,
    createConversation,
  } = useChat()
  const { settings, updateSettings } = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(
    () => !activeConversation || activeConversation.messages.length === 0,
  )
  const inputContainerRef = useRef<HTMLDivElement>(null)

  const messages = activeConversation?.messages ?? []
  const { bottomRef } = useAutoScroll([messages, isGenerating], true)

  const focusInput = useCallback(() => {
    inputContainerRef.current?.querySelector('textarea')?.focus()
  }, [])

  useKeyboardShortcuts({
    onNewChat: createConversation,
    onToggleSidebar: () => updateSettings({ sidebarOpen: !settings.sidebarOpen }),
    onOpenSettings: () => setSettingsOpen(true),
    onFocusInput: focusInput,
  })

  const handleStart = () => {
    setShowWelcome(false)
    focusInput()
  }

  const hasMessages = messages.length > 0

  return (
    <div className="relative flex h-full w-full">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

      <main className="flex flex-1 flex-col overflow-hidden">
        {showWelcome && !hasMessages ? (
          <WelcomeScreen onStart={handleStart} />
        ) : (
          <>
            <div className="relative flex-1 overflow-y-auto">
              {!hasMessages ? (
                <EmptyChat />
              ) : (
                <motion.div
                  key={activeConversation?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mx-auto max-w-3xl py-4"
                >
                  <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        isStreaming={
                          isGenerating &&
                          i === messages.length - 1 &&
                          msg.role === 'assistant'
                        }
                        onEdit={editMessage}
                        onDelete={deleteMessage}
                        onRetry={retryMessage}
                      />
                    ))}
                  </AnimatePresence>
                  <div ref={bottomRef} />
                </motion.div>
              )}
              <AnimatePresence>
                {isGenerating && messages.length > 0 && !messages[messages.length - 1]?.content && (
                  <ThinkingOverlay />
                )}
              </AnimatePresence>
            </div>

            <div ref={inputContainerRef}>
              <ChatInput onSend={sendMessage} isGenerating={isGenerating} />
            </div>
          </>
        )}
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export const ChatPage = memo(ChatPageInner)
