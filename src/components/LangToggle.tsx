import { motion } from 'framer-motion'
import type { Lang, Tr } from '../translations'

interface Props {
  lang: Lang
  setLang: (l: Lang) => void
  tr: Tr
}

export default function LangToggle({ lang, setLang, tr }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
      className="bg-white/80 backdrop-blur rounded-full px-3 py-1 text-sm font-bold text-teal shadow-soft border border-teal/20"
    >
      {tr('lang_toggle')}
    </motion.button>
  )
}
