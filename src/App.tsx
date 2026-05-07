import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import BottomNav from './components/BottomNav'
import LangToggle from './components/LangToggle'
import Home from './screens/Home'
import Chat from './screens/Chat'
import Breathe from './screens/Breathe'
import Learn from './screens/Learn'
import Help from './screens/Help'
import Splash from './screens/Splash'
import { storage } from './lib/storage'
import { t } from './translations'
import type { Lang } from './types'
import type { Tr } from './translations'

function AppShell() {
  const location = useLocation()
  const [lang, setLangState] = useState<Lang>(() => storage.getLang())
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online',  on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const setLang = (l: Lang) => { storage.setLang(l); setLangState(l) }
  const tr: Tr = key => t[lang][key] as string

  return (
    <div className="min-h-screen bg-cream font-nunito relative overflow-x-hidden">
      {/* Ambient gradient background */}
      <div className="bg-gradient-anim fixed inset-0 -z-10 pointer-events-none" />

      {/* Offline banner — only on /chat */}
      {!isOnline && location.pathname === '/chat' && (
        <div className="fixed top-0 inset-x-0 z-50 bg-danger text-white text-center py-2 text-sm font-semibold">
          {tr('chat_offline')}
        </div>
      )}

      {/* Language toggle */}
      <div className="fixed top-4 right-4 z-40">
        <LangToggle lang={lang} setLang={setLang} tr={tr} />
      </div>

      {/* Animated routes */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"        element={<Home    lang={lang} tr={tr} />} />
          <Route path="/chat"    element={<Chat    lang={lang} tr={tr} isOnline={isOnline} />} />
          <Route path="/breathe" element={<Breathe lang={lang} tr={tr} />} />
          <Route path="/learn"   element={<Learn   lang={lang} tr={tr} />} />
          <Route path="/help"    element={<Help    lang={lang} tr={tr} />} />
        </Routes>
      </AnimatePresence>

      {/* Bottom navigation */}
      <BottomNav tr={tr} />
    </div>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => !storage.hasSplashSeen())

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        {showSplash
          ? <Splash key="splash" onDone={() => setShowSplash(false)} />
          : <AppShell key="shell" />}
      </AnimatePresence>
    </BrowserRouter>
  )
}
