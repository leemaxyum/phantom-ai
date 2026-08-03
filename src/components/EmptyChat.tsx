import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function EmptyChatInner() {
  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.img
        src="/icons/bubble.png"
        alt=""
        draggable={false}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="h-16 w-16 select-none object-contain"
        style={{ userSelect: 'none' }}
      />
      <h2 className="mt-4 text-2xl font-semibold text-neutral-200">
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