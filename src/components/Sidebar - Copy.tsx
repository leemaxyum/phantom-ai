import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus,
  FiSearch,
  FiSettings,
  FiTrash2,
  FiEdit2,
  FiChevronLeft,
  FiMessageSquare,
  FiX,
} from 'react-icons/fi'
import { useChat } from '../context/ChatContext'
import { useSettings } from '../context/SettingsContext'
import { audioService } from '../services/audioService'
import { Logo } from './Background'
import { formatTimestamp } from '../utils/helpers'

interface SidebarProps {
  onOpenSettings: () => void
}

function SidebarInner({ onOpenSettings }: SidebarProps) {
  const {
    filteredConversations,
    activeConversation,
    searchQuery,
    setSearchQuery,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
  } = useChat()
  const { settings, updateSettings } = useSettings()
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const toggleSidebar = useCallback(() => {
    updateSettings({ sidebarOpen: !settings.sidebarOpen })
    audioService.playSfx('toggle')
  }, [settings.sidebarOpen, updateSettings])

  const startRename = (id: string, title: string) => {
    setRenamingId(id)
    setRenameValue(title)
    audioService.playSfx('click')
  }

  const saveRename = () => {
    if (renamingId && renameValue.trim()) {
      renameConversation(renamingId, renameValue)
    }
    setRenamingId(null)
  }

  return (
    <>
      <AnimatePresence>
        {settings.sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-30 flex w-[280px] flex-col border-r border-neutral-800/50 bg-black/80 backdrop-blur-xl md:relative"
          >
            <div className="flex items-center justify-between border-b border-neutral-800/50 p-4">
              <Logo size="sm" />
              <button
                type="button"
                onClick={toggleSidebar}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white md:hidden"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-3">
              <motion.button
                type="button"
                onClick={createConversation}
                className="flex w-full items-center gap-2 rounded-lg border border-neutral-800/60 bg-neutral-900/40 px-3 py-2.5 text-sm text-neutral-300 transition-all hover:border-red-900/40 hover:bg-neutral-800/60 hover:text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => audioService.playSfx('hover')}
              >
                <FiPlus size={16} />
                New conversation
              </motion.button>
            </div>

            <div className="px-3 pb-2">
              <div className="flex items-center gap-2 rounded-lg border border-neutral-800/40 bg-neutral-900/30 px-3 py-2">
                <FiSearch size={14} className="text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="flex-1 bg-transparent text-sm text-neutral-300 outline-none placeholder:text-neutral-600"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-1">
              {filteredConversations.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-neutral-600">
                  No conversations yet
                </p>
              ) : (
                filteredConversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    layout
                    className={`group mb-0.5 flex items-center gap-1 rounded-lg px-2 py-1 ${
                      activeConversation?.id === conv.id
                        ? 'bg-red-950/30 text-white'
                        : 'text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-200'
                    }`}
                  >
                    {renamingId === conv.id ? (
                      <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={saveRename}
                        onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                        className="flex-1 rounded bg-neutral-800 px-2 py-1 text-sm text-white outline-none"
                        autoFocus
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => selectConversation(conv.id)}
                        className="flex flex-1 items-center gap-2 overflow-hidden py-2 text-left"
                      >
                        <FiMessageSquare size={14} className="shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{conv.title}</p>
                          <p className="text-[10px] text-neutral-600">
                            {formatTimestamp(conv.updatedAt)}
                          </p>
                        </div>
                      </button>
                    )}
                    <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => startRename(conv.id, conv.title)}
                        className="rounded p-1 hover:text-white"
                      >
                        <FiEdit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteConversation(conv.id)}
                        className="rounded p-1 hover:text-red-400"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="border-t border-neutral-800/50 p-3">
              <button
                type="button"
                onClick={() => {
                  onOpenSettings()
                  audioService.playSfx('modal')
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-800/40 hover:text-white"
              >
                <FiSettings size={16} />
                Settings
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!settings.sidebarOpen && (
        <motion.button
          type="button"
          onClick={toggleSidebar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed left-3 top-3 z-30 rounded-lg border border-neutral-800/50 bg-black/60 p-2 text-neutral-400 backdrop-blur-md transition-colors hover:text-white"
          whileHover={{ scale: 1.05 }}
        >
          <FiChevronLeft size={18} className="rotate-180" />
        </motion.button>
      )}
    </>
  )
}

export const Sidebar = memo(SidebarInner)
