import { memo } from 'react'
import { motion } from 'framer-motion'

function BackgroundInner() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">

      {/* Joker */}
      <motion.img
        src="/background/joker.png"
        draggable={false}
        className="absolute right-0 top-1/2 h-[110vh] -translate-y-1/2 select-none opacity-95"
        animate={{
          y: [-8, 8, -8],
          scale: [1, 1.015, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Left Fade */}
      <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-black via-black/85 to-transparent" />

      {/* Top Fade */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black via-black/60 to-transparent" />

      {/* Bottom Fade */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Giant Red Slash */}
      <motion.div
        className="absolute -left-56 top-24 h-28 w-[720px] rotate-[-14deg] bg-red-700/80"
        style={{
          clipPath:
            'polygon(0 20%,100% 0%,94% 100%,0% 80%)',
        }}
        animate={{
          x: [-15, 15, -15],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Lower Black Slash */}
      <div
        className="absolute bottom-16 -left-36 h-36 w-[650px] rotate-[8deg] bg-black"
        style={{
          clipPath:
            'polygon(0 0,100% 12%,90% 100%,0 88%)',
        }}
      />

      {/* Halftone */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />

      {/* Red Glow */}
      <motion.div
        className="absolute left-[-250px] top-[-150px] h-[700px] w-[700px] rounded-full bg-red-600 blur-[180px]"
        animate={{
          opacity: [0.18, 0.28, 0.18],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      {/* Noise */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
        }}
      />

    </div>
  )
}

export const Background = memo(BackgroundInner)

function LogoInner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const title = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, rotate: -3 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ duration: 0.55 }}
      className={`relative inline-flex flex-col ${
        size === "sm" ? "items-start" : "items-center"
      }`}
    >
      <div className="relative">
        {/* White Sticker */}
        <div className="absolute -left-2 -top-2 h-10 w-10 rotate-[-12deg] bg-white" />
  
        <h1
          className={`${title[size]} relative font-black uppercase leading-none tracking-[0.12em] text-white drop-shadow-[5px_5px_0_black]`}
        >
          PHANTOM
        </h1>
      </div>
  
      <div className="mt-1 ml-2 inline-block -rotate-3 border-[3px] border-white bg-red-600 px-2 py-[2px] shadow-[4px_4px_0_black]">
        <span className="text-[10px] font-black tracking-[0.25em] text-white">
          AI
        </span>
      </div>
    </motion.div>
  )
}

export const Logo = memo(LogoInner)