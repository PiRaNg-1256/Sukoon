import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, StopCircle, X } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { COMMUNITY_STORIES, SLEEP_THEMES } from '../data/communityStories'
import type { CommunityStory } from '../data/communityStories'
import { storage } from '../lib/storage'
import { checkAndUnlockBadges } from '../lib/badges'
import type { Lang } from '../types'
import type { Tr } from '../translations'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

async function generateSleepStory(themeId: string, themeTitle: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string
  const prompt = `Write a gentle, immersive sleep story set in India with the theme "${themeTitle}".
The story should be 3-4 paragraphs, written in second person ("you"), deeply sensory, slow-paced, and designed to help someone drift off to sleep.
Include specific Indian sensory details — smells, sounds, textures — that feel familiar and comforting.
Do not include any plot tension, conflict, or resolution. Just a peaceful experience.
Write only the story text, no title or headers.`

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.8,
    }),
  })
  if (!res.ok) throw new Error(`Groq ${res.status}`)
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return data.choices[0].message.content
}

const CATEGORY_COLORS: Record<string, string> = {
  loneliness: '#7c3aed',
  exam: '#0ea5e9',
  grief: '#6d28d9',
  family: '#f59e0b',
  heartbreak: '#ef4444',
  burnout: '#16a34a',
}

const CATEGORY_LABELS: Record<string, string> = {
  loneliness: 'Loneliness',
  exam: 'Exams',
  grief: 'Grief',
  family: 'Family',
  heartbreak: 'Heartbreak',
  burnout: 'Burnout',
}

interface Props { lang: Lang; tr: Tr }

export default function Stories({ lang, tr }: Props) {
  const [tab, setTab] = useState<'sleep' | 'community'>('sleep')
  const [catFilter, setCatFilter] = useState<string | null>(null)

  // Sleep story state
  const [playingTheme, setPlayingTheme] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  // Community story state
  const [selectedStory, setSelectedStory] = useState<CommunityStory | null>(null)
  const [readStories, setReadStories] = useState<Set<string>>(() => new Set())

  const stopPlayback = () => {
    window.speechSynthesis.cancel()
    if (progressRef.current) clearInterval(progressRef.current)
    setPlayingTheme(null)
    setPaused(false)
    setProgress(0)
  }

  const playTheme = async (themeId: string, themeTitle: string) => {
    if (playingTheme === themeId) {
      if (paused) { window.speechSynthesis.resume(); setPaused(false) }
      else { window.speechSynthesis.pause(); setPaused(true) }
      return
    }
    stopPlayback()
    setLoading(themeId)

    let script: string
    const cacheKey = `sukoon_sleep_${themeId}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      script = cached
    } else {
      try {
        script = await generateSleepStory(themeId, themeTitle)
        localStorage.setItem(cacheKey, script)
      } catch {
        script = `Close your eyes gently. You are safe and warm. Let your body relax into the ground beneath you. Breathe slowly, deeply. The world outside is quiet now. You are exactly where you need to be. Let sleep come naturally, softly, like a tide returning to shore.`
      }
    }

    setLoading(null)
    setPlayingTheme(themeId)
    setPaused(false)

    const utter = new SpeechSynthesisUtterance(script)
    utter.rate = 0.75
    utter.pitch = 0.95
    utterRef.current = utter

    const totalMs = 8 * 60 * 1000 // estimate 8 min for progress ring
    startTimeRef.current = Date.now()

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      setProgress(Math.min(elapsed / totalMs, 1))
    }, 500)

    utter.onend = () => {
      if (progressRef.current) clearInterval(progressRef.current)
      setProgress(1)
      setTimeout(() => {
        setPlayingTheme(null)
        setProgress(0)
        // count sleep story as read
        markStoryRead('__sleep__' + themeId)
      }, 1000)
    }

    window.speechSynthesis.speak(utter)
  }

  const markStoryRead = (id: string) => {
    if (readStories.has(id)) return
    const next = new Set(readStories)
    next.add(id)
    setReadStories(next)
    storage.incrementStoriesCount()
    checkAndUnlockBadges({
      moodLog: storage.getMoodLog(),
      streak: storage.getStreak(),
      breatheCount: storage.getBreatheCount(),
      meditateCount: storage.getMeditateCount(),
      groundCount: storage.getGroundCount(),
      chatCount: storage.getChatCount(),
      storiesCount: storage.getStoriesCount(),
    })
  }

  const CIRCUMFERENCE = 2 * Math.PI * 22
  const filtered = catFilter ? COMMUNITY_STORIES.filter(s => s.category === catFilter) : COMMUNITY_STORIES

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 16,
  }

  return (
    <PageTransition>
      <div className="px-4 pt-8 pb-24">
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--cn-text)' }}>
          📖 {lang === 'hi' ? 'कहानियाँ' : 'Stories'}
        </h1>
        <p className="text-sm mb-5" style={{ color: 'var(--cn-muted)' }}>
          {lang === 'hi' ? 'सोने की कहानियाँ और असली अनुभव' : 'Sleep stories & real experiences'}
        </p>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-5" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 }}>
          {(['sleep', 'community'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
              style={tab === t
                ? { background: '#7c3aed', color: 'white', boxShadow: '0 0 12px rgba(124,58,237,0.4)' }
                : { color: 'var(--cn-muted)' }}
            >
              {t === 'sleep'
                ? (lang === 'hi' ? '🌙 सोने की कहानी' : '🌙 Sleep Stories')
                : (lang === 'hi' ? '🤝 असली कहानियाँ' : '🤝 Community')}
            </button>
          ))}
        </div>

        {/* ── SLEEP STORIES ── */}
        {tab === 'sleep' && (
          <div className="flex flex-col gap-3">
            {SLEEP_THEMES.map((theme, i) => {
              const isPlaying = playingTheme === theme.id
              const isLoading = loading === theme.id
              return (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    ...card,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    background: isPlaying ? `${theme.accent}22` : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isPlaying ? theme.accent + '55' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {/* Progress ring */}
                  <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                    <svg width={52} height={52} style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx={26} cy={26} r={22} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
                      {isPlaying && (
                        <circle cx={26} cy={26} r={22} fill="none" stroke={theme.accent} strokeWidth={3}
                          strokeLinecap="round" strokeDasharray={CIRCUMFERENCE}
                          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                          style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                        />
                      )}
                    </svg>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => playTheme(theme.id, theme.title)}
                      disabled={!!loading}
                      style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                      {isLoading
                        ? <span style={{ fontSize: 14, color: 'var(--cn-muted)', animation: 'twinkle 1s infinite' }}>…</span>
                        : isPlaying && !paused
                          ? <Pause size={18} color={theme.accent} />
                          : <Play size={18} color={isPlaying ? theme.accent : 'rgba(226,232,240,0.6)'} />
                      }
                    </motion.button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--cn-text)' }}>
                      <span>{theme.emoji}</span> {theme.title}
                    </p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--cn-muted)' }}>
                      {theme.description}
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

            {/* Now playing banner */}
            <AnimatePresence>
              {playingTheme && (
                <motion.div
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 80, opacity: 0 }}
                  style={{
                    position: 'fixed', bottom: 80, left: 16, right: 16, zIndex: 40,
                    background: 'rgba(30,20,60,0.95)',
                    backdropFilter: 'blur(16px)', borderRadius: 16, padding: '12px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    border: '1px solid rgba(124,58,237,0.4)',
                  }}
                >
                  <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
                    {paused ? '⏸ Paused' : '🌙 Playing sleep story…'}
                  </span>
                  <button onClick={stopPlayback} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: 'white', padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>
                    Stop
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── COMMUNITY STORIES ── */}
        {tab === 'community' && (
          <>
            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
              <button
                onClick={() => setCatFilter(null)}
                className="px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all"
                style={!catFilter
                  ? { background: '#7c3aed', color: 'white' }
                  : { background: 'rgba(255,255,255,0.07)', color: 'var(--cn-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                All
              </button>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCatFilter(catFilter === key ? null : key)}
                  className="px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all"
                  style={catFilter === key
                    ? { background: CATEGORY_COLORS[key], color: 'white' }
                    : { background: 'rgba(255,255,255,0.07)', color: 'var(--cn-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {filtered.map((story, i) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedStory(story)}
                  style={{ ...card, padding: 16, cursor: 'pointer' }}
                >
                  <div className="flex items-start gap-3">
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{story.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--cn-text)' }}>{story.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--cn-muted)' }}>{story.author} · {story.region}</p>
                      <span
                        className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: `${CATEGORY_COLORS[story.category]}22`, color: CATEGORY_COLORS[story.category] }}
                      >
                        {CATEGORY_LABELS[story.category]}
                      </span>
                    </div>
                    {readStories.has(story.id) && (
                      <span style={{ fontSize: 14, flexShrink: 0 }}>✓</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Story modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStory(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: 'rgba(8,11,24,0.9)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              padding: '0 0 0 0',
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxHeight: '85vh',
                background: 'rgba(15,10,35,0.98)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px 24px 0 0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Modal header */}
              <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 32 }}>{selectedStory.emoji}</span>
                <div className="flex-1">
                  <h2 className="font-extrabold text-lg leading-tight" style={{ color: 'var(--cn-text)' }}>
                    {selectedStory.title}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--cn-muted)' }}>
                    {selectedStory.author} · {selectedStory.region}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStory(null)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                  <X size={16} color="rgba(226,232,240,0.6)" />
                </button>
              </div>

              {/* Modal body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 100px' }}>
                {selectedStory.body.split('\n\n').map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(226,232,240,0.85)' }}>
                    {para}
                  </p>
                ))}
              </div>

              {/* Modal footer */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: 'linear-gradient(to top, rgba(15,10,35,1) 60%, transparent)' }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { markStoryRead(selectedStory.id); setSelectedStory(null) }}
                  className="w-full py-3 rounded-2xl font-bold text-white"
                  style={{
                    background: readStories.has(selectedStory.id)
                      ? 'rgba(124,58,237,0.3)'
                      : 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                    border: readStories.has(selectedStory.id) ? '1px solid rgba(124,58,237,0.5)' : 'none',
                  }}
                >
                  {readStories.has(selectedStory.id)
                    ? (lang === 'hi' ? '✓ पढ़ लिया' : '✓ Read')
                    : (lang === 'hi' ? 'पढ़ लिया ✓' : 'Mark as Read ✓')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
