import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import { getBadgesWithStatus } from '../lib/badges'
import type { Lang } from '../types'
import type { Tr } from '../translations'

interface Props { lang: Lang; tr: Tr }

export default function Badges({ lang, tr }: Props) {
  const badges = getBadgesWithStatus()
  const [celebrating, setCelebrating] = useState<string | null>(null)

  const unlocked = badges.filter(b => b.unlocked).length

  return (
    <PageTransition>
      <div className="px-4 pt-8 pb-24">
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--cn-text)' }}>
          🏆 {lang === 'hi' ? 'बैज' : 'Badges'}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--cn-muted)' }}>
          {unlocked} / {badges.length} {lang === 'hi' ? 'अनलॉक' : 'unlocked'}
        </p>

        {/* Progress bar */}
        <div className="mb-6 rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlocked / badges.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #f59e0b)', borderRadius: 9999 }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={badge.unlocked ? { scale: 0.95 } : {}}
              onClick={() => badge.unlocked && setCelebrating(badge.id)}
              style={{
                padding: 20,
                borderRadius: 16,
                textAlign: 'center',
                cursor: badge.unlocked ? 'pointer' : 'default',
                background: badge.unlocked ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.04)',
                border: badge.unlocked ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.06)',
                filter: badge.unlocked ? 'none' : 'grayscale(1)',
                opacity: badge.unlocked ? 1 : 0.45,
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>{badge.emoji}</span>
              <p className="font-bold text-sm" style={{ color: 'var(--cn-text)' }}>{badge.name}</p>
              <p className="text-xs mt-1 leading-tight" style={{ color: 'var(--cn-muted)' }}>{badge.description}</p>
              {!badge.unlocked && (
                <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 14 }}>🔒</div>
              )}
              {badge.unlocked && badge.unlockedAt && (
                <p className="text-[10px] mt-2" style={{ color: 'rgba(124,58,237,0.7)' }}>
                  {new Date(badge.unlockedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Celebration overlay */}
        <AnimatePresence>
          {celebrating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCelebrating(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 60,
                background: 'rgba(8,11,24,0.85)',
                backdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {(() => {
                const b = badges.find(x => x.id === celebrating)!
                return (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    style={{ textAlign: 'center', padding: 40 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.2, 1.2, 1.15, 1.15, 1] }}
                      transition={{ duration: 0.6 }}
                      style={{ fontSize: 80, display: 'block', marginBottom: 16 }}
                    >
                      {b.emoji}
                    </motion.div>
                    <h2 className="text-3xl font-extrabold mb-2" style={{ color: '#f59e0b' }}>{b.name}</h2>
                    <p style={{ color: 'var(--cn-muted)', fontSize: 16, marginBottom: 32 }}>{b.description}</p>
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setCelebrating(null)}
                      className="font-semibold px-8 py-3 rounded-2xl text-white"
                      style={{ background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)' }}
                    >
                      {lang === 'hi' ? 'बंद करें' : 'Close'}
                    </motion.button>
                  </motion.div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
