import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, MessageCircle, Wind, BookOpen, Phone } from 'lucide-react'
import type { Tr } from '../translations'

const NAV = [
  { path: '/',        Icon: Home,          key: 'home'    },
  { path: '/chat',    Icon: MessageCircle, key: 'chat'    },
  { path: '/breathe', Icon: Wind,          key: 'breathe' },
  { path: '/learn',   Icon: BookOpen,      key: 'learn'   },
  { path: '/help',    Icon: Phone,         key: 'help'    },
] as const

export default function BottomNav({ tr }: { tr: Tr }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex h-16">
      {NAV.map(({ path, Icon, key }) => {
        const active = pathname === path
        return (
          <motion.button
            key={path}
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(path)}
            className="flex flex-col items-center justify-center flex-1 relative gap-0.5"
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 1.5}
              className={active ? 'text-teal' : 'text-muted'}
            />
            {active && (
              <motion.span
                layoutId="nav-label"
                className="text-[10px] font-bold text-teal leading-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {tr(key)}
              </motion.span>
            )}
            {active && (
              <motion.div
                layoutId="nav-dot"
                className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-saffron"
              />
            )}
          </motion.button>
        )
      })}
    </nav>
  )
}
