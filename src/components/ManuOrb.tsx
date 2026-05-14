import { motion } from 'framer-motion'
import type { Mood } from '../types'

interface Props {
  mood?: Mood | null
  size?: number
  pulse?: boolean
}

const MOOD_COLORS: Record<string, string> = {
  happy:   'radial-gradient(circle at 35% 30%, #14b8a6 0%, #0891b2 100%)',
  good:    'radial-gradient(circle at 35% 30%, #14b8a6 0%, #0891b2 100%)',
  sad:     'radial-gradient(circle at 35% 30%, #1d4ed8 0%, #1e3a8a 100%)',
  anxious: 'radial-gradient(circle at 35% 30%, #d97706 0%, #92400e 100%)',
  neutral: 'radial-gradient(circle at 35% 30%, #7c3aed 0%, #4c1d95 100%)',
  default: 'radial-gradient(circle at 35% 30%, #7c3aed 0%, #4c1d95 100%)',
}

export default function ManuOrb({ mood, size = 100, pulse = true }: Props) {
  const core = MOOD_COLORS[mood ?? 'default'] ?? MOOD_COLORS.default

  return (
    <motion.div
      whileTap={{ scale: 0.93 }}
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      transition={pulse ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Outer violet ring — slow CW */}
      <div
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: '2.5px solid transparent',
          borderTopColor: '#7c3aed',
          borderRightColor: 'rgba(124,58,237,0.3)',
          borderBottomColor: 'transparent',
          borderLeftColor: 'rgba(124,58,237,0.5)',
          animation: 'spin-cw 2.5s linear infinite',
        }}
      />

      {/* Inner gold ring — faster CCW */}
      <div
        style={{
          position: 'absolute',
          inset: 4,
          borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: 'transparent',
          borderRightColor: '#f59e0b',
          borderBottomColor: 'rgba(245,158,11,0.4)',
          borderLeftColor: 'transparent',
          animation: 'spin-ccw 4s linear infinite',
        }}
      />

      {/* Core sphere */}
      <div
        style={{
          position: 'absolute',
          inset: 8,
          borderRadius: '50%',
          background: core,
          boxShadow: `0 0 ${size * 0.3}px rgba(124,58,237,0.6), inset 0 0 ${size * 0.15}px rgba(255,255,255,0.1)`,
          transition: 'background 0.8s ease',
        }}
      />

      {/* Glassy shine */}
      <div
        style={{
          position: 'absolute',
          width: size * 0.22,
          height: size * 0.13,
          borderRadius: '50%',
          background: 'white',
          opacity: 0.35,
          filter: 'blur(3px)',
          top: '28%',
          left: '30%',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  )
}
