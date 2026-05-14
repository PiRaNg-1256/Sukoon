import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import type { Lang } from '../types'
import type { Tr } from '../translations'

const HELPLINES = [
  { name: 'iCall (TISS)',          number: '9152987821',  display: '9152987821',    hours: 'Mon–Sat 8am–10pm' },
  { name: 'Vandrevala Foundation', number: '18602662345', display: '1860-2662-345', hours: '24/7'             },
  { name: 'NIMHANS',               number: '08046110007', display: '080-46110007',  hours: '24/7'             },
  { name: 'Snehi',                 number: '04424640050', display: '044-24640050',  hours: '8am–10pm'         },
  { name: 'Aasra',                 number: '9820466627',  display: '9820466627',    hours: '24/7'             },
] as const

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 16,
  padding: 16,
}

interface Props { lang: Lang; tr: Tr }

export default function Help({ tr }: Props) {
  return (
    <PageTransition>
      <div className="px-4 pt-8 pb-24">
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--cn-text)' }}>{tr('help_title')}</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--cn-muted)' }}>{tr('help_tagline')}</p>

        {/* SOS card */}
        <div className="sos-pulse rounded-2xl p-4 mb-6 flex items-center gap-4" style={{ background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.5)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: '#ef4444' }}>
            <Phone size={22} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold" style={{ color: '#ef4444' }}>{tr('help_sos')}</p>
            <p className="text-sm" style={{ color: 'var(--cn-muted)' }}>iCall: 9152987821</p>
          </div>
          <a href="tel:9152987821" className="font-bold px-4 py-2 rounded-xl text-sm shrink-0 text-white" style={{ background: '#ef4444' }}>
            {tr('help_call')}
          </a>
        </div>

        {/* Helpline list */}
        <div className="space-y-3">
          {HELPLINES.map((h, i) => (
            <motion.div
              key={h.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={card}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(124,58,237,0.15)' }}>
                <Phone size={18} color="#7c3aed" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: 'var(--cn-text)' }}>{h.name}</p>
                <p className="text-xs" style={{ color: 'var(--cn-muted)' }}>{h.display} · {h.hours}</p>
              </div>
              <motion.a
                whileTap={{ scale: 0.93 }}
                href={`tel:${h.number}`}
                className="font-semibold px-3 py-2 rounded-xl text-xs shrink-0 text-white"
                style={{ background: '#7c3aed' }}
              >
                {tr('help_call')}
              </motion.a>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs mt-8 px-4 leading-relaxed" style={{ color: 'var(--cn-muted)' }}>
          {tr('privacy_note')}
        </p>
      </div>
    </PageTransition>
  )
}
