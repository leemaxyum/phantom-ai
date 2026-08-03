import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus,
  FiSearch,
  FiSettings,
  FiTrash2,
  FiEdit2,
  FiChevronLeft,
  FiX,
} from 'react-icons/fi'
import { useChat } from '../context/ChatContext'
import { useSettings } from '../context/SettingsContext'
import { audioService } from '../services/audioService'
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
  const [logoHovered, setLogoHovered] = useState(false)

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
            className="fixed inset-y-0 left-0 z-30 flex w-[280px] flex-col border-r-[3px] border-white bg-black/90 shadow-[8px_0px_0px_rgba(0,0,0,0.5)] backdrop-blur-xl md:relative"
          >
            {/* HEADER — PERSONA AI LOGO */}
            <div className="relative z-10 overflow-visible border-b-[3px] border-white bg-gradient-to-br from-neutral-950 via-black to-neutral-950 px-4 pb-5 pt-4">
              <motion.div
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rotate-12"
                style={{ background: '#d51017', clipPath: 'polygon(0 0, 100% 20%, 80% 100%, 0% 80%)' }}
                animate={{
                  opacity: logoHovered ? 0.4 : 0.2,
                  scale: logoHovered ? 1.08 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
              <div
                className="pointer-events-none absolute -left-10 bottom-0 h-16 w-32 opacity-10"
                style={{
                  background: 'white',
                  clipPath: 'polygon(0 100%, 30% 0, 100% 0, 70% 100%)',
                }}
              />

              <div className="relative flex items-start justify-center overflow-visible">
                <motion.div
                  className="relative z-20 flex flex-col items-center overflow-visible"
                  style={{ cursor: 'pointer' }}
                  onHoverStart={() => setLogoHovered(true)}
                  onHoverEnd={() => setLogoHovered(false)}
                  initial={{ scale: 1, rotate: 0, x: 0, y: 0 }}
                  whileHover={{ scale: 1.32, rotate: -4, x: 10, y: -4 }}
                  whileTap={{ scale: 0.95, rotate: -1, x: 0, y: 0 }}
                  transition={{ type: 'spring', stiffness: 800, damping: 13, mass: 0.7 }}
                >
                  <motion.img
                    src="/logo/persona-ai.png"
                    alt="Phantom AI"
                    draggable={false}
                    className="h-auto w-[230px] select-none object-contain"
                    style={{ userSelect: 'none' }}
                    animate={{
                      filter: logoHovered
                        ? 'drop-shadow(4px 4px 0px black) drop-shadow(0px 0px 38px rgba(213,16,23,0.95)) brightness(1.15)'
                        : 'drop-shadow(4px 4px 0px black) drop-shadow(0px 0px 0px rgba(213,16,23,0)) brightness(1)',
                    }}
                    transition={{ type: 'spring', stiffness: 800, damping: 13, mass: 0.7 }}
                  />
                </motion.div>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="absolute right-0 top-0 z-20 rounded-none border-2 border-transparent p-1.5 text-neutral-400 transition-colors hover:border-white hover:text-white md:hidden"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* NEW CONVERSATION */}
            <div className="p-3">
              <motion.button
                type="button"
                onClick={createConversation}
                className="ph-button persona-cut flex w-full items-center justify-center gap-2 px-4 py-3 text-xs"
                whileHover={{ scale: 1.02, rotate: -0.5 }}
                whileTap={{ scale: 0.97 }}
                onMouseEnter={() => audioService.playSfx('hover')}
              >
                <FiPlus size={16} strokeWidth={3} />
                New Conversation
              </motion.button>
            </div>

            {/* SEARCH */}
            <div className="px-3 pb-3">
              <div className="ph-panel flex items-center gap-2 border-2 border-white/70 px-3 py-2">
                <FiSearch size={14} className="shrink-0 text-red-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full flex-1 bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
                />
              </div>
            </div>

            {/* CONVERSATION LIST */}
            <div className="ph-scroll flex-1 overflow-y-auto px-2.5 py-1">
              {filteredConversations.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs uppercase tracking-widest text-neutral-700">
                  No conversations yet
                </p>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = activeConversation?.id === conv.id
                  return (
                    <motion.div
                      key={conv.id}
                      layout
                      initial={false}
                      animate={{ rotate: isActive ? -0.6 : 0 }}
                      whileHover={{ x: isActive ? 0 : 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className={`group relative mb-1.5 flex items-center gap-1 border-2 px-2 py-1 transition-colors ${
                        isActive
                          ? 'border-white bg-gradient-to-r from-red-900/50 to-red-950/20 text-white shadow-[4px_4px_0px_black]'
                          : 'border-transparent text-neutral-400 hover:border-white/40 hover:bg-neutral-900/50 hover:text-neutral-200'
                      }`}
                      style={isActive ? { clipPath: 'polygon(0 0, 96% 0, 100% 30%, 100% 100%, 4% 100%, 0 70%)' } : undefined}
                    >
                      {isActive && (
                        <span className="absolute -left-2.5 top-1/2 h-4 w-1.5 -translate-y-1/2 bg-red-600" />
                      )}
                      {renamingId === conv.id ? (
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={saveRename}
                          onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                          className="flex-1 border-2 border-red-700 bg-neutral-900 px-2 py-1 text-sm text-white outline-none"
                          autoFocus
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => selectConversation(conv.id)}
                          className="flex flex-1 items-center gap-2 overflow-hidden py-2 text-left"
                        >
                          <img
                             src="/icons/chatbubble.png"
                             alt="Chat"
                             draggable={false}
                             className="h-5 w-5 shrink-0 select-none object-contain"
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm ${isActive ? 'font-semibold' : ''}`}>
                              {conv.title}
                            </p>
                            <p className="text-[10px] uppercase tracking-wide text-neutral-600">
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
                  )
                })
              )}
            </div>

            {/* SETTINGS */}
            <div className="border-t-[3px] border-white p-3">
              <motion.button
                type="button"
                onClick={() => {
                  onOpenSettings()
                  audioService.playSfx('modal')
                }}
                whileHover={{ x: 4 }}
                className="ph-panel flex w-full items-center gap-2 border-2 border-white/50 px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-neutral-300 transition-colors hover:border-red-600 hover:text-white"
                onMouseEnter={() => audioService.playSfx('hover')}
              >
                <FiSettings size={16} className="text-red-500" />
                Settings
              </motion.button>
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
          className="fixed left-3 top-3 z-30 border-2 border-white bg-black/80 p-2 text-neutral-300 shadow-[4px_4px_0px_black] backdrop-blur-md transition-colors hover:text-white"
          whileHover={{ scale: 1.08, rotate: -2 }}
          whileTap={{ scale: 0.94 }}
        >
          <FiChevronLeft size={18} className="rotate-180" />
        </motion.button>
      )}
    </>
  )
}

export const Sidebar = memo(SidebarInner)