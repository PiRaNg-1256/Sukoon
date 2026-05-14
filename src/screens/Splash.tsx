import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'

interface Props {
  onDone: () => void
}

export default function Splash({ onDone }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const done = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    onDone()
  }

  useEffect(() => {
    // 8-second hard timeout — never transition mid-video, just skip if too slow
    timerRef.current = setTimeout(done, 8000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCanPlay = () => {
    setVideoReady(true)
    videoRef.current?.play().catch(() => {/* autoplay blocked — timeout will fire */})
  }

  const handleEnded = () => done()

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
        background: '#000',
        overflow: 'hidden',
      }}
    >
      {/* Black + logo shown immediately while video loads */}
      <motion.div
        animate={{ opacity: videoReady ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Logo size="lg" color="white" />
      </motion.div>

      {/* Video — preload auto + fetchpriority high */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        onCanPlayThrough={handleCanPlay}
        onEnded={handleEnded}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
        }}
      >
        {/* @ts-expect-error fetchpriority is valid HTML but not in TS types yet */}
        <source src="/splash.mp4" type="video/mp4" fetchpriority="high" />
      </video>

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(8,11,24,0.85) 0%, transparent 100%)',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Logo + tagline — bottom third */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: videoReady ? 1 : 0, y: videoReady ? 0 : 20 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          bottom: '15%',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          zIndex: 4,
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
