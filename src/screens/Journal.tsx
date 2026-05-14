import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot } from 'recharts'
import PageTransition from '../components/PageTransition'
import { storage } from '../lib/storage'
import { checkAndUnlockBadges } from '../lib/badges'
import type { Lang, MoodEntry } from '../types'
import type { Tr } from '../translations'

const MOOD_SCORE: Record<string, number> = { sad: 1, anxious: 2, neutral: 3, good: 4, happy: 5 }
const MOOD_EMOJI: Record<string, string> = { sad: '😔', anxious: '😰', neutral: '😶', good: '🙂', happy: '😄' }

interface Props { lang: Lang; tr: Tr }

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
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

export default function Journal({ lang, tr }: Props) {
  const [log, setLog] = useState<MoodEntry[]>(() => [...storage.getMoodLog()].reverse())
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  const streak = storage.getStreak()

  const chartData = useMemo(() => {
    const today = new Date()
    const days: { date: string; score: number | null }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const entry = log.find(e => e.date === dateStr)
      days.push({ date: formatDate(dateStr), score: entry ? MOOD_SCORE[entry.mood] : null })
    }
    return days.filter(d => d.score !== null)
  }, [log])

  const saveNote = (date: string) => {
    storage.updateMoodNote(date, noteText)
    setLog([...storage.getMoodLog()].reverse())
    setEditingDate(null)
    const hasNote = noteText.trim().length > 0
    if (hasNote) {
      checkAndUnlockBadges({
        moodLog: storage.getMoodLog(),
        streak: storage.getStreak(),
        breatheCount: storage.getBreatheCount(),
        meditateCount: storage.getMeditateCount(),
        groundCount: storage.getGroundCount(),
        chatCount: storage.getChatCount(),
        hasJournalNote: true,
      })
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <PageTransition>
      <div className="px-4 pt-8 pb-24">
        <h1 className="text-2xl font-extrabold mb-4" style={{ color: 'var(--cn-text)' }}>
          📝 {lang === 'hi' ? 'मूड डायरी' : 'Mood Journal'}
        </h1>

        {/* Streak card */}
        <div style={{ ...card, display: 'flex', gap: 24, justifyContent: 'center', textAlign: 'center' }}>
          <div>
            <p className="text-3xl font-extrabold" style={{ color: '#f59e0b' }}>{streak.current}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--cn-muted)' }}>
              {lang === 'hi' ? 'मौजूदा streak' : 'Current streak'}
            </p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div>
            <p className="text-3xl font-extrabold" style={{ color: '#7c3aed' }}>{streak.longest}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--cn-muted)' }}>
              {lang === 'hi' ? 'सबसे लंबी streak' : 'Longest streak'}
            </p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div style={{ ...card }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--cn-muted)' }}>
              {lang === 'hi' ? 'पिछले 30 दिन' : 'Last 30 days'}
            </p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <XAxis dataKey="date" tick={{ fill: 'rgba(226,232,240,0.35)', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={[1, 5]} tickCount={5} tick={{ fill: 'rgba(226,232,240,0.35)', fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(20,15,40,0.95)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
                  labelStyle={{ color: 'rgba(226,232,240,0.6)' }}
                  formatter={(v) => { const n = Number(v); return [['😔','😰','😶','🙂','😄'][n - 1] ?? '', ''] }}
                />
                <Line
                  type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} dot={false}
                  activeDot={<Dot r={5} fill="#7c3aed" stroke="rgba(124,58,237,0.4)" strokeWidth={6} />}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Log list */}
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--cn-muted)' }}>
          {lang === 'hi' ? 'इतिहास' : 'History'}
        </p>

        {log.length === 0 && (
          <p className="text-center py-8" style={{ color: 'var(--cn-muted)' }}>
            {lang === 'hi' ? 'अभी तक कोई मूड नहीं लिखा' : 'No moods logged yet'}
          </p>
        )}

        {log.map(entry => (
          <motion.div
            key={entry.date + entry.timestamp}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ ...card, cursor: entry.date === todayStr ? 'pointer' : 'default' }}
            onClick={() => {
              if (entry.date === todayStr) {
                setEditingDate(entry.date === editingDate ? null : entry.date)
                setNoteText(entry.note ?? '')
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 28 }}>{MOOD_EMOJI[entry.mood]}</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--cn-text)' }}>
                    {formatDate(entry.date)}
                  </p>
                  {entry.note && (
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--cn-muted)' }}>
                      {entry.note}
                    </p>
                  )}
                </div>
              </div>
              {entry.date === todayStr && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>
                  {lang === 'hi' ? 'नोट जोड़ें' : 'Add note'}
                </span>
              )}
            </div>

            {/* Inline note editor for today */}
            {editingDate === entry.date && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3"
                onClick={e => e.stopPropagation()}
              >
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder={lang === 'hi' ? 'आज के बारे में कुछ लिखो…' : 'Write about today…'}
                  rows={3}
                  className="w-full resize-none text-sm rounded-xl p-3 outline-none font-nunito"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--cn-text)' }}
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <button
                    onClick={() => setEditingDate(null)}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ color: 'var(--cn-muted)', background: 'rgba(255,255,255,0.05)' }}
                  >
                    {lang === 'hi' ? 'रद्द' : 'Cancel'}
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => saveNote(entry.date)}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
                    style={{ background: '#7c3aed' }}
                  >
                    {lang === 'hi' ? 'सेव करें' : 'Save'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </PageTransition>
  )
}
