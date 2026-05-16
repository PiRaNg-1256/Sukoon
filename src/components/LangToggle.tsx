import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X } from 'lucide-react'
import type { Lang } from '../types'

interface LangOption {
  code: Lang
  native: string
  english: string
  flag: string
}

const LANG_OPTIONS: LangOption[] = [
  { code: 'hi', native: 'हिंदी',    english: 'Hindi',   flag: '🇮🇳' },
  { code: 'en', native: 'English',  english: 'English',  flag: '🇬🇧' },
  { code: 'ta', native: 'தமிழ்',   english: 'Tamil',   flag: '🌺' },
  { code: 'te', native: 'తెలుగు',  english: 'Telugu',  flag: '🌸' },
  { code: 'bn', native: 'বাংলা',   english: 'Bengali', flag: '🌼' },
  { code: 'mr', native: 'मराठी',   english: 'Marathi', flag: '🏵️' },
]

interface Props {
  lang: Lang
  setLang: (l: Lang) => void
}

export default function LangToggle({ lang, setLang }: Props) {
  const [open, setOpen] = useState(false)
  const current = LANG_OPTIONS.find(l => l.code === lang) ?? LANG_OPTIONS[0]

  return (
    <>
      {/* Gear button */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '6px 12px',
          cursor: 'pointer',
        }}
      >
        <Settings size={13} color="rgba(226,232,240,0.6)" />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(226,232,240,0.85)' }}>
          {current.native}
        </span>
      </motion.button>

      {/* Settings modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 70,
              background: 'rgba(8,11,24,0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 360,
                background: 'rgba(15,10,35,0.98)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 24, padding: 24,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: 'var(--cn-text)' }}>⚙ Settings</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--cn-muted)' }}>Choose your language</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={16} color="rgba(226,232,240,0.6)" />
                </button>
              </div>

              {/* Language grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {LANG_OPTIONS.map((opt, i) => {
                  const active = lang === opt.code
                  return (
                    <motion.button
                      key={opt.code}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setLang(opt.code); setOpen(false) }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 6, padding: '14px 8px',
                        borderRadius: 14, border: 'none', cursor: 'pointer',
                        background: active ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                        outline: active ? '1.5px solid rgba(124,58,237,0.6)' : '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{opt.flag}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: active ? '#a78bfa' : 'var(--cn-text)' }}>
                        {opt.native}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--cn-muted)', fontWeight: 500 }}>
                        {opt.english}
                      </span>
                      {active && (
                        <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700 }}>✓ Active</span>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Privacy note */}
              <p className="text-[10px] text-center mt-4" style={{ color: 'var(--cn-muted)' }}>
                All data stays on your device. No account needed.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
