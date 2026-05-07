# Sukoon UI Makeover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply premium-website psychology (halo effect, cognitive fluency, micro interactions) to Sukoon — adding a calligraphic logo, redesigned Manu orb, animated lotus splash screen, phase-aware Breathe screen, and hover/tap micro interactions across all screens.

**Architecture:** New `Splash.tsx` screen gates app entry via a localStorage flag; `App.tsx` wraps both splash and shell in `AnimatePresence`. `ManuOrb.tsx` is fully rewritten with SVG face features and a rich gradient. Phase-aware colors in `Breathe.tsx` are driven by a `PHASE_COLORS` map. Micro interactions are Framer Motion `whileHover`/`whileTap` additions to existing buttons and cards.

**Tech Stack:** React 18, TypeScript, Framer Motion v11, Tailwind CSS v3, Lucide React, Google Fonts (Dancing Script), Vite PWA

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `public/splash.mp4` | Copy | Lotus bloom video asset |
| `index.html` | Modify | Add Dancing Script font link |
| `tailwind.config.js` | Modify | Add `dancing` font family token |
| `src/lib/storage.ts` | Modify | Add `sukoon_seen_splash` key |
| `src/index.css` | Modify | Upgrade pulse-glow animation |
| `src/components/Logo.tsx` | Create | Calligraphic logo with SVG diya |
| `src/components/ManuOrb.tsx` | Rewrite | Rich gradient orb with SVG face |
| `src/screens/Splash.tsx` | Create | Video splash with auto-transition |
| `src/App.tsx` | Modify | Splash routing via AnimatePresence |
| `src/screens/Home.tsx` | Modify | Hero upgrades, hover states |
| `src/screens/Breathe.tsx` | Modify | Phase colors, SVG ring timer |
| `src/components/PageTransition.tsx` | Modify | Slide-up + fade transition |
| `src/components/BottomNav.tsx` | Modify | Icon hover micro interactions |
| `src/screens/Learn.tsx` | Modify | Card hover lift |
| `src/screens/Help.tsx` | Modify | Button hover states |
| `src/screens/Chat.tsx` | Modify | Send button hover |
| `scripts/gen-icons.py` | Modify | New indigo+flame icon design |

---

## Task 1: Assets + Foundation

**Files:**
- Copy: `public/splash.mp4`
- Modify: `index.html`
- Modify: `tailwind.config.js`
- Modify: `src/lib/storage.ts`
- Modify: `src/index.css`

- [ ] **Step 1: Copy video asset**

```bash
cp "D:\Sukoon\Lotus_Bloom_Camera_A_person_walks_through_a_bustling_city_street_at_Q42kRGe2.mp4" "D:\Sukoon\public\splash.mp4"
```

Verify: `ls public/splash.mp4` exists.

- [ ] **Step 2: Add Dancing Script font to index.html**

Open `index.html`. The `<head>` currently has two Google Fonts `<link>` tags (Nunito + Noto Sans Devanagari). Add Dancing Script after them:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
```

Replace the existing font link tags (lines that reference fonts.googleapis.com) with the combined link above.

- [ ] **Step 3: Add dancing font token to tailwind.config.js**

Current `fontFamily` in `tailwind.config.js`:
```js
fontFamily: {
  nunito: ['Nunito', 'Noto Sans Devanagari', 'sans-serif'],
},
```

Replace with:
```js
fontFamily: {
  nunito: ['Nunito', 'Noto Sans Devanagari', 'sans-serif'],
  dancing: ['Dancing Script', 'cursive'],
},
```

- [ ] **Step 4: Add splash key to storage.ts**

Open `src/lib/storage.ts`. Find the `KEYS` object. Add:
```ts
  splash: 'sukoon_seen_splash',
```

Then add two methods to the `storage` export object:
```ts
  hasSplashSeen: (): boolean => !!localStorage.getItem(KEYS.splash),
  markSplashSeen: (): void => { try { localStorage.setItem(KEYS.splash, '1') } catch { /* ignore */ } },
```

- [ ] **Step 5: Upgrade pulse-glow in index.css**

Find the `@keyframes pulse-glow` block in `src/index.css`. Replace it:

```css
@keyframes pulse-glow {
  0%, 100% {
    box-shadow:
      0 0 0 3px rgba(244, 165, 53, 0.2),
      0 8px 24px rgba(27, 108, 168, 0.3);
  }
  50% {
    box-shadow:
      0 0 0 5px rgba(244, 165, 53, 0.4),
      0 8px 40px rgba(27, 108, 168, 0.6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .manu-pulse { animation: none; }
  .bg-gradient-anim { animation: none; }
  .sos-pulse { animation: none; }
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add public/splash.mp4 index.html tailwind.config.js src/lib/storage.ts src/index.css
git commit -m "feat: add splash video, Dancing Script font, splash storage key, upgraded pulse-glow"
```

---

## Task 2: Logo Component

**Files:**
- Create: `src/components/Logo.tsx`

- [ ] **Step 1: Create Logo.tsx**

```tsx
interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: 'dark' | 'white'
}

const SIZE_MAP = {
  sm: { text: 'text-2xl', flame: 18 },
  md: { text: 'text-3xl', flame: 22 },
  lg: { text: 'text-5xl', flame: 32 },
}

export default function Logo({ size = 'md', color = 'dark' }: Props) {
  const { text, flame } = SIZE_MAP[size]
  const textColor = color === 'white' ? 'text-white' : 'text-dark-indigo'

  return (
    <div className="flex items-center gap-2 select-none">
      {/* SVG diya flame */}
      <svg
        width={flame}
        height={Math.round(flame * 1.3)}
        viewBox="0 0 20 26"
        fill="none"
        aria-hidden="true"
      >
        {/* outer flame */}
        <path
          d="M10 24C6 24 3 21 3 17C3 12 7 9 10 2C13 9 17 12 17 17C17 21 14 24 10 24Z"
          fill="#F4A535"
        />
        {/* inner highlight */}
        <ellipse cx="10" cy="17" rx="3" ry="4.5" fill="rgba(255,255,200,0.45)" />
        {/* wick base */}
        <ellipse cx="10" cy="24" rx="4" ry="1.2" fill="rgba(244,165,53,0.3)" />
      </svg>

      {/* calligraphic text */}
      <span className={`font-dancing font-bold leading-none ${text} ${textColor}`}>
        Sukoon
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Start dev server (`npm run dev`), open `http://localhost:5173`. Temporarily add `<Logo />` to `src/App.tsx` return (remove after checking). Confirm Dancing Script renders, diya flame is visible.

Remove the temp import after verifying.

- [ ] **Step 3: Commit**

```bash
git add src/components/Logo.tsx
git commit -m "feat: calligraphic Logo component with SVG diya flame"
```

---

## Task 3: Manu Orb Redesign

**Files:**
- Modify: `src/components/ManuOrb.tsx` (full rewrite)

- [ ] **Step 1: Rewrite ManuOrb.tsx**

Replace the entire file content:

```tsx
import { motion } from 'framer-motion'
import type { Mood } from '../types'

interface Props {
  mood?: Mood | null
  size?: number
  pulse?: boolean
}

type FaceConfig = {
  eyeScaleY: number
  browRotateLeft: number   // degrees, positive = inner-side down (sad/anxious)
  browRotateRight: number  // mirror of left
  mouthPath: string        // SVG path d= relative to 100x100 viewBox
}

const FACES: Record<string, FaceConfig> = {
  happy:   { eyeScaleY: 1.0, browRotateLeft: -8,  browRotateRight: 8,   mouthPath: 'M 30 58 Q 50 72 70 58' },
  good:    { eyeScaleY: 1.0, browRotateLeft: -5,  browRotateRight: 5,   mouthPath: 'M 32 58 Q 50 68 68 58' },
  neutral: { eyeScaleY: 0.9, browRotateLeft: 0,   browRotateRight: 0,   mouthPath: 'M 33 60 Q 50 62 67 60' },
  anxious: { eyeScaleY: 1.2, browRotateLeft: 12,  browRotateRight: -12, mouthPath: 'M 33 62 Q 50 56 67 62' },
  sad:     { eyeScaleY: 0.8, browRotateLeft: 8,   browRotateRight: -8,  mouthPath: 'M 33 63 Q 50 55 67 63' },
  default: { eyeScaleY: 1.0, browRotateLeft: 0,   browRotateRight: 0,   mouthPath: 'M 33 60 Q 50 62 67 60' },
}

export default function ManuOrb({ mood, size = 100, pulse = true }: Props) {
  const face = FACES[mood ?? 'default'] ?? FACES.default

  return (
    <motion.div
      whileTap={{ scale: 0.93 }}
      className={pulse ? 'manu-pulse' : ''}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #2C3E7A 0%, #1B6CA8 45%, #0D4F8A 100%)',
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Glassy shine highlight */}
      <div
        style={{
          position: 'absolute',
          width: size * 0.22,
          height: size * 0.13,
          borderRadius: '50%',
          background: 'white',
          opacity: 0.35,
          top: size * 0.18,
          left: size * 0.24,
          filter: 'blur(3px)',
          pointerEvents: 'none',
        }}
      />

      {/* SVG face — renders on 100×100 viewBox, scaled to size */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0 }}
        overflow="visible"
      >
        {/* Left eyebrow */}
        <motion.line
          x1="28" y1="30" x2="42" y2="28"
          stroke="white" strokeWidth="2.5" strokeLinecap="round"
          animate={{ rotate: face.browRotateLeft }}
          style={{ transformOrigin: '35px 29px' }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />
        {/* Right eyebrow */}
        <motion.line
          x1="58" y1="28" x2="72" y2="30"
          stroke="white" strokeWidth="2.5" strokeLinecap="round"
          animate={{ rotate: face.browRotateRight }}
          style={{ transformOrigin: '65px 29px' }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />

        {/* Left eye — teardrop via ellipse + scaleY */}
        <motion.ellipse
          cx="36" cy="44" rx="5" ry="6.5"
          fill="white"
          animate={{ scaleY: face.eyeScaleY }}
          style={{ transformOrigin: '36px 44px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        {/* Left pupil */}
        <motion.ellipse
          cx="37" cy="45" rx="2" ry="2.5"
          fill="#0D4F8A"
          animate={{ scaleY: face.eyeScaleY }}
          style={{ transformOrigin: '37px 45px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />

        {/* Right eye */}
        <motion.ellipse
          cx="64" cy="44" rx="5" ry="6.5"
          fill="white"
          animate={{ scaleY: face.eyeScaleY }}
          style={{ transformOrigin: '64px 44px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        {/* Right pupil */}
        <motion.ellipse
          cx="65" cy="45" rx="2" ry="2.5"
          fill="#0D4F8A"
          animate={{ scaleY: face.eyeScaleY }}
          style={{ transformOrigin: '65px 45px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />

        {/* Mouth */}
        <motion.path
          animate={{ d: face.mouthPath }}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        />
      </svg>
    </motion.div>
  )
}
```

- [ ] **Step 2: Start dev server and verify**

```bash
npm run dev
```

Open `http://localhost:5173`. Navigate to Home — Manu orb should show deep blue gradient, glassy shine, eyebrows, teardrop eyes with pupils, curved mouth. Select different moods — eyebrows and mouth should animate. Pulse glow should have amber ring.

- [ ] **Step 3: Commit**

```bash
git add src/components/ManuOrb.tsx
git commit -m "feat: redesign ManuOrb — rich gradient, SVG face with eyebrows, teardrop eyes, animated mouth"
```

---

## Task 4: Splash Screen

**Files:**
- Create: `src/screens/Splash.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Splash.tsx**

```tsx
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'
import { storage } from '../lib/storage'

interface Props { onDone: () => void }

export default function Splash({ onDone }: Props) {
  useEffect(() => {
    storage.markSplashSeen()
    const t = setTimeout(onDone, 7000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        overflow: 'hidden',
        background: '#0D1B2A',
      }}
    >
      {/* Video */}
      <video
        src="/splash.mp4"
        autoPlay
        muted
        playsInline
        onEnded={onDone}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Dark gradient overlay — bottom-up so text is readable */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(10,16,30,0.75) 0%, rgba(10,16,30,0.1) 55%, transparent 100%)',
        }}
      />

      {/* Logo + tagline — centered in bottom third */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: '15%',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Logo size="lg" color="white" />
        <p style={{
          color: 'rgba(255,255,255,0.75)',
          fontSize: 14,
          fontFamily: 'Nunito, sans-serif',
          letterSpacing: '0.04em',
        }}>
          सुकून — a safe space for your mind
        </p>
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Update App.tsx to handle splash**

Open `src/App.tsx`. Add import at top:
```ts
import { useState } from 'react'
import Splash from './screens/Splash'
import { storage } from './lib/storage'
```

`useState` is already imported — just add the other two. Then modify `App()`:

```tsx
export default function App() {
  const [showSplash, setShowSplash] = useState(() => !storage.hasSplashSeen())

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <Splash key="splash" onDone={() => setShowSplash(false)} />
        ) : (
          <AppShell key="shell" />
        )}
      </AnimatePresence>
    </BrowserRouter>
  )
}
```

Note: `AnimatePresence` is already imported from framer-motion. Move the outer `<AnimatePresence>` that wraps `<Routes>` inside `AppShell` — it remains there for page transitions. The new outer `AnimatePresence` in `App()` only handles splash↔shell.

- [ ] **Step 3: Verify splash flow**

```bash
npm run dev
```

Open `http://localhost:5173`. Clear localStorage (`Application → Local Storage → Clear All` in DevTools). Reload — lotus video should play fullscreen, logo appears after 0.6s, after 7s (or video end) smooth fade to Home. Reload again without clearing storage — splash should be skipped.

- [ ] **Step 4: Commit**

```bash
git add src/screens/Splash.tsx src/App.tsx
git commit -m "feat: one-time animated splash screen with lotus video, auto-transitions to home"
```

---

## Task 5: Home Screen Upgrades

**Files:**
- Modify: `src/screens/Home.tsx`

- [ ] **Step 1: Update Home.tsx**

Replace the file with this full version:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import PageTransition from '../components/PageTransition'
import ManuOrb from '../components/ManuOrb'
import { storage } from '../lib/storage'
import type { Lang, Mood } from '../types'
import type { Tr, TranslationKey } from '../translations'

const MOODS: { key: Mood; emoji: string; labelKey: TranslationKey }[] = [
  { key: 'sad',     emoji: '😔', labelKey: 'mood_sad'     },
  { key: 'anxious', emoji: '😰', labelKey: 'mood_anxious' },
  { key: 'neutral', emoji: '😶', labelKey: 'mood_neutral' },
  { key: 'good',    emoji: '🙂', labelKey: 'mood_good'    },
  { key: 'happy',   emoji: '😄', labelKey: 'mood_happy'   },
]

const PROMPTS_HI = [
  'आज तुमने किस बात पर ध्यान दिया जो तुम्हें अच्छी लगी?',
  'आज तुम किसकी मदद कर सकते हो?',
  'एक चीज़ जो तुम्हें आज खुश करती है?',
  'क्या कोई बात है जो तुम कहना चाहते हो पर कह नहीं पाए?',
  'आज तुमने अपने आप की कैसे देखभाल की?',
  'एक डर जो तुम्हें रोक रहा है — क्या वो सच में इतना बड़ा है?',
  'तुम्हारी सबसे बड़ी ताकत क्या है?',
]

const PROMPTS_EN = [
  'What did you notice today that felt good?',
  'Who can you help today?',
  'One thing that makes you happy right now?',
  "Is there something you wanted to say but couldn't?",
  'How did you take care of yourself today?',
  'A fear holding you back — is it really as big as it seems?',
  'What is your greatest strength?',
]

function getGreeting(tr: Tr): string {
  const h = new Date().getHours()
  if (h < 12) return tr('morning')
  if (h < 17) return tr('afternoon')
  if (h < 20) return tr('evening')
  return tr('night')
}

interface Props { lang: Lang; tr: Tr }

export default function Home({ lang, tr }: Props) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(
    () => storage.getTodayMood()?.mood ?? null
  )
  const navigate = useNavigate()
  const prompt = lang === 'hi'
    ? PROMPTS_HI[new Date().getDay()]
    : PROMPTS_EN[new Date().getDay()]

  const manuSpring = useSpring({
    scale: selectedMood ? 1.08 : 1,
    config: { tension: 280, friction: 18 },
  })

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood)
    storage.addMood({ date: new Date().toISOString().split('T')[0], mood, timestamp: Date.now() })
    storage.updateStreak()
  }

  const streak = storage.getStreak()

  return (
    <PageTransition>
      <div className="px-4 pt-8 pb-4">

        {/* Hero — Manu + greeting */}
        <div className="flex flex-col items-center mb-7 relative">
          {/* Focal depth backdrop */}
          <div
            style={{
              position: 'absolute',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(27,108,168,0.12) 0%, transparent 70%)',
              top: -30,
              pointerEvents: 'none',
            }}
          />
          <animated.div style={manuSpring}>
            <ManuOrb mood={selectedMood} size={140} pulse />
          </animated.div>
          <h1 className="mt-5 text-3xl font-extrabold text-dark-indigo tracking-tight">
            {getGreeting(tr)}
          </h1>
          {streak.current > 0 && (
            <div className="mt-2 bg-saffron/15 text-saffron font-bold px-3 py-1 rounded-full text-sm flex items-center gap-1">
              🔥 {streak.current} {tr('streak')}
            </div>
          )}
        </div>

        {/* Mood check-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-soft mb-4"
        >
          <p className="text-center text-muted text-sm mb-4">{tr('mood_question')}</p>
          <div className="flex justify-between gap-1">
            {MOODS.map((m, i) => (
              <motion.button
                key={m.key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.08 }}
                onClick={() => handleMoodSelect(m.key)}
                className={`flex flex-col items-center p-2 rounded-xl flex-1 transition-all duration-200 ${
                  selectedMood === m.key
                    ? 'bg-teal/10 ring-2 ring-teal ring-offset-1'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-4xl leading-none">{m.emoji}</span>
                <span className="text-[10px] text-muted mt-1.5 text-center leading-tight font-semibold">
                  {tr(m.labelKey)}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Daily prompt */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
          className="bg-white rounded-2xl p-4 shadow-soft mb-4 cursor-default"
        >
          <p className="text-xs font-bold text-saffron uppercase tracking-wider mb-2">
            {tr('daily_prompt')}
          </p>
          <p className="text-dark-indigo font-semibold leading-snug">{prompt}</p>
        </motion.div>

        {/* Quick access */}
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3 px-1">
          {tr('quick_access')}
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {([
            { path: '/chat',    emoji: '💬', key: 'chat'    },
            { path: '/breathe', emoji: '🌬️', key: 'breathe' },
            { path: '/learn',   emoji: '📖', key: 'learn'   },
          ] as const).map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.04, backgroundColor: 'rgba(27,108,168,0.05)' }}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center w-28 h-24 bg-white rounded-2xl shadow-soft shrink-0"
            >
              <span className="text-3xl mb-1.5">{item.emoji}</span>
              <span className="text-sm font-semibold text-dark-indigo">{tr(item.key)}</span>
            </motion.button>
          ))}
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-muted mt-7 px-4 leading-relaxed">
          {tr('privacy_note')}
        </p>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Verify in browser**

`http://localhost:5173` — Home should show: large 140px Manu with glow backdrop, 3xl greeting, saffron pill streak badge, 4xl mood emojis with hover scale, cards lift on hover.

- [ ] **Step 3: Commit**

```bash
git add src/screens/Home.tsx
git commit -m "feat: Home hero — larger Manu, focal glow, 3xl greeting, streak pill, mood hover spring"
```

---

## Task 6: Breathe Screen — Phase Colors + SVG Ring

**Files:**
- Modify: `src/screens/Breathe.tsx`

- [ ] **Step 1: Replace Breathe.tsx**

Replace full file:

```tsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import ManuOrb from '../components/ManuOrb'
import { storage } from '../lib/storage'
import type { BreathPhase, BreathPreset, Lang } from '../types'
import type { Tr, TranslationKey } from '../translations'

const PRESETS: Record<BreathPreset, { inhale: number; hold: number; exhale: number }> = {
  sleep:   { inhale: 4, hold: 7, exhale: 8 },
  anxiety: { inhale: 4, hold: 4, exhale: 4 },
  calm:    { inhale: 4, hold: 0, exhale: 6 },
}

const DURATIONS = [3, 5, 10] as const
const DURATION_KEYS: TranslationKey[] = ['duration_3', 'duration_5', 'duration_10']

const PHASE_COLORS: Record<BreathPhase | 'idle', { ring: string; text: string; glow: string }> = {
  inhale: { ring: '#1B6CA8', text: '#1B6CA8', glow: 'rgba(27,108,168,0.45)' },
  hold:   { ring: '#1A1B3A', text: '#1A1B3A', glow: 'rgba(26,27,58,0.45)'  },
  exhale: { ring: '#F4A535', text: '#F4A535', glow: 'rgba(244,165,53,0.45)' },
  idle:   { ring: '#1B6CA8', text: '#6B7280', glow: 'transparent'            },
}

const SVG_SIZE = 256
const SVG_CX = SVG_SIZE / 2
const SVG_CY = SVG_SIZE / 2
const OUTER_R = 118
const CIRCUMFERENCE = 2 * Math.PI * OUTER_R

interface Props { lang: Lang; tr: Tr }

export default function Breathe({ tr }: Props) {
  const [preset, setPreset] = useState<BreathPreset>('calm')
  const [durationMin, setDurationMin] = useState<3 | 5 | 10>(3)
  const [phase, setPhase] = useState<BreathPhase>('idle')
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0)
  const [phaseDuration, setPhaseDuration] = useState(0)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0)
  const [done, setDone] = useState(false)

  const phaseRef = useRef<BreathPhase>('idle')
  const presetRef = useRef<BreathPreset>('calm')
  const sessionRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  phaseRef.current = phase
  presetRef.current = preset

  const clearTick = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  const getNextPhase = (cur: BreathPhase, cfg: typeof PRESETS[BreathPreset]): { phase: BreathPhase; duration: number } => {
    if (cur === 'inhale') return cfg.hold > 0 ? { phase: 'hold', duration: cfg.hold } : { phase: 'exhale', duration: cfg.exhale }
    if (cur === 'hold')   return { phase: 'exhale', duration: cfg.exhale }
    return                       { phase: 'inhale', duration: cfg.inhale }
  }

  const startSession = () => {
    setDone(false)
    const total = durationMin * 60
    sessionRef.current = total
    setSessionTimeLeft(total)
    const cfg = PRESETS[preset]
    setPhase('inhale')
    setPhaseTimeLeft(cfg.inhale)
    setPhaseDuration(cfg.inhale)
  }

  const stopSession = () => {
    clearTick()
    setPhase('idle')
    setPhaseTimeLeft(0)
    setPhaseDuration(0)
    setSessionTimeLeft(0)
  }

  useEffect(() => {
    if (phase === 'idle') return
    clearTick()
    intervalRef.current = setInterval(() => {
      sessionRef.current -= 1
      setSessionTimeLeft(sessionRef.current)
      if (sessionRef.current <= 0) {
        clearTick()
        setPhase('idle')
        setPhaseTimeLeft(0)
        setPhaseDuration(0)
        setDone(true)
        storage.addBreatheEntry({ date: new Date().toISOString().split('T')[0], preset: presetRef.current, duration: durationMin * 60 })
        storage.updateStreak()
        return
      }
      setPhaseTimeLeft(prev => {
        if (prev <= 1) {
          const next = getNextPhase(phaseRef.current, PRESETS[presetRef.current])
          setPhase(next.phase)
          setPhaseDuration(next.duration)
          return next.duration
        }
        return prev - 1
      })
    }, 1000)
    return clearTick
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const config = PRESETS[preset]
  const circleScale = phase === 'inhale' ? 1.28 : phase === 'hold' ? 1.28 : 0.68
  const cycleDuration = phase === 'inhale' ? config.inhale : phase === 'hold' ? config.hold : phase === 'exhale' ? config.exhale : 0.4
  const colors = PHASE_COLORS[phase]

  // SVG ring: fraction of phase elapsed → dashoffset
  const elapsed = phaseDuration - phaseTimeLeft
  const progress = phaseDuration > 0 ? elapsed / phaseDuration : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  const phaseLabel =
    phase === 'inhale' ? tr('breathe_inhale') :
    phase === 'hold'   ? tr('breathe_hold')   :
    phase === 'exhale' ? tr('breathe_exhale') : ''

  const presetOptions: { key: BreathPreset; labelKey: TranslationKey }[] = [
    { key: 'sleep',   labelKey: 'preset_sleep'   },
    { key: 'anxiety', labelKey: 'preset_anxiety' },
    { key: 'calm',    labelKey: 'preset_calm'    },
  ]

  return (
    <PageTransition>
      <div className="px-4 pt-8">
        <h1 className="text-2xl font-extrabold text-dark-indigo mb-6 text-center">
          {tr('breathe_title')}
        </h1>

        {/* Breathing circle */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative flex items-center justify-center" style={{ width: SVG_SIZE, height: SVG_SIZE }}>

            {/* SVG progress ring — outermost */}
            <svg
              width={SVG_SIZE}
              height={SVG_SIZE}
              style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
            >
              {/* Track */}
              <circle
                cx={SVG_CX} cy={SVG_CY} r={OUTER_R}
                stroke="rgba(27,108,168,0.1)"
                strokeWidth={4}
                fill="none"
              />
              {/* Progress arc */}
              <motion.circle
                cx={SVG_CX} cy={SVG_CY} r={OUTER_R}
                stroke={colors.ring}
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                animate={{
                  strokeDashoffset: phase === 'idle' ? CIRCUMFERENCE : dashOffset,
                  stroke: colors.ring,
                  filter: phase === 'idle' ? 'none' : `drop-shadow(0 0 8px ${colors.glow})`,
                }}
                transition={{ duration: 0.5, ease: 'linear' }}
              />
            </svg>

            {/* Inner animated rings */}
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: cycleDuration, ease: 'easeInOut' }}
              className="absolute rounded-full"
              style={{
                width: 200, height: 200,
                background: `radial-gradient(circle, ${colors.ring}18 0%, transparent 70%)`,
              }}
            />
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: cycleDuration, ease: 'easeInOut', delay: 0.06 }}
              className="absolute rounded-full"
              style={{
                width: 160, height: 160,
                background: `${colors.ring}22`,
                border: `2px solid ${colors.ring}44`,
              }}
            />
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: cycleDuration, ease: 'easeInOut', delay: 0.12 }}
              className="absolute rounded-full"
              style={{
                width: 120, height: 120,
                background: `linear-gradient(135deg, ${colors.ring} 0%, #F4A535 100%)`,
                opacity: 0.85,
              }}
            />
            <div className="relative z-10">
              <ManuOrb size={64} pulse={phase !== 'idle'} />
            </div>
          </div>
        </div>

        {/* Phase label */}
        <div className="text-center mb-1 h-14">
          <AnimatePresence mode="wait">
            {phase !== 'idle' && (
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-3xl font-extrabold" style={{ color: colors.text }}>{phaseLabel}</p>
                <p className="text-muted text-sm mt-1">{phaseTimeLeft}s</p>
              </motion.div>
            )}
          </AnimatePresence>
          {phase === 'idle' && !done && (
            <p className="text-muted text-sm pt-3">
              {config.inhale}s — {config.hold > 0 ? `${config.hold}s — ` : ''}{config.exhale}s
            </p>
          )}
        </div>

        {phase !== 'idle' && (
          <p className="text-center text-xs text-muted mb-4">
            {Math.floor(sessionTimeLeft / 60)}:{String(sessionTimeLeft % 60).padStart(2, '0')} बाकी
          </p>
        )}

        <AnimatePresence>
          {done && (
            <motion.p
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center font-bold text-teal text-lg mb-4"
            >
              {tr('breathe_done')}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Preset + Duration selectors */}
        {phase === 'idle' && (
          <div className="mb-6">
            <div className="flex gap-2 justify-center flex-wrap mb-3">
              {presetOptions.map(({ key, labelKey }) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => setPreset(key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    preset === key ? 'bg-teal text-white' : 'bg-white text-muted shadow-soft'
                  }`}
                >
                  {tr(labelKey)}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2 justify-center">
              {DURATIONS.map((d, i) => (
                <motion.button
                  key={d}
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => setDurationMin(d)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    durationMin === d ? 'bg-saffron text-white' : 'bg-white text-muted shadow-soft'
                  }`}
                >
                  {tr(DURATION_KEYS[i])}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Start / Stop */}
        <div className="flex justify-center">
          {phase === 'idle' ? (
            <motion.button
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(27,108,168,0.5)' }}
              onClick={startSession}
              className="bg-teal text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-glow"
            >
              {tr('breathe_start')}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.02 }}
              onClick={stopSession}
              className="bg-white text-danger font-semibold px-8 py-3 rounded-2xl shadow-soft border border-danger/20"
            >
              {tr('breathe_stop')}
            </motion.button>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Verify phase colors**

Navigate to `/breathe`. Start session — rings and phase label should be teal during inhale, dark indigo during hold, saffron during exhale. SVG progress ring tracks phase countdown.

- [ ] **Step 3: Commit**

```bash
git add src/screens/Breathe.tsx
git commit -m "feat: Breathe phase-aware colors, SVG countdown ring, hover states on buttons"
```

---

## Task 7: Micro Interactions — Remaining Screens

**Files:**
- Modify: `src/components/PageTransition.tsx`
- Modify: `src/components/BottomNav.tsx`
- Modify: `src/screens/Learn.tsx`
- Modify: `src/screens/Help.tsx`
- Modify: `src/screens/Chat.tsx`

- [ ] **Step 1: Upgrade PageTransition.tsx**

Read current file first. Replace the motion variants to add slide-up:

```tsx
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ paddingBottom: '80px' }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Upgrade BottomNav.tsx**

Add `whileHover={{ y: -2 }}` to each nav button's `motion.button`:

```tsx
<motion.button
  key={path}
  whileTap={{ scale: 0.88 }}
  whileHover={{ y: -2 }}
  onClick={() => navigate(path)}
  className="flex flex-col items-center justify-center flex-1 relative gap-0.5"
>
```

- [ ] **Step 3: Add card hover lift to Learn.tsx**

Find the `motion.div` that wraps each learn card (the one with `className="bg-white rounded-2xl..."` around card content). Add:
```tsx
whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.12)' }}
```

- [ ] **Step 4: Add button hover to Help.tsx**

Find the `motion.a` call button in the helpline list. Add:
```tsx
whileHover={{ scale: 1.05, backgroundColor: '#155d90' }}
```

Find the SOS card `<a>` — convert to `motion.a` and add:
```tsx
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.97 }}
```

- [ ] **Step 5: Add send button hover to Chat.tsx**

Find the send `motion.button`. Add:
```tsx
whileHover={{ scale: 1.08 }}
```

- [ ] **Step 6: Verify**

Open each screen in browser. Check:
- Page transitions slide up smoothly
- Nav icons bounce up on hover
- Learn cards lift on hover
- Help call buttons darken on hover
- Chat send button scales on hover

- [ ] **Step 7: Commit**

```bash
git add src/components/PageTransition.tsx src/components/BottomNav.tsx src/screens/Learn.tsx src/screens/Help.tsx src/screens/Chat.tsx
git commit -m "feat: micro interactions — slide-up transitions, nav hover, card lift, button hover states"
```

---

## Task 8: PWA Icons + Build Verification

**Files:**
- Modify: `scripts/gen-icons.py`

- [ ] **Step 1: Update gen-icons.py with new indigo+flame design**

Replace the entire `scripts/gen-icons.py` file:

```python
import struct, zlib, math

def write_png(path, size):
    w = h = size
    # Background: deep indigo #1A1B3A = (26, 27, 58)
    bg = (26, 27, 58)
    # Flame color: saffron #F4A535 = (244, 165, 53)
    flame = (244, 165, 53)
    # Highlight: cream #FDF6EC = (253, 246, 236)
    highlight = (253, 246, 236)

    pixels = []
    cx = w / 2
    cy = h / 2

    # Flame shape: teardrop pointing up, centered
    # flame tip at top, round base at 65% down
    fw = w * 0.28   # half-width of flame base
    fh = h * 0.48   # total flame height
    ftop_y = cy - h * 0.28   # tip y
    fbase_y = cy + h * 0.10  # base center y

    for y in range(h):
        row = []
        for x in range(w):
            # Circle mask for icon (rounded)
            dx = x - cx
            dy = y - cy
            in_circle = math.sqrt(dx*dx + dy*dy) <= w * 0.48

            if not in_circle:
                row.append(bg)
                continue

            # Check if pixel is inside flame shape
            # Flame = upper half: triangle-ish, lower half: circle
            fy = y - ftop_y   # distance from tip
            fh_total = fbase_y - ftop_y

            in_flame = False
            if ftop_y <= y <= fbase_y:
                # width expands from 0 at tip to fw at base
                t = fy / fh_total if fh_total > 0 else 0
                half_w = fw * math.sqrt(t)
                if abs(x - cx) <= half_w:
                    in_flame = True
            elif fbase_y < y <= fbase_y + fw * 0.7:
                # round base
                bdy = y - fbase_y
                if math.sqrt((x - cx)**2 + bdy*bdy) <= fw:
                    in_flame = True

            # Inner highlight: top 40% of flame, narrower
            in_highlight = False
            if in_flame:
                t = fy / fh_total if fh_total > 0 else 0
                if t < 0.45:
                    half_hw = fw * 0.35 * math.sqrt(t + 0.05)
                    if abs(x - cx) <= half_hw:
                        in_highlight = True

            if in_highlight:
                row.append(highlight)
            elif in_flame:
                row.append(flame)
            else:
                row.append(bg)
        pixels.append(row)

    # Encode PNG
    def pack_chunk(name, data):
        c = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)

    raw = b''
    for row in pixels:
        raw += b'\x00'
        for r, g, b in row:
            raw += bytes([r, g, b])

    compressed = zlib.compress(raw, 9)
    ihdr_data = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    png = (
        b'\x89PNG\r\n\x1a\n'
        + pack_chunk(b'IHDR', ihdr_data)
        + pack_chunk(b'IDAT', compressed)
        + pack_chunk(b'IEND', b'')
    )
    with open(path, 'wb') as f:
        f.write(png)
    print(f'Written {path} ({size}x{size})')

write_png('public/icon-192.png', 192)
write_png('public/icon-512.png', 512)
print('Done.')
```

- [ ] **Step 2: Run icon generator**

```bash
python scripts/gen-icons.py
```

Expected output:
```
Written public/icon-192.png (192x192)
Written public/icon-512.png (512x512)
Done.
```

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: `✓ built in Xs` with SW generated. No TypeScript errors.

- [ ] **Step 4: Preview and smoke-test**

```bash
npx vite preview --port 4173
```

Open `http://localhost:4173`. Clear localStorage, reload — verify splash → home transition. Check each screen renders correctly.

- [ ] **Step 5: Final commit and push**

```bash
git add scripts/gen-icons.py public/icon-192.png public/icon-512.png
git commit -m "feat: new indigo+flame PWA icons"
git push origin main
```

---

## Self-Review Checklist

- [x] Spec §1 Logo → Task 2 (Logo.tsx with diya SVG + Dancing Script)
- [x] Spec §2 Manu Orb → Task 3 (full rewrite, gradient, SVG face, eyebrows)
- [x] Spec §3 Splash → Task 4 (Splash.tsx + App.tsx routing, localStorage gate)
- [x] Spec §4 Home → Task 5 (140px Manu, focal glow, 3xl greeting, mood hover)
- [x] Spec §5 Breathe → Task 6 (PHASE_COLORS, SVG ring, phase-aware ring colors)
- [x] Spec §6 Micro Interactions → Task 7 (PageTransition, BottomNav, Learn, Help, Chat)
- [x] Spec §7 PWA Icons → Task 8 (gen-icons.py rewrite, new design)
- [x] All Dancing Script references consistent (`font-dancing` Tailwind class)
- [x] `storage.hasSplashSeen` / `storage.markSplashSeen` defined in Task 1, used in Task 4 — names match
- [x] `PHASE_COLORS` covers all 4 `BreathPhase` values + 'idle' — no missing keys
- [x] No TBDs or placeholders
