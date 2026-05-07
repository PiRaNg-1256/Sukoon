import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import type { Lang } from '../types'
import type { Tr } from '../translations'

const HELPLINES = [
  { name: 'iCall (TISS)',          number: '9152987821',  display: '9152987821',   hours: 'Mon–Sat 8am–10pm' },
  { name: 'Vandrevala Foundation', number: '18602662345', display: '1860-2662-345', hours: '24/7'            },
  { name: 'NIMHANS',               number: '08046110007', display: '080-46110007',  hours: '24/7'            },
  { name: 'Snehi',                 number: '04424640050', display: '044-24640050',  hours: '8am–10pm'        },
  { name: 'Aasra',                 number: '9820466627',  display: '9820466627',   hours: '24/7'            },
] as const

interface Props { lang: Lang; tr: Tr }

export default function Help({ tr }: Props) {
  return (
    <PageTransition>
      <div className="px-4 pt-8">
        <h1 className="text-2xl font-extrabold text-dark-indigo mb-1">{tr('help_title')}</h1>
        <p className="text-muted text-sm mb-6">{tr('help_tagline')}</p>

        {/* SOS card */}
        <div className="sos-pulse bg-danger/10 border-2 border-danger rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-danger rounded-full flex items-center justify-center shrink-0">
            <Phone size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-danger">{tr('help_sos')}</p>
            <p className="text-sm text-gray-700">iCall: 9152987821</p>
          </div>
          <a
            href="tel:9152987821"
            className="bg-danger text-white font-bold px-4 py-2 rounded-xl text-sm shrink-0"
          >
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
              className="bg-white rounded-2xl p-4 shadow-soft flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center shrink-0">
                <Phone size={18} className="text-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark-indigo text-sm">{h.name}</p>
                <p className="text-muted text-xs">{h.display} · {h.hours}</p>
              </div>
              <motion.a
                whileTap={{ scale: 0.93 }}
                whileHover={{ scale: 1.05, backgroundColor: '#155d90' }}
                href={`tel:${h.number}`}
                className="bg-teal text-white font-semibold px-3 py-2 rounded-xl text-xs shrink-0"
              >
                {tr('help_call')}
              </motion.a>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-muted mt-8 px-4 leading-relaxed">
          {tr('privacy_note')}
        </p>
      </div>
    </PageTransition>
  )
}
