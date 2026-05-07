import { motion } from 'framer-motion'
import type { Tr } from '../translations'

interface Props {
  score: number
  tr: Tr
}

export default function CrisisCard({ score, tr }: Props) {
  if (score < 8) return null
  const full = score >= 15

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className={`fixed bottom-28 left-4 right-4 z-30 rounded-2xl p-4 shadow-lg ${
        full ? 'bg-danger/10 border border-danger/30' : 'bg-teal/10 border border-teal/20'
      }`}
    >
      <p className={`font-bold mb-1 ${full ? 'text-danger' : 'text-teal'}`}>
        {full ? tr('crisis_full') : tr('you_matter')}
      </p>
      <p className="text-sm text-gray-700 mb-3">
        {tr('crisis_soft')}
      </p>
      <a
        href="tel:9152987821"
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white font-semibold text-sm ${
          full ? 'bg-danger' : 'bg-teal'
        }`}
      >
        📞 iCall — 9152987821
      </a>
      {full && (
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <p>• Vandrevala: 1860-2662-345</p>
          <p>• NIMHANS: 080-46110007</p>
          <p>• Aasra: 9820466627</p>
        </div>
      )}
    </motion.div>
  )
}
