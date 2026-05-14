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

const PHASE_COLORS: Record<BreathPhase, { ring: string; text: string; glow: string }> = {
  inhale: { ring: '#1B6CA8', text: '#1B6CA8', glow: 'rgba(27,108,168,0.4)' },
  hold:   { ring: '#1A1B3A', text: '#1A1B3A', glow: 'rgba(26,27,58,0.4)'   },
  exhale: { ring: '#F4A535', text: '#F4A535', glow: 'rgba(244,165,53,0.4)' },
  idle:   { ring: '#1B6CA8', text: '#6B7280', glow: 'none'                 },
}

const OUTER_R = 118
const CIRCUMFERENCE = 2 * Math.PI * OUTER_R

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
  const [dashOffset, setDashOffset] = useState(0)

  const phaseRef = useRef<BreathPhase>('idle')
  const presetRef = useRef<BreathPreset>('calm')
  const sessionRef = useRef(0)
  const phaseTotalRef = useRef(0)
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
    phaseTotalRef.current = cfg.inhale
    setPhase('inhale')
    setPhaseTimeLeft(cfg.inhale)
    setDashOffset(CIRCUMFERENCE)
  }

  const stopSession = () => {
    clearTick()
    setPhase('idle')
    setPhaseTimeLeft(0)
    setSessionTimeLeft(0)
    setDashOffset(0)
  }

  useEffect(() => {
    if (phase === 'idle') return
    clearTick()

    intervalRef.current = setInterval(() => {
      sessionRef.current -= 1
      setSessionTimeLeft(sessionRef.current)

      if (sessionRef.current <= 0) {
        clearTick()
        setPhase('idle')
        setPhaseTimeLeft(0)
        setDashOffset(0)
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
        const next = prev - 1
        // update SVG ring progress
        const progress = next / phaseTotalRef.current
        setDashOffset(CIRCUMFERENCE * progress)

        if (next <= 0) {
          const nextPhase = getNextPhase(phaseRef.current, PRESETS[presetRef.current])
          phaseTotalRef.current = nextPhase.duration
          setPhase(nextPhase.phase)
          setDashOffset(CIRCUMFERENCE)
          return nextPhase.duration
        }
        return next
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

  const colors = PHASE_COLORS[phase]

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
      <div className="px-4 pt-8 pb-24">
        <h1 className="text-2xl font-extrabold mb-6 text-center" style={{ color: 'var(--cn-text)' }}>
          {tr('breathe_title')}
        </h1>

        {/* Breathing circle */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative flex items-center justify-center" style={{ width: 256, height: 256 }}>
            {/* SVG progress ring */}
            <svg
              width={256}
              height={256}
              style={{
                position: 'absolute',
                inset: 0,
                transform: 'rotate(-90deg)',
                filter: phase !== 'idle' ? `drop-shadow(0 0 12px ${colors.glow})` : 'none',
              }}
            >
              {/* track */}
              <circle
                cx={128} cy={128} r={OUTER_R}
                fill="none"
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={4}
              />
              {/* progress */}
              <motion.circle
                cx={128} cy={128} r={OUTER_R}
                fill="none"
                stroke={colors.ring}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                animate={{ strokeDashoffset: dashOffset, stroke: colors.ring }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </svg>

            {/* Inner animated rings */}
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: cycleDuration, ease: 'easeInOut' }}
              className="absolute rounded-full opacity-10"
              style={{ width: 200, height: 200, background: colors.ring }}
            />
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: cycleDuration, ease: 'easeInOut', delay: 0.04 }}
              className="absolute rounded-full opacity-20"
              style={{ width: 168, height: 168, background: colors.ring }}
            />
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: cycleDuration, ease: 'easeInOut', delay: 0.08 }}
              className="absolute rounded-full opacity-60"
              style={{
                width: 136, height: 136,
                background: `linear-gradient(135deg, ${colors.ring} 0%, ${phase === 'exhale' ? '#1B6CA8' : '#F4A535'} 100%)`,
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
                <p className="text-3xl font-extrabold" style={{ color: colors.text }}>{phaseLabel}</p>
                <p className="text-sm" style={{ color: 'var(--cn-muted)' }}>{phaseTimeLeft}s</p>
              </motion.div>
            )}
          </AnimatePresence>
          {phase === 'idle' && !done && (
            <p className="text-sm pt-3" style={{ color: 'var(--cn-muted)' }}>
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
              className="text-center font-bold text-lg mb-4" style={{ color: '#22c55e' }}
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
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                  style={preset === key
                    ? { background: '#7c3aed', color: 'white' }
                    : { background: 'rgba(255,255,255,0.07)', color: 'var(--cn-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
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
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                  style={durationMin === d
                    ? { background: '#f59e0b', color: 'white' }
                    : { background: 'rgba(255,255,255,0.07)', color: 'var(--cn-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
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
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(124,58,237,0.6)' }}
              onClick={startSession}
              className="font-bold text-lg px-10 py-4 rounded-2xl text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
            >
              {tr('breathe_start')}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={stopSession}
              className="font-semibold px-8 py-3 rounded-2xl"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              {tr('breathe_stop')}
            </motion.button>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
