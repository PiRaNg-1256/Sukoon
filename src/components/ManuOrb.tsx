import { motion } from 'framer-motion'
import type { Mood } from '../types'

interface Props {
  mood?: Mood | null
  size?: number
  pulse?: boolean
}

type FaceState = { eyeScale: number; mouthType: 'happy' | 'neutral' | 'sad' }

const MOOD_FACES: Record<string, FaceState> = {
  happy:   { eyeScale: 1.0, mouthType: 'happy'   },
  good:    { eyeScale: 1.0, mouthType: 'happy'   },
  neutral: { eyeScale: 0.9, mouthType: 'neutral' },
  anxious: { eyeScale: 1.2, mouthType: 'sad'     },
  sad:     { eyeScale: 0.8, mouthType: 'sad'     },
  default: { eyeScale: 1.0, mouthType: 'neutral' },
}

export default function ManuOrb({ mood, size = 100, pulse = true }: Props) {
  const face = MOOD_FACES[mood ?? 'default'] ?? MOOD_FACES.default
  const eyeSize  = Math.round(size * 0.1)
  const eyeY     = size * 0.36
  const leftEyeX  = size * 0.33
  const rightEyeX = size * 0.57
  const mouthW   = size * 0.32
  const mouthH   = size * 0.1
  const mouthX   = (size - mouthW) / 2
  const mouthY   = size * 0.57

  const mouthRadius =
    face.mouthType === 'happy'   ? '0 0 50px 50px' :
    face.mouthType === 'sad'     ? '50px 50px 0 0'  :
                                   '4px'

  const borderStyle =
    face.mouthType === 'happy'
      ? { borderBottom: '2.5px solid white', borderLeft: '2.5px solid white', borderRight: '2.5px solid white', borderTop: 'none' }
      : face.mouthType === 'sad'
      ? { borderTop: '2.5px solid white', borderLeft: '2.5px solid white', borderRight: '2.5px solid white', borderBottom: 'none' }
      : { border: '2.5px solid white' }

  return (
    <motion.div
      whileTap={{ scale: 0.93 }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 38%, #1B6CA8 0%, #2d8fe0 40%, #F4A535 100%)',
        position: 'relative',
        flexShrink: 0,
      }}
      className={pulse ? 'manu-pulse' : ''}
    >
      {/* Left eye */}
      <motion.div
        animate={{ scaleY: face.eyeScale }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          position: 'absolute',
          width: eyeSize,
          height: eyeSize,
          borderRadius: '50%',
          background: 'white',
          top: eyeY,
          left: leftEyeX,
          transformOrigin: 'center',
        }}
      />
      {/* Right eye */}
      <motion.div
        animate={{ scaleY: face.eyeScale }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          position: 'absolute',
          width: eyeSize,
          height: eyeSize,
          borderRadius: '50%',
          background: 'white',
          top: eyeY,
          left: rightEyeX,
          transformOrigin: 'center',
        }}
      />
      {/* Mouth */}
      <motion.div
        animate={{ borderRadius: mouthRadius }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        style={{
          position: 'absolute',
          width: mouthW,
          height: mouthH,
          left: mouthX,
          top: mouthY,
          ...borderStyle,
        }}
      />
    </motion.div>
  )
}
