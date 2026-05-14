import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, StopCircle } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { storage } from '../lib/storage'
import { checkAndUnlockBadges } from '../lib/badges'
import type { Lang } from '../types'
import type { Tr } from '../translations'

type Category = 'sleep' | 'anxiety' | 'focus' | 'grief' | 'anger'
type Duration = 5 | 10 | 15

interface MedCard {
  id: string
  category: Category
  duration: Duration
  title: string
  titleHi: string
}

const CATEGORIES: { key: Category; label: string; labelHi: string; color: string }[] = [
  { key: 'sleep',   label: 'Sleep',   labelHi: 'नींद',      color: '#1d4ed8' },
  { key: 'anxiety', label: 'Anxiety', labelHi: 'घबराहट',    color: '#7c3aed' },
  { key: 'focus',   label: 'Focus',   labelHi: 'ध्यान',     color: '#0ea5e9' },
  { key: 'grief',   label: 'Grief',   labelHi: 'दुख',       color: '#6d28d9' },
  { key: 'anger',   label: 'Anger',   labelHi: 'गुस्सा',    color: '#dc2626' },
]

const DURATIONS: Duration[] = [5, 10, 15]

function buildCards(): MedCard[] {
  const cards: MedCard[] = []
  const titles: Record<Category, { en: string; hi: string }> = {
    sleep:   { en: 'Deep Sleep',      hi: 'गहरी नींद'      },
    anxiety: { en: 'Calm the Storm',  hi: 'शांत मन'        },
    focus:   { en: 'Clear Mind',      hi: 'साफ मन'         },
    grief:   { en: 'Gentle Healing',  hi: 'कोमल उपचार'     },
    anger:   { en: 'Release & Relax', hi: 'छोड़ो और चैन पाओ' },
  }
  for (const cat of CATEGORIES) {
    for (const dur of DURATIONS) {
      cards.push({
        id: `${cat.key}-${dur}`,
        category: cat.key,
        duration: dur,
        title: `${titles[cat.key].en} · ${dur} min`,
        titleHi: `${titles[cat.key].hi} · ${dur} मिनट`,
      })
    }
  }
  return cards
}

const ALL_CARDS = buildCards()

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

async function generateScript(category: Category, duration: Duration): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string
  const prompt = `Generate a calming ${duration}-minute guided meditation script for ${category}.
Write in a warm, soothing tone. Use simple English. Include: opening breath, body scan, visualization, gentle affirmations, closing.
Keep it under 600 words. Do not add section headers. Just the pure script text.`

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    }),
  })
  if (!res.ok) throw new Error(`Groq ${res.status}`)
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return data.choices[0].message.content
}

interface Props { lang: Lang; tr: Tr }

export default function Meditate({ lang, tr }: Props) {
  const [catFilter, setCatFilter] = useState<Category | null>(null)
  const [durFilter, setDurFilter] = useState<Duration | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const durationRef = useRef<number>(0)

  const filtered = ALL_CARDS.filter(c =>
    (!catFilter || c.category === catFilter) &&
    (!durFilter || c.duration === durFilter)
  )

  const cat = (key: Category) => CATEGORIES.find(c => c.key === key)!

  const stopPlayback = () => {
    window.speechSynthesis.cancel()
    if (progressRef.current) clearInterval(progressRef.current)
    setPlaying(null)
    setPaused(false)
    setProgress(0)
  }

  useEffect(() => () => { stopPlayback() }, [])

  const playCard = async (card: MedCard) => {
    if (playing === card.id) {
      if (paused) { window.speechSynthesis.resume(); setPaused(false) }
      else { window.speechSynthesis.pause(); setPaused(true) }
      return
    }
    stopPlayback()
    setLoading(card.id)

    let script: string
    const cacheKey = `sukoon_med_${card.id}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      script = cached
    } else {
      try {
        script = await generateScript(card.category, card.duration)
        localStorage.setItem(cacheKey, script)
      } catch {
        script = `Close your eyes and breathe deeply. Take this moment for yourself. Breathe in slowly... and out. You are safe. You are calm. Continue breathing gently for the next ${card.duration} minutes.`
      }
    }

    setLoading(null)
    setPlaying(card.id)
    setPaused(false)

    const utter = new SpeechSynthesisUtterance(script)
    utter.rate = 0.85
    utter.pitch = 1.0
    utterRef.current = utter

    const totalMs = card.duration * 60 * 1000
    durationRef.current = totalMs
    startTimeRef.current = Date.now()

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      setProgress(Math.min(elapsed / totalMs, 1))
    }, 500)

    utter.onend = () => {
      if (progressRef.current) clearInterval(progressRef.current)
      setProgress(1)
      setTimeout(() => {
        setPlaying(null)
        setProgress(0)
        storage.incrementMeditateCount()
        checkAndUnlockBadges({
          moodLog: storage.getMoodLog(),
          streak: storage.getStreak(),
          breatheCount: storage.getBreatheCount(),
          meditateCount: storage.getMeditateCount(),
          groundCount: storage.getGroundCount(),
          chatCount: storage.getChatCount(),
        })
      }, 1000)
    }

    window.speechSynthesis.speak(utter)
  }

  const CIRCUMFERENCE = 2 * Math.PI * 22

  return (
    <PageTransition>
      <div className="px-4 pt-8 pb-24">
        <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--cn-text)' }}>
          🧘 {lang === 'hi' ? 'ध्यान पुस्तकालय' : 'Meditation Library'}
        </h1>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
          <button
            onClick={() => setCatFilter(null)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold shrink-0 transition-all"
            style={!catFilter ? { background: '#7c3aed', color: 'white' } : { background: 'rgba(255,255,255,0.07)', color: 'var(--cn-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {lang === 'hi' ? 'सभी' : 'All'}
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCatFilter(catFilter === c.key ? null : c.key)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold shrink-0 transition-all"
              style={catFilter === c.key
                ? { background: c.color, color: 'white' }
                : { background: 'rgba(255,255,255,0.07)', color: 'var(--cn-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {lang === 'hi' ? c.labelHi : c.label}
            </button>
          ))}
        </div>

        {/* Duration pills */}
        <div className="flex gap-2 mb-5">
          {([null, 5, 10, 15] as (Duration | null)[]).map(d => (
            <button
              key={d ?? 'all'}
              onClick={() => setDurFilter(d === durFilter ? null : d)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={durFilter === d
                ? { background: '#f59e0b', color: 'white' }
                : { background: 'rgba(255,255,255,0.07)', color: 'var(--cn-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {d === null ? (lang === 'hi' ? 'सभी' : 'All') : `${d} min`}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((card, i) => {
            const catInfo = cat(card.category)
            const isPlaying = playing === card.id
            const isLoading = loading === card.id
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{
                  background: isPlaying ? `${catInfo.color}22` : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isPlaying ? catInfo.color + '55' : 'rgba(255,255,255,0.08)'}`,
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Progress ring */}
                <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                  <svg width={52} height={52} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={26} cy={26} r={22} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
                    {isPlaying && (
                      <circle cx={26} cy={26} r={22} fill="none" stroke={catInfo.color} strokeWidth={3}
                        strokeLinecap="round" strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                        style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                      />
                    )}
                  </svg>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => playCard(card)}
                    disabled={!!loading}
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    {isLoading
                      ? <span style={{ fontSize: 14, color: 'var(--cn-muted)', animation: 'twinkle 1s infinite' }}>…</span>
                      : isPlaying && !paused
                        ? <Pause size={18} color={catInfo.color} />
                        : <Play size={18} color={isPlaying ? catInfo.color : 'rgba(226,232,240,0.6)'} />
                    }
                  </motion.button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--cn-text)' }}>
                    {lang === 'hi' ? card.titleHi : card.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: catInfo.color }}>
                    {lang === 'hi' ? catInfo.labelHi : catInfo.label}
                  </p>
                </div>

                {isPlaying && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={stopPlayback}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
                  >
                    <StopCircle size={20} color="rgba(226,232,240,0.4)" />
                  </motion.button>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Now playing banner */}
        <AnimatePresence>
          {playing && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              style={{
                position: 'fixed', bottom: 80, left: 16, right: 16, zIndex: 40,
                background: 'rgba(124,58,237,0.9)',
                backdropFilter: 'blur(16px)', borderRadius: 16, padding: '12px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
                {paused ? '⏸ Paused' : '🎙 Playing…'}
              </span>
              <button onClick={stopPlayback} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: 'white', padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>
                Stop
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
