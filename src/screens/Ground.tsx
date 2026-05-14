import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import ManuOrb from '../components/ManuOrb'
import { storage } from '../lib/storage'
import { checkAndUnlockBadges } from '../lib/badges'
import type { Lang } from '../types'
import type { Tr } from '../translations'

const STEPS = [
  { num: 5, sense: 'SEE',   senseHi: 'देखो',   icon: '👁️', bg: '#4c1d95', accent: '#7c3aed' },
  { num: 4, sense: 'HEAR',  senseHi: 'सुनो',   icon: '👂', bg: '#0c4a6e', accent: '#0ea5e9' },
  { num: 3, sense: 'TOUCH', senseHi: 'छुओ',    icon: '✋', bg: '#1e3a8a', accent: '#3b82f6' },
  { num: 2, sense: 'SMELL', senseHi: 'सूँघो',  icon: '👃', bg: '#78350f', accent: '#f59e0b' },
  { num: 1, sense: 'TASTE', senseHi: 'चखो',    icon: '👅', bg: '#14532d', accent: '#22c55e' },
]

const INSTRUCTIONS_EN = [
  'Name 5 things you can SEE right now',
  'Name 4 things you can HEAR around you',
  'Name 3 things you can TOUCH nearby',
  'Name 2 things you can SMELL right now',
  'Name 1 thing you can TASTE',
]

const INSTRUCTIONS_HI = [
  'अभी 5 चीज़ें बताओ जो तुम देख सकते हो',
  '4 आवाज़ें बताओ जो तुम सुन सकते हो',
  '3 चीज़ें बताओ जो तुम छू सकते हो',
  '2 चीज़ें बताओ जो तुम सूँघ सकते हो',
  '1 चीज़ बताओ जो तुम चख सकते हो',
]

interface Props { lang: Lang; tr: Tr }

export default function Ground({ lang, tr }: Props) {
  const [step, setStep] = useState(0) // 0=intro, 1-5=steps, 6=done

  const handleNext = () => {
    if (step < 5) {
      setStep(s => s + 1)
    } else {
      setStep(6)
      storage.incrementGroundCount()
      checkAndUnlockBadges({
        moodLog: storage.getMoodLog(),
        streak: storage.getStreak(),
        breatheCount: storage.getBreatheCount(),
        meditateCount: storage.getMeditateCount(),
        groundCount: storage.getGroundCount(),
        chatCount: storage.getChatCount(),
      })
    }
  }

  if (step === 0) {
    return (
      <PageTransition>
        <div
          className="min-h-screen flex flex-col items-center justify-center px-6 text-center pb-24"
          style={{ background: 'linear-gradient(180deg, #0a0820 0%, #080b18 100%)' }}
        >
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ fontSize: 64 }}>🌿</span>
            <h1 className="text-3xl font-extrabold mt-4 mb-3" style={{ color: 'var(--cn-text)' }}>
              5-4-3-2-1 Grounding
            </h1>
            <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--cn-muted)' }}>
              {lang === 'hi'
                ? 'यह अभ्यास तुम्हें अभी के पल में वापस लाता है। अपने आसपास ध्यान दो।'
                : 'This exercise brings you back to the present moment. Pay attention to your surroundings.'}
            </p>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setStep(1)}
              className="font-bold text-lg px-10 py-4 rounded-2xl text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', boxShadow: '0 0 24px rgba(124,58,237,0.5)' }}
            >
              {lang === 'hi' ? 'शुरू करें' : 'Begin'}
            </motion.button>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  if (step === 6) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center pb-24">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
            <ManuOrb mood="happy" size={120} pulse />
            <h2 className="text-3xl font-extrabold mt-6 mb-3" style={{ color: '#22c55e' }}>
              {lang === 'hi' ? 'शाबाश! 🌟' : 'Well done! 🌟'}
            </h2>
            <p className="text-base mb-8" style={{ color: 'var(--cn-muted)' }}>
              {lang === 'hi'
                ? 'तुम अभी के पल में हो। सब ठीक है।'
                : 'You are in the present moment. Everything is okay.'}
            </p>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setStep(0)}
              className="font-semibold px-8 py-3 rounded-2xl text-white"
              style={{ background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)' }}
            >
              {lang === 'hi' ? 'फिर से करें' : 'Do again'}
            </motion.button>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  const s = STEPS[step - 1]
  const instruction = lang === 'hi' ? INSTRUCTIONS_HI[step - 1] : INSTRUCTIONS_EN[step - 1]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center pb-24"
        style={{ background: `linear-gradient(180deg, ${s.bg} 0%, #080b18 100%)` }}
      >
        {/* Step dots */}
        <div className="flex gap-2 mb-12">
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < step ? s.accent : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>

        {/* Giant number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{ fontSize: 120, fontWeight: 900, color: s.accent, lineHeight: 1, textShadow: `0 0 60px ${s.accent}` }}
        >
          {s.num}
        </motion.div>

        <div style={{ fontSize: 48, marginTop: 8, marginBottom: 24 }}>{s.icon}</div>

        <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'white' }}>
          {s.num} things you can <span style={{ color: s.accent }}>{lang === 'hi' ? s.senseHi : s.sense}</span>
        </h2>
        <p className="text-base mb-12 leading-relaxed max-w-xs" style={{ color: 'rgba(226,232,240,0.7)' }}>
          {instruction}
        </p>

        <motion.button
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleNext}
          className="font-bold text-lg px-12 py-4 rounded-2xl text-white"
          style={{ background: s.accent, boxShadow: `0 0 24px ${s.accent}66` }}
        >
          {step < 5
            ? (lang === 'hi' ? 'अगला →' : 'Next →')
            : (lang === 'hi' ? 'पूरा करें ✓' : 'Finish ✓')}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}
