import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import ManuOrb from '../components/ManuOrb'
import { storage } from '../lib/storage'
import type { BreathPhase, BreathPreset, Lang } from '../types'
import type { Tr, TranslationKey } from '../translations'

const PRESETS: Record<BreathPreset, { inhale: number; hold: number; exhale: number }> = {
  sleep:   { inhale: 4, hold: 7, exhale: 8 },
  anxiety: { inhale: 4, hold: 4, exhale: 4 },
  calm:    { inhale: 4, hold: 0, exhale: 6 },
}

const DURATIONS = [3, 5, 10] as const
const DURATION_KEYS: TranslationKey[] = ['duration_3', 'duration_5', 'duration_10']

interface Props { lang: Lang; tr: Tr }

export default function Breathe({ tr }: Props) {
  const [preset, setPreset] = useState<BreathPreset>('calm')
  const [durationMin, setDurationMin] = useState<3 | 5 | 10>(3)
  const [phase, setPhase] = useState<BreathPhase>('idle')
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0)
  const [done, setDone] = useState(false)

  const phaseRef = useRef<BreathPhase>('idle')
  const presetRef = useRef<BreathPreset>('calm')
  const sessionRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  phaseRef.current = phase
  presetRef.current = preset

  const clearTick = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  const getNextPhase = (cur: BreathPhase, cfg: typeof PRESETS[BreathPreset]): { phase: BreathPhase; duration: number } => {
    if (cur === 'inhale') {
      return cfg.hold > 0
        ? { phase: 'hold',   duration: cfg.hold   }
        : { phase: 'exhale', duration: cfg.exhale  }
    }
    if (cur === 'hold')   return { phase: 'exhale', duration: cfg.exhale  }
    return                       { phase: 'inhale', duration: cfg.inhale  }
  }

  const startSession = () => {
    setDone(false)
    const total = durationMin * 60
    sessionRef.current = total
    setSessionTimeLeft(total)
    const cfg = PRESETS[preset]
    setPhase('inhale')
    setPhaseTimeLeft(cfg.inhale)
  }

  const stopSession = () => {
    clearTick()
    setPhase('idle')
    setPhaseTimeLeft(0)
    setSessionTimeLeft(0)
  }

  useEffect(() => {
    if (phase === 'idle') return
    clearTick()

    intervalRef.current = setInterval(() => {
      // decrement session
      sessionRef.current -= 1
      setSessionTimeLeft(sessionRef.current)

      if (sessionRef.current <= 0) {
        clearTick()
        setPhase('idle')
        setPhaseTimeLeft(0)
        setDone(true)
        storage.addBreatheEntry({
          date: new Date().toISOString().split('T')[0],
          preset: presetRef.current,
          duration: durationMin * 60,
        })
        storage.updateStreak()
        return
      }

      setPhaseTimeLeft(prev => {
        if (prev <= 1) {
          const next = getNextPhase(phaseRef.current, PRESETS[presetRef.current])
          setPhase(next.phase)
          return next.duration
        }
        return prev - 1
      })
    }, 1000)

    return clearTick
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const config = PRESETS[preset]
  const circleScale = (phase === 'inhale') ? 1.3 : (phase === 'hold') ? 1.3 : 0.65
  const cycleDuration = phase === 'inhale' ? config.inhale
    : phase === 'hold'   ? config.hold
    : phase === 'exhale' ? config.exhale
    : 0.4

  const phaseLabel =
    phase === 'inhale' ? tr('breathe_inhale') :
    phase === 'hold'   ? tr('breathe_hold')   :
    phase === 'exhale' ? tr('breathe_exhale') : ''

  const presetOptions: { key: BreathPreset; labelKey: TranslationKey }[] = [
    { key: 'sleep',   labelKey: 'preset_sleep'   },
    { key: 'anxiety', labelKey: 'preset_anxiety' },
    { key: 'calm',    labelKey: 'preset_calm'    },
  ]

  return (
    <PageTransition>
      <div className="px-4 pt-8">
        <h1 className="text-2xl font-extrabold text-dark-indigo mb-6 text-center">
          {tr('breathe_title')}
        </h1>

        {/* Breathing circle */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative flex items-center justify-center" style={{ width: 256, height: 256 }}>
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: cycleDuration, ease: 'easeInOut' }}
              className="absolute rounded-full bg-teal opacity-10"
              style={{ width: 240, height: 240 }}
            />
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: cycleDuration, ease: 'easeInOut', delay: 0.04 }}
              className="absolute rounded-full bg-teal opacity-20"
              style={{ width: 200, height: 200 }}
            />
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: cycleDuration, ease: 'easeInOut', delay: 0.08 }}
              className="absolute rounded-full opacity-60"
              style={{
                width: 160, height: 160,
                background: 'linear-gradient(135deg, #1B6CA8 0%, #F4A535 100%)',
              }}
            />
            <div className="relative z-10">
              <ManuOrb size={68} pulse={phase !== 'idle'} />
            </div>
          </div>
        </div>

        {/* Phase label */}
        <div className="text-center mb-1 h-12">
          <AnimatePresence mode="wait">
            {phase !== 'idle' && (
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-2xl font-extrabold text-dark-indigo">{phaseLabel}</p>
                <p className="text-muted text-sm">{phaseTimeLeft}s</p>
              </motion.div>
            )}
          </AnimatePresence>
          {phase === 'idle' && !done && (
            <p className="text-muted text-sm pt-3">
              {config.inhale}s — {config.hold > 0 ? `${config.hold}s — ` : ''}{config.exhale}s
            </p>
          )}
        </div>

        {/* Session timer */}
        {phase !== 'idle' && (
          <p className="text-center text-xs text-muted mb-4">
            {Math.floor(sessionTimeLeft / 60)}:{String(sessionTimeLeft % 60).padStart(2, '0')} बाकी
          </p>
        )}

        {/* Done */}
        <AnimatePresence>
          {done && (
            <motion.p
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center font-bold text-teal text-lg mb-4"
            >
              {tr('breathe_done')}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Preset + Duration selectors */}
        {phase === 'idle' && (
          <div className="mb-6">
            <div className="flex gap-2 justify-center flex-wrap mb-3">
              {presetOptions.map(({ key, labelKey }) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setPreset(key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    preset === key ? 'bg-teal text-white' : 'bg-white text-muted shadow-soft'
                  }`}
                >
                  {tr(labelKey)}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2 justify-center">
              {DURATIONS.map((d, i) => (
                <motion.button
                  key={d}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setDurationMin(d)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    durationMin === d ? 'bg-saffron text-white' : 'bg-white text-muted shadow-soft'
                  }`}
                >
                  {tr(DURATION_KEYS[i])}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Start / Stop */}
        <div className="flex justify-center">
          {phase === 'idle' ? (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={startSession}
              className="bg-teal text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-glow"
            >
              {tr('breathe_start')}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={stopSession}
              className="bg-white text-danger font-semibold px-8 py-3 rounded-2xl shadow-soft border border-danger/20"
            >
              {tr('breathe_stop')}
            </motion.button>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
