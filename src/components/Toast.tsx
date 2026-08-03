import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi'
import { useToast } from '../context/ToastContext'
import type { ToastType } from '../types'

const icons: Record<ToastType, typeof FiInfo> = {
  success: FiCheck,
  error: FiAlertCircle,
  info: FiInfo,
  warning: FiAlertCircle,
}

const colors: Record<ToastType, string> = {
  success: 'border-green-800/50 bg-green-950/80 text-green-300',
  error: 'border-red-800/50 bg-red-950/80 text-red-300',
  info: 'border-neutral-700/50 bg-neutral-900/80 text-neutral-300',
  warning: 'border-yellow-800/50 bg-yellow-950/80 text-yellow-300',
}

function ToastContainerInner() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur-md ${colors[toast.type]}`}
            >
              <Icon size={16} />
              <span className="text-sm">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="ml-2 opacity-60 transition-opacity hover:opacity-100"
              >
                <FiX size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export const ToastContainer = memo(ToastContainerInner)
