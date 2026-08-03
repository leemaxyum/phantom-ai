import { memo } from 'react'
import { motion } from 'framer-motion'

function TypingIndicatorInner() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-red-500/70"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export const TypingIndicator = memo(TypingIndicatorInner)

function ThinkingOverlayInner() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="rounded-full border border-red-900/30 bg-black/40 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-3 w-3 rounded-full bg-red-600"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm text-neutral-300">Phantom is thinking...</span>
        </div>
      </div>
    </motion.div>
  )
}

export const ThinkingOverlay = memo(ThinkingOverlayInner)
