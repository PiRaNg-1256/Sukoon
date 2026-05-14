import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import PageTransition from '../components/PageTransition'
import ManuOrb from '../components/ManuOrb'
import { storage } from '../lib/storage'
import { checkAndUnlockBadges } from '../lib/badges'
import type { Lang, Mood } from '../types'
import type { Tr, TranslationKey } from '../translations'

const MOODS: { key: Mood; emoji: string; labelKey: TranslationKey }[] = [
  { key: 'sad',     emoji: '😔', labelKey: 'mood_sad'     },
  { key: 'anxious', emoji: '😰', labelKey: 'mood_anxious' },
  { key: 'neutral', emoji: '😶', labelKey: 'mood_neutral' },
  { key: 'good',    emoji: '🙂', labelKey: 'mood_good'    },
  { key: 'happy',   emoji: '😄', labelKey: 'mood_happy'   },
]

const PROMPTS_HI = [
  'आज तुमने किस बात पर ध्यान दिया जो तुम्हें अच्छी लगी?',
  'आज तुम किसकी मदद कर सकते हो?',
  'एक चीज़ जो तुम्हें आज खुश करती है?',
  'क्या कोई बात है जो तुम कहना चाहते हो पर कह नहीं पाए?',
  'आज तुमने अपने आप की कैसे देखभाल की?',
  'एक डर जो तुम्हें रोक रहा है — क्या वो सच में इतना बड़ा है?',
  'तुम्हारी सबसे बड़ी ताकत क्या है?',
]

const PROMPTS_EN = [
  'What did you notice today that felt good?',
  'Who can you help today?',
  'One thing that makes you happy right now?',
  "Is there something you wanted to say but couldn't?",
  'How did you take care of yourself today?',
  'A fear holding you back — is it really as big as it seems?',
  'What is your greatest strength?',
]

function getGreeting(tr: Tr): string {
  const h = new Date().getHours()
  if (h < 12) return tr('morning')
  if (h < 17) return tr('afternoon')
  if (h < 20) return tr('evening')
  return tr('night')
}

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
}

interface Props { lang: Lang; tr: Tr }

export default function Home({ lang, tr }: Props) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(
    () => storage.getTodayMood()?.mood ?? null
  )
  const navigate = useNavigate()
  const prompt = lang === 'hi'
    ? PROMPTS_HI[new Date().getDay()]
    : PROMPTS_EN[new Date().getDay()]

  const manuSpring = useSpring({
    scale: selectedMood ? 1.08 : 1,
    config: { tension: 280, friction: 18 },
  })

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood)
    const date = new Date().toISOString().split('T')[0]
    storage.addMood({ date, mood, timestamp: Date.now() })
    const streak = storage.updateStreak()
    checkAndUnlockBadges({
      moodLog: storage.getMoodLog(),
      streak,
      breatheCount: storage.getBreatheCount(),
      meditateCount: storage.getMeditateCount(),
      groundCount: storage.getGroundCount(),
      chatCount: storage.getChatCount(),
    })
  }

  const streak = storage.getStreak()

  return (
    <PageTransition>
      <div className="px-4 pt-8 pb-24">
        {/* Orb + greeting */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative flex items-center justify-center">
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 220, height: 220,
                background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
              }}
            />
            <animated.div style={manuSpring}>
              <ManuOrb mood={selectedMood} size={140} pulse />
            </animated.div>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight" style={{ color: 'var(--cn-text)' }}>
            {getGreeting(tr)}
          </h1>
          {streak.current > 0 && (
            <span
              className="font-bold px-3 py-1 rounded-full text-sm mt-2"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
            >
              🔥 {streak.current} {tr('streak')}
            </span>
          )}
        </div>

        {/* Mood check-in */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={card}
        >
          <p className="text-center text-sm mb-3" style={{ color: 'var(--cn-muted)' }}>
            {tr('mood_question')}
          </p>
          <div className="flex justify-between gap-1">
            {MOODS.map((m, i) => (
              <motion.button
                key={m.key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.08 }}
                onClick={() => handleMoodSelect(m.key)}
                className="flex flex-col items-center p-2 rounded-xl flex-1 transition-all duration-200"
                style={{
                  background: selectedMood === m.key ? 'rgba(124,58,237,0.2)' : 'transparent',
                  outline: selectedMood === m.key ? '2px solid rgba(124,58,237,0.6)' : 'none',
                }}
              >
                <span className="text-4xl leading-none">{m.emoji}</span>
                <span className="text-[10px] mt-1 text-center leading-tight" style={{ color: 'var(--cn-muted)' }}>
                  {tr(m.labelKey)}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Daily prompt */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileHover={{ y: -3 }}
          style={card}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#f59e0b' }}>
            {tr('daily_prompt')}
          </p>
          <p className="font-semibold leading-snug" style={{ color: 'var(--cn-text)' }}>{prompt}</p>
        </motion.div>

        {/* Quick access */}
        <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--cn-muted)' }}>
          {tr('quick_access')}
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {([
            { path: '/chat',    emoji: '💬', key: 'chat'    },
            { path: '/breathe', emoji: '🌬️', key: 'breathe' },
            { path: '/learn',   emoji: '📖', key: 'learn'   },
          ] as const).map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.08 }}
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center w-28 h-24 rounded-2xl shrink-0"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <span className="text-3xl mb-1">{item.emoji}</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--cn-text)' }}>{tr(item.key)}</span>
            </motion.button>
          ))}
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs mt-6 px-4 leading-relaxed" style={{ color: 'var(--cn-muted)' }}>
          {tr('privacy_note')}
        </p>
      </div>
    </PageTransition>
  )
}
