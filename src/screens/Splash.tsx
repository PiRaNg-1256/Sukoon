import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'
import { storage } from '../lib/storage'

interface Props {
  onDone: () => void
}

export default function Splash({ onDone }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    storage.markSplashSeen()
    timerRef.current = setTimeout(onDone, 7000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [onDone])

  const handleEnded = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    onDone()
  }

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#0a101e',
        overflow: 'hidden',
      }}
    >
      {/* Video background */}
      <video
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src="/splash.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(10,16,30,0.75) 0%, transparent 100%)',
        }}
      />

      {/* Logo + tagline — bottom third */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          bottom: '15%',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Logo size="lg" color="white" />
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, fontFamily: 'Nunito, sans-serif', letterSpacing: '0.02em' }}>
          सुकून — a safe space for your mind
        </p>
      </motion.div>
    </motion.div>
  )
}
