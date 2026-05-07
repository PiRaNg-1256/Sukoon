import { motion } from 'framer-motion'
import type { Mood } from '../types'

interface Props {
  mood?: Mood | null
  size?: number
  pulse?: boolean
}

interface FaceConfig {
  eyeScaleY: number
  browRotateLeft: number
  browRotateRight: number
  mouthPath: string
}

const FACES: Record<string, FaceConfig> = {
  happy: {
    eyeScaleY: 1.0,
    browRotateLeft: -8,
    browRotateRight: 8,
    mouthPath: 'M 30 52 Q 50 66 70 52',
  },
  good: {
    eyeScaleY: 1.0,
    browRotateLeft: -5,
    browRotateRight: 5,
    mouthPath: 'M 33 52 Q 50 63 67 52',
  },
  neutral: {
    eyeScaleY: 0.9,
    browRotateLeft: 0,
    browRotateRight: 0,
    mouthPath: 'M 34 54 Q 50 56 66 54',
  },
  anxious: {
    eyeScaleY: 1.2,
    browRotateLeft: 12,
    browRotateRight: -12,
    mouthPath: 'M 34 58 Q 50 50 66 58',
  },
  sad: {
    eyeScaleY: 0.8,
    browRotateLeft: 8,
    browRotateRight: -8,
    mouthPath: 'M 33 60 Q 50 52 67 60',
  },
  default: {
    eyeScaleY: 1.0,
    browRotateLeft: 0,
    browRotateRight: 0,
    mouthPath: 'M 34 54 Q 50 56 66 54',
  },
}

export default function ManuOrb({ mood, size = 100, pulse = true }: Props) {
  const face = FACES[mood ?? 'default'] ?? FACES.default
  const scale = size / 100

  return (
    <motion.div
      whileTap={{ scale: 0.93 }}
      className={pulse ? 'manu-pulse' : ''}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #2C3E7A 0%, #1B6CA8 45%, #0D4F8A 100%)',
        position: 'relative',
        flexShrink: 0,
        boxShadow: '0 0 0 3px rgba(244,165,53,0.25), 0 8px 32px rgba(27,108,168,0.45)',
      }}
    >
      {/* Glassy shine highlight */}
      <div
        style={{
          position: 'absolute',
          width: 20 * scale,
          height: 12 * scale,
          borderRadius: '50%',
          background: 'white',
          opacity: 0.35,
          filter: 'blur(3px)',
          top: '22%',
          left: '28%',
          pointerEvents: 'none',
        }}
      />

      {/* SVG face */}
      <svg
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {/* Left eyebrow */}
        <motion.line
          x1="28" y1="32" x2="42" y2="30"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{ rotate: face.browRotateLeft }}
          style={{ originX: '35px', originY: '31px' }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />
        {/* Right eyebrow */}
        <motion.line
          x1="58" y1="30" x2="72" y2="32"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{ rotate: face.browRotateRight }}
          style={{ originX: '65px', originY: '31px' }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />

        {/* Left eye — ellipse with pupil */}
        <motion.ellipse
          cx="36" cy="42" rx="5" ry="5"
          fill="white"
          animate={{ scaleY: face.eyeScaleY }}
          style={{ originX: '36px', originY: '42px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        <circle cx="37" cy="43" r="2" fill="#1A1B3A" />

        {/* Right eye — ellipse with pupil */}
        <motion.ellipse
          cx="64" cy="42" rx="5" ry="5"
          fill="white"
          animate={{ scaleY: face.eyeScaleY }}
          style={{ originX: '64px', originY: '42px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        <circle cx="65" cy="43" r="2" fill="#1A1B3A" />

        {/* Mouth */}
        <motion.path
          animate={{ d: face.mouthPath }}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />
      </svg>
    </motion.div>
  )
}
