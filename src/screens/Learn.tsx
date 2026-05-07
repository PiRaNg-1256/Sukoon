import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import type { Lang } from '../types'
import type { Tr, TranslationKey } from '../translations'

interface CardContent {
  feeling: string[]
  notAlone: string
  helps: string[]
}

interface LearnCard {
  id: string
  emoji: string
  titleKey: TranslationKey
  color: string
  content: { hi: CardContent; en: CardContent }
}

const CARDS: LearnCard[] = [
  {
    id: 'depression', emoji: '🌧️', titleKey: 'learn_depression', color: '#EBF4FF',
    content: {
      hi: {
        feeling: ['हर वक्त थकान और खालीपन महसूस करना', 'जो चीज़ें पहले अच्छी लगती थीं वो अब बेकार लगती हैं', 'नींद और खाने में परेशानी', 'खुद को बेकार समझना'],
        notAlone: 'भारत में करोड़ों लोग उदासी से गुज़रते हैं। यह कमज़ोरी नहीं है — यह एक असली बीमारी है जिसका इलाज होता है।',
        helps: ['किसी भरोसेमंद से बात करना', 'रोज़ थोड़ा चलना-फिरना', 'सोने का वक्त नियमित रखना', 'iCall से बात करना: 9152987821'],
      },
      en: {
        feeling: ['Constant tiredness and emptiness', 'Things that used to feel good feel meaningless', 'Trouble sleeping or eating', 'Feeling worthless'],
        notAlone: 'Millions in India go through depression. It is not weakness — it is a real condition that can be treated.',
        helps: ['Talk to someone you trust', 'Light daily movement', 'Keep a regular sleep schedule', 'Call iCall: 9152987821'],
      },
    },
  },
  {
    id: 'anxiety', emoji: '💨', titleKey: 'learn_anxiety', color: '#FFF8EB',
    content: {
      hi: {
        feeling: ['दिल तेज़ धड़कना, सांस तेज़ होना', 'बुरी बातों का डर लगातार रहना', 'पेट में गड़बड़ी या सिरदर्द', 'हर काम से पहले बहुत ज़्यादा सोचना'],
        notAlone: 'घबराहट बहुत आम है। सही तरीकों से इसे काफी कम किया जा सकता है।',
        helps: ['गहरी सांस लेने का अभ्यास', 'एक काम एक वक्त पर करना', 'कैफीन कम करना', 'सांस वाला अभ्यास रोज़ करना'],
      },
      en: {
        feeling: ['Racing heart, fast breathing', 'Constant fear of bad things happening', 'Stomach troubles or headaches', 'Overthinking before every task'],
        notAlone: 'Anxiety is very common. With the right tools it can be greatly reduced.',
        helps: ['Deep breathing practice', 'One task at a time', 'Reduce caffeine', 'Daily breathing exercises'],
      },
    },
  },
  {
    id: 'trauma', emoji: '🩹', titleKey: 'learn_trauma', color: '#FFF0F0',
    content: {
      hi: {
        feeling: ['बुरी यादें बार-बार आना', 'अचानक डर लगना या चौंक जाना', 'लोगों से दूरी बनाना', 'अपने आप को सुरक्षित न समझना'],
        notAlone: 'जो हुआ वो तुम्हारी गलती नहीं थी। ज़ख्म ठीक होते हैं — सही मदद से।',
        helps: ['सुरक्षित जगहों पर जाना', 'एक भरोसेमंद इंसान से बात करना', 'रोज़ छोटी-छोटी खुशियाँ ढूँढना', 'किसी काउंसलर से मिलना'],
      },
      en: {
        feeling: ['Painful memories returning repeatedly', 'Sudden fear or being easily startled', 'Pulling away from people', 'Feeling unsafe'],
        notAlone: 'What happened was not your fault. Wounds heal — with the right support.',
        helps: ['Spend time in safe places', 'Talk to one trusted person', 'Find small daily joys', 'Speak with a counselor'],
      },
    },
  },
  {
    id: 'loneliness', emoji: '🕊️', titleKey: 'learn_loneliness', color: '#F0FFF4',
    content: {
      hi: {
        feeling: ['भीड़ में भी अकेला महसूस करना', 'किसी को समझ न आना', 'ऑनलाइन रहना पर दिल खाली रहना', 'खुद को छोटा समझना'],
        notAlone: 'अकेलापन महसूस करना बहुत तकलीफदेह है — पर तुम सच में अकेले नहीं हो।',
        helps: ['एक छोटी सी बात किसी से करना', 'कोई हॉबी शुरू करना', 'Sukoon पर मनु से बात करना', 'समूह या क्लब में जाना'],
      },
      en: {
        feeling: ['Feeling alone even in a crowd', 'Feeling misunderstood', 'Being online but feeling empty', 'Feeling small'],
        notAlone: 'Loneliness is deeply painful — but you are truly not alone.',
        helps: ['Have one small conversation', 'Start a hobby', 'Talk to Manu on Sukoon', 'Join a group or club'],
      },
    },
  },
]

interface Props { lang: Lang; tr: Tr }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="font-bold text-dark-indigo mb-2">{title}</h3>
      {children}
    </div>
  )
}

export default function Learn({ lang, tr }: Props) {
  const [selected, setSelected] = useState<LearnCard | null>(null)

  return (
    <PageTransition>
      <div className="px-4 pt-8">
        <h1 className="text-2xl font-extrabold text-dark-indigo mb-6">{tr('learn_title')}</h1>

        <div className="grid grid-cols-2 gap-4">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.id}
              layoutId={`card-${card.id}`}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.12)' }}
              onClick={() => setSelected(card)}
              className="rounded-2xl p-4 shadow-soft cursor-pointer"
              style={{ backgroundColor: card.color }}
            >
              <span className="text-4xl block mb-2">{card.emoji}</span>
              <p className="font-bold text-dark-indigo">{tr(card.titleKey)}</p>
              <p className="text-xs text-muted mt-1 line-clamp-2">
                {lang === 'hi'
                  ? card.content.hi.feeling[0]
                  : card.content.en.feeling[0]}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-50"
                onClick={() => setSelected(null)}
              />
              <motion.div
                layoutId={`card-${selected.id}`}
                className="fixed inset-x-4 top-16 bottom-20 z-50 rounded-2xl overflow-y-auto"
                style={{ backgroundColor: selected.color }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-5xl block mb-2">{selected.emoji}</span>
                      <h2 className="text-2xl font-extrabold text-dark-indigo">{tr(selected.titleKey)}</h2>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setSelected(null)}
                      className="w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-soft mt-1 shrink-0"
                    >
                      <X size={18} className="text-dark-indigo" />
                    </motion.button>
                  </div>

                  {(() => {
                    const c = lang === 'hi' ? selected.content.hi : selected.content.en
                    const feelingTitle = lang === 'hi' ? 'ऐसा महसूस होता है…' : 'What this feels like…'
                    const notAloneTitle = lang === 'hi' ? 'तुम अकेले नहीं हो' : 'You are not alone'
                    const helpsTitle = lang === 'hi' ? 'क्या मदद करता है' : 'What helps'
                    return (
                      <>
                        <Section title={feelingTitle}>
                          <ul className="space-y-1">
                            {c.feeling.map((f, i) => (
                              <li key={i} className="text-sm text-gray-700 flex gap-2">
                                <span className="text-teal shrink-0">•</span> {f}
                              </li>
                            ))}
                          </ul>
                        </Section>
                        <Section title={notAloneTitle}>
                          <p className="text-sm text-gray-700">{c.notAlone}</p>
                        </Section>
                        <Section title={helpsTitle}>
                          <ul className="space-y-1">
                            {c.helps.map((h, i) => (
                              <li key={i} className="text-sm text-gray-700 flex gap-2">
                                <span className="text-saffron shrink-0">✓</span> {h}
                              </li>
                            ))}
                          </ul>
                        </Section>
                      </>
                    )
                  })()}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
