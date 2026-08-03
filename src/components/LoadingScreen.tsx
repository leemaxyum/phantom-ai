import { memo } from 'react'
import { motion } from 'framer-motion'
import { Logo } from './Background'

function LoadingScreenInner() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Logo size="lg" />
      <motion.div
        className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-neutral-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-red-900 via-red-600 to-red-900"
          style={{ backgroundSize: '200% 100%' }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
      <motion.p
        className="mt-4 text-sm text-neutral-500"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Awakening...
      </motion.p>
    </motion.div>
  )
}

export const LoadingScreen = memo(LoadingScreenInner)
