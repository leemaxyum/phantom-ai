import { memo } from 'react'
import { motion } from 'framer-motion'
import { FiMessageSquare, FiZap, FiShield, FiCode } from 'react-icons/fi'
import { Logo } from './Background'

const features = [
  { icon: FiMessageSquare, text: 'Intelligent conversations powered by Gemini' },
  { icon: FiZap, text: 'Streaming responses with markdown support' },
  { icon: FiShield, text: 'Your data stays local — private by design' },
  { icon: FiCode, text: 'Syntax-highlighted code blocks' },
]

function WelcomeScreenInner({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Logo size="lg" />
      <motion.div
        className="mt-10 grid max-w-lg gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {features.map(({ icon: Icon, text }, i) => (
          <motion.div
            key={text}
            className="flex items-center gap-3 rounded-lg border border-neutral-800/60 bg-neutral-900/40 px-4 py-3 text-left backdrop-blur-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Icon className="shrink-0 text-red-500" size={18} />
            <span className="text-sm text-neutral-300">{text}</span>
          </motion.div>
        ))}
      </motion.div>
      <motion.button
        type="button"
        onClick={onStart}
        className="mt-10 rounded-lg bg-gradient-to-r from-red-900 to-red-800 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-red-900/30 transition-all hover:scale-105 hover:shadow-red-800/40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Begin a conversation
      </motion.button>
      <p className="mt-6 text-xs text-neutral-600">
        Ctrl+N new chat · Ctrl+B sidebar · Ctrl+, settings
      </p>
    </motion.div>
  )
}

export const WelcomeScreen = memo(WelcomeScreenInner)
