import { memo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function CursorGlowInner() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }
    const handleLeave = () => setVisible(false)

    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  if (!visible) return null

  return (
    <motion.div
      className="pointer-events-none fixed z-[9999] h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        left: pos.x,
        top: pos.y,
        background: 'radial-gradient(circle, rgba(139,0,0,0.06) 0%, transparent 70%)',
      }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  )
}

export const CursorGlow = memo(CursorGlowInner)
