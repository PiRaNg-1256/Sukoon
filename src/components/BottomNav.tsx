import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, MessageCircle, Phone, BookOpen } from 'lucide-react'
import type { Tr } from '../translations'

const NAV_LEFT = [
  { path: '/',     label: 'home', Icon: Home          },
  { path: '/chat', label: 'chat', Icon: MessageCircle },
] as const

const NAV_RIGHT = [
  { path: '/journal', label: 'journal', Icon: BookOpen },
  { path: '/help',    label: 'help',    Icon: Phone    },
] as const

const HUB_TILES = [
  { path: '/meditate', emoji: '🧘', label: 'Meditate',    disabled: false },
  { path: '/sleep',    emoji: '🌙', label: 'Sleep Story', disabled: true  },
  { path: '/breathe',  emoji: '🌬️', label: 'Breathe',    disabled: false },
  { path: '/ground',   emoji: '🌿', label: 'Grounding',   disabled: false },
  { path: '/badges',   emoji: '🏆', label: 'Badges',      disabled: false },
  { path: '/learn',    emoji: '📚', label: 'Learn',       disabled: false },
] as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NavItem = { path: string; label: string; Icon: React.ComponentType<any> }

function NavBtn({ path, label, Icon, tr, pathname, navigate }: NavItem & { tr: Tr; pathname: string; navigate: (p: string) => void }) {
  const active = pathname === path
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      whileHover={{ y: -2 }}
      onClick={() => navigate(path)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative', gap: 2, paddingTop: 8, paddingBottom: 8 }}
    >
      <Icon
        size={22}
        strokeWidth={active ? 2.5 : 1.5}
        color={active ? '#7c3aed' : 'rgba(226,232,240,0.45)'}
      />
      {active && (
        <motion.span
          layoutId="nav-label"
          style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', lineHeight: 1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {tr(label as Parameters<Tr>[0])}
        </motion.span>
      )}
      {active && (
        <motion.div
          layoutId="nav-dot"
          style={{ position: 'absolute', bottom: 4, width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }}
        />
      )}
    </motion.button>
  )
}

export default function BottomNav({ tr }: { tr: Tr }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [hubOpen, setHubOpen] = useState(false)

  return (
    <>
      {/* Hub overlay */}
      <AnimatePresence>
        {hubOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setHubOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 45,
              background: 'rgba(8,11,24,0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              paddingBottom: 80,
            }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12, padding: 20, width: '100%', maxWidth: 400,
              }}
            >
              {HUB_TILES.map((tile, i) => (
                <motion.button
                  key={tile.path}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                  whileTap={tile.disabled ? {} : { scale: 0.93 }}
                  disabled={tile.disabled}
                  onClick={() => {
                    if (!tile.disabled) { navigate(tile.path); setHubOpen(false) }
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 6, padding: '16px 8px',
                    borderRadius: 16,
                    background: tile.disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: tile.disabled ? 'default' : 'pointer',
                    opacity: tile.disabled ? 0.45 : 1,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{tile.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(226,232,240,0.85)', lineHeight: 1.2 }}>
                    {tile.label}
                  </span>
                  {tile.disabled && (
                    <span style={{ fontSize: 9, color: 'rgba(226,232,240,0.4)', fontWeight: 500 }}>
                      Coming Soon
                    </span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <nav
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(8,11,24,0.92)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', height: 64, alignItems: 'center',
        }}
      >
        {NAV_LEFT.map(item => (
          <NavBtn key={item.path} {...item} tr={tr} pathname={pathname} navigate={navigate} />
        ))}

        {/* Hub FAB */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setHubOpen(o => !o)}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
              boxShadow: hubOpen
                ? '0 0 0 4px rgba(124,58,237,0.4), 0 8px 24px rgba(124,58,237,0.5)'
                : '0 4px 16px rgba(124,58,237,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'box-shadow 0.2s', border: 'none', cursor: 'pointer',
            }}
          >
            <motion.span
              animate={{ rotate: hubOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: 24, color: 'white', display: 'block', lineHeight: 1 }}
            >
              ⊕
            </motion.span>
          </motion.button>
        </div>

        {NAV_RIGHT.map(item => (
          <NavBtn key={item.path} {...item} tr={tr} pathname={pathname} navigate={navigate} />
        ))}
      </nav>
    </>
  )
}
