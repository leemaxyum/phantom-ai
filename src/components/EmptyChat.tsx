import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle } from 'react-icons/fi'

function EmptyChatInner() {
  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <FiMessageCircle size={48} className="text-red-900/40" />
      </motion.div>
      <h2 className="mt-4 text-lg font-medium text-neutral-300">
        The stage is set
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        Every great heist begins with a single question. Ask Phantom anything — the shadows are listening.
      </p>
    </motion.div>
  )
}

export const EmptyChat = memo(EmptyChatInner)

interface ChatAreaProps {
  children: React.ReactNode
}

function ChatAreaInner({ children }: ChatAreaProps) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </div>
  )
}

export const ChatArea = memo(ChatAreaInner)
