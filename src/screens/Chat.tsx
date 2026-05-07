import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie from 'lottie-react'
import { Send } from 'lucide-react'
import loadingDotsData from '../assets/lottie/loading-dots.json'
import PageTransition from '../components/PageTransition'
import ManuOrb from '../components/ManuOrb'
import CrisisCard from '../components/CrisisCard'
import { storage } from '../lib/storage'
import { sendToGroq } from '../services/groq'
import { scoreMessage } from '../lib/phq9'
import type { ChatMessage, Lang } from '../types'
import type { Tr } from '../translations'

interface Props { lang: Lang; tr: Tr; isOnline: boolean }

export default function Chat({ tr, isOnline }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = storage.getChatHistory()
    if (saved.length === 0) {
      const greeting: ChatMessage = {
        role: 'assistant',
        content: tr('chat_greeting'),
        timestamp: Date.now(),
      }
      storage.addChatMessage(greeting)
      return [greeting]
    }
    return saved
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [phqScore, setPhqScore] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading || !isOnline) return

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    storage.addChatMessage(userMsg)
    setInput('')

    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const delta = scoreMessage(text)
    setPhqScore(prev => prev + delta)

    setLoading(true)
    try {
      const reply = await sendToGroq(newMessages)
      const assistantMsg: ChatMessage = { role: 'assistant', content: reply, timestamp: Date.now() }
      setMessages(prev => [...prev, assistantMsg])
      storage.addChatMessage(assistantMsg)
    } catch {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'माफ करना, कुछ गड़बड़ हो गई। थोड़ी देर बाद फिर कोशिश करो।',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-8 pb-3 sticky top-0 bg-cream z-10">
        <ManuOrb size={44} pulse={loading} />
        <h1 className="font-extrabold text-lg text-dark-indigo">{tr('chat_title')}</h1>
      </div>

      {/* Messages */}
      <div className="px-4 pt-2 space-y-3" style={{ paddingBottom: '100px' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-saffron text-white rounded-br-sm font-medium'
                    : 'bg-white shadow-soft text-text-main rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white shadow-soft rounded-2xl rounded-bl-sm px-4 py-3">
              <Lottie animationData={loadingDotsData} loop style={{ width: 50, height: 20 }} />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Crisis card */}
      <AnimatePresence>
        {phqScore >= 8 && <CrisisCard score={phqScore} tr={tr} />}
      </AnimatePresence>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-cream/90 backdrop-blur-sm">
        <div className="flex gap-2 items-end bg-white rounded-2xl shadow-soft px-3 py-2 border border-gray-100">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder={tr('chat_placeholder')}
            rows={1}
            disabled={!isOnline}
            className="flex-1 resize-none bg-transparent outline-none text-sm text-text-main placeholder:text-muted font-nunito py-1"
          />
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={input.trim() ? { scale: 1.08 } : {}}
            onClick={send}
            disabled={!input.trim() || loading || !isOnline}
            className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center shrink-0 disabled:opacity-40"
          >
            <Send size={16} className="text-white" />
          </motion.button>
        </div>
      </div>
    </PageTransition>
  )
}
