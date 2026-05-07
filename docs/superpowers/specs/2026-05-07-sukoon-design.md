# Sukoon (सुकून) — Product Design Spec
**Date:** 2026-05-07  
**Status:** Approved for implementation

---

## 1. Problem Statement

Slum youth in urban India (ages 13–24) experiencing psychological distress have no private, stigma-free, accessible first step to understand what they are going through. The gap is not lack of treatment — it is *discovery*: they don't know what they feel has a name, that help exists, or that asking is safe. Shame, stigma, and zero trusted channels keep the issue hidden. They suffer in silence.

**Pain solved:** The moment between "I feel something is deeply wrong" and "I know what this is and there is somewhere I can go."

---

## 2. Target Users

| Attribute | Detail |
|---|---|
| Age | 13–24 |
| Location | Urban slums, India |
| Language | Hindi/Hinglish primary; English toggle |
| Device | Basic Android smartphone |
| Literacy | Functional Hindi literacy assumed |
| Expectation | Zero login, zero data sharing, zero cost |

---

## 3. Product: Sukoon (सुकून)

**Name meaning:** Hindi for "peace / relief." Single word, universally understood across India.

**Core promise:** A private, shame-free space to understand your mind and find help — no judgment, no account, no data stored anywhere but your phone.

**Character:** "Manu" — a soft glowing animated orb with an expressive face. Implemented in MVP as a pure CSS animated gradient orb (radial-gradient + keyframe pulse + scale transforms) — no custom Lottie file needed. Free Lottie files from LottieFiles.com used for breathing animation, loading dots, and celebration. Reacts to user mood, guides sessions, animates throughout the app. Provides warmth and personality without being infantilizing.

---

## 4. UI / UX Design System

### 4.1 Theme: "Warm Sanctuary"

| Token | Value |
|---|---|
| Primary | Deep teal `#1B6CA8` |
| Accent | Warm saffron `#F4A535` |
| Background | Soft cream `#FDF6EC` |
| Dark bg | Deep indigo `#1A1B3A` |
| Text primary | `#1C1C1E` |
| Text muted | `#6B7280` |
| Success | `#34C759` |
| Danger | `#FF3B30` |

### 4.2 Typography

- **Primary font:** Nunito (Google Fonts, free) — rounded, approachable
- **Headings:** Nunito Bold 700
- **Body:** Nunito Regular 400
- **Hindi text:** Noto Sans Devanagari (Google Fonts, free)

### 4.3 Motion Design

All animations must feel organic, never mechanical. Use spring physics where possible.

| Tool | Usage |
|---|---|
| Framer Motion | Page transitions, card reveals, modal entrance, button spring feedback, list stagger |
| Lottie + LottieFiles (free files) | Breathing circle expand/contract, Manu expressions, meditation pulse, loading states |
| React Spring | Scroll-triggered card animations, parallax on Home screen |
| CSS keyframes | Ambient floating particles, gradient background shifts, ripple on tap |

**Animation principles:**
- Every page transition: shared-element or slide+fade (200–350ms)
- Every button tap: spring scale 0.95 → 1.0
- Every card entrance: fade up with 40px offset, staggered 80ms between siblings
- Manu reacts to mood selection within 300ms with Lottie expression swap
- Background: slow-shifting radial gradient (60s loop, barely perceptible)

### 4.4 Navigation

Bottom tab bar (5 tabs, MVP uses 5 screens):

```
🏠 Home  |  💬 Chat  |  🌬️ Breathe  |  📖 Learn  |  🆘 Help
```

Active tab: saffron indicator dot + label appears. Inactive: icon only.

---

## 5. Screen Designs

### 5.1 Home (`/`)
- Manu greeting animation (time-aware: "Subah ki shanti" morning, "Raat ko chain" night)
- Mood check-in: 5 animated emoji tiles (😔 Udaas / 😰 Ghabrahat / 😶 Theek / 🙂 Accha / 😄 Khush)
- On mood select: Manu animates reaction, short empathetic text appears, persisted to localStorage
- "Aaj ka sochne wala sawaal" — daily reflection prompt card
- Quick-access cards: Chat, Breathe, Learn (spring-animated horizontal scroll)

### 5.2 Chat (`/chat`)
- Fullscreen conversation UI, chat bubbles
- Manu avatar top-left, pulses when AI is typing
- Typing indicator: 3-dot Lottie bounce
- User messages: right-aligned, saffron bg
- AI messages: left-aligned, white card with soft shadow
- **Crisis trigger:** If message contains crisis keywords OR passive PHQ-9 score ≥ 15, a gentle card slides up from bottom: "Kya tum theek ho? Koi hai jo madad kar sakta hai." + helpline numbers. Never blocks conversation.
- First message from Manu (on load): warm Hindi greeting, asks how they're doing
- System prompt (see Section 7)

### 5.3 Breathe (`/breathe`)
- Lottie animated breathing circle: inhale (4s expand) → hold (4s) → exhale (6s contract)
- Text instruction synced to animation phase
- 3 presets: "Neend ke liye" (4-7-8), "Ghabrahat ke liye" (box breathing), "Shant rehne ke liye" (coherent)
- Session duration selector: 3 / 5 / 10 min
- Ambient particle background during session
- Manu sits in center of circle, breathes with it
- Post-session: Manu celebrates with animation + streak +1

### 5.4 Learn (`/learn`)
- Grid of illustrated cards, scroll-reveal animation
- 4 MVP cards: Depression (Udaasi), Anxiety (Ghabrahat), Trauma (Zakham), Loneliness (Akela Mehsoos Karna)
- Each card: illustration + 2-line plain Hindi description
- Card tap: full-screen modal with plain-language explanation, "What this feels like", "You are not alone", "What helps"
- Modal entrance: spring scale from card position (shared element feel)

### 5.5 Help (`/help`)
- Clean list of 5 free India helplines, tap-to-call
- Brief non-clinical note: "Madad maangna taqat ki nishani hai"
- Helplines:
  | Name | Number | Hours |
  |---|---|---|
  | iCall (TISS) | 9152987821 | Mon–Sat 8am–10pm |
  | Vandrevala Foundation | 1860-2662-345 | 24/7 |
  | NIMHANS | 080-46110007 | 24/7 |
  | Snehi | 044-24640050 | 8am–10pm |
  | Aasra | 9820466627 | 24/7 |
- Emergency SOS card pinned at top (red, animated pulse)

---

## 6. Data Architecture

**No backend. No server. No account.**

All data stored in `localStorage`:
```
sukoon_mood_log       → [{ date, mood, timestamp }]
sukoon_chat_history   → [{ role, content, timestamp }] (last 50 messages)
sukoon_breathe_log    → [{ date, preset, duration }]
sukoon_streak         → { current, longest, lastDate }
sukoon_lang           → "hi" | "en"
```

Chat sent to Groq API directly from browser (client-side fetch). No proxy needed for MVP. Groq API key stored in Vite env var (`VITE_GROQ_API_KEY`) — user must set this in their own `.env`. **Note:** Client-side key exposure is acceptable for MVP local dev/demo. Post-MVP: move to a Netlify serverless function proxy to hide the key.

**Privacy note in app:** "Tumhara koi bhi data hamare paas nahi jaata. Sab kuch sirf tumhare phone mein rehta hai."

---

## 7. AI System Prompt (Groq)

```
You are Manu, a warm and empathetic companion for young people in India who may be struggling emotionally. 
You speak in Hindi/Hinglish — conversational, warm, like a trusted older sibling, not a doctor.
You never diagnose. You validate feelings first, always.
You gently ask one follow-up question at a time.
You are aware of: depression, anxiety, trauma, loneliness, academic pressure, family conflict, substance abuse in environment.
If the user expresses suicidal ideation, self-harm, or extreme distress: express care, do NOT panic, and gently mention that real people can help — provide iCall number (9152987821).
Keep responses short (2–4 sentences). Avoid clinical jargon. Avoid English unless user writes in English.
Never ask for name, location, or any identifying information.
```

---

## 8. Passive PHQ-9 Scoring

During chat, maintain a running score in component state (not persisted). Scoring uses client-side keyword pattern matching on user messages (not AI response parsing):

| Keywords (Hindi + English) | Score increment |
|---|---|
| "mar jaana", "khatam karna", "suicide", "marna chahta" | +8 |
| "jeene ki ichha nahi", "sab bekaar", "koi umeed nahi" | +4 |
| "neend nahi", "khana nahi", "thaka", "akela", "rona" | +2 |
| "ghabrahat", "dara hua", "tension", "stress" | +1 |

- Score ≥ 10 → show "You matter" card with soft helpline prompt
- Score ≥ 15 → show crisis card with helplines prominently

Score resets each session. Never shown to user. AI system prompt handles crisis response independently — this scoring is a UI-layer safety net.

---

## 9. Tech Stack

| Layer | Choice | License / Cost |
|---|---|---|
| Framework | React 18 + Vite | MIT / Free |
| Styling | Tailwind CSS v3 | MIT / Free |
| Animation | Framer Motion v11 | MIT / Free |
| Lottie | lottie-react | MIT / Free |
| Spring | @react-spring/web | MIT / Free |
| Icons | Lucide React | MIT / Free |
| AI | Groq API (Llama 3.1 8B) | Free tier (14,400 req/day) |
| PWA | vite-plugin-pwa | MIT / Free |
| Fonts | Google Fonts (Nunito, Noto Sans Devanagari) | Free |
| Hosting | Netlify free tier | Free (commercial OK) |
| Backend | None | — |
| Database | localStorage | — |

---

## 10. MVP Scope (Phase 1)

Deliverable by end of day:

- [ ] Project scaffold: React + Vite + Tailwind + Framer Motion
- [ ] Design system: colors, typography, Manu character (Lottie or CSS)
- [ ] Home screen: mood check-in, Manu greeting, daily prompt
- [ ] Chat screen: Groq integration, Hindi system prompt, crisis detection
- [ ] Breathe screen: animated breathing circle (Lottie), 3 presets
- [ ] Learn screen: 4 psychoeducation cards with modal
- [ ] Help screen: 5 helplines, tap-to-call
- [ ] Bottom navigation with active state
- [ ] Page transitions (Framer Motion AnimatePresence)
- [ ] PWA config (manifest, service worker, installable)
- [ ] localStorage persistence (mood, streak, chat history)
- [ ] Responsive mobile-first layout (375px base)
- [ ] Hindi/English language toggle

---

## 11. Post-MVP Roadmap (Phase 2+)

| Feature | Notes |
|---|---|
| AI-guided meditation sessions | Groq generates script → Web Speech API (browser TTS, free) narrates |
| Meditation library | Sleep, Anxiety, Focus, Grief — 5/10/15 min |
| Mood journal + charts | Recharts, localStorage |
| Gamified streaks + badges | Animated badge unlock on milestones |
| Grounding exercises (5-4-3-2-1) | Interactive animated walkthrough |
| Sleep stories | Groq-generated calming stories + TTS |
| Regional languages | Tamil, Telugu, Bengali, Marathi |
| Anonymous community stories | "Others like me felt this too" |
| ASHA worker referral dashboard | Separate lightweight view |

---

## 12. Constraints

- No Meta services (WhatsApp, Instagram Login, Facebook SDK)
- No paid APIs or subscriptions
- No complex signup/verification flows
- No backend infrastructure to maintain
- Must work on basic Android (Chrome 90+)
- Must be installable as PWA
- Must feel safe and anonymous at all times
