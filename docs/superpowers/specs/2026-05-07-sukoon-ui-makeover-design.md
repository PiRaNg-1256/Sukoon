# Sukoon UI Makeover — Design Spec

> **For agentic workers:** Use superpowers:writing-plans to implement this spec.

**Goal:** Apply the three premium-website psychological principles (halo effect, cognitive fluency, micro interactions) to Sukoon's UI — adding a calligraphic logo, redesigned Manu orb, animated lotus splash screen, phase-aware Breathe screen, and hover/tap micro interactions across all screens.

**Source:** Video transcript `D:\Intro.txt` — principles: Halo Effect, Cognitive Load/Fluency, Micro Interactions + Peak-End Rule.

---

## 1. Logo

**Component:** `src/components/Logo.tsx`

- Text: "Sukoon" in Dancing Script Google Font (free, no copyright)
- Left of text: small SVG diya flame icon, saffron (`#F4A535`), ~20×24px
- Sizes: `sm` (splash overlay, white), `md` (general use, dark-indigo)
- Font added to `index.html` via Google Fonts link tag

```
<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
```

Tailwind token added: `fontFamily.dancing: ['Dancing Script', 'cursive']`

---

## 2. Manu Orb Redesign

**File:** `src/components/ManuOrb.tsx` (full rewrite)

**Base gradient:** `radial-gradient(circle at 35% 30%, #2C3E7A 0%, #1B6CA8 45%, #0D4F8A 100%)`
— deep rich indigo-blue, replaces the flat teal→saffron.

**Shine highlight:** absolute white oval `20×12px` at `(28%, 22%)`, `opacity: 0.35`, `filter: blur(4px)` — glassy depth.

**Rim glow:** `box-shadow: 0 0 0 3px rgba(244,165,53,0.25), 0 8px 32px rgba(27,108,168,0.45)`

**Eyes:** SVG teardrop paths (narrow top, rounded bottom), white fill, `scaleY` animated per mood.

**Eyebrows (new):** Two SVG arc paths above eyes. Angle per mood:
- happy/good: slightly raised (`rotate(-8deg)`)
- neutral: flat
- anxious: inward tilt (`rotate(12deg)` inner-side down)
- sad: drooped (`rotate(8deg)` inner-side down)

**Mouth:** SVG path, 3px white stroke, more pronounced curve.

**Pulse animation upgrade** (`src/index.css`):
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 3px rgba(244,165,53,0.25), 0 8px 24px rgba(27,108,168,0.3); }
  50%       { box-shadow: 0 0 0 5px rgba(244,165,53,0.4),  0 8px 40px rgba(27,108,168,0.6); }
}
```

**Mood face map:**
| Mood    | eyeScale | browAngle  | mouthCurve |
|---------|----------|------------|------------|
| happy   | 1.0      | -8deg      | large arc  |
| good    | 1.0      | -5deg      | medium arc |
| neutral | 0.9      | 0deg       | flat line  |
| anxious | 1.2      | +12deg in  | slight frown |
| sad     | 0.8      | +8deg in   | frown      |

---

## 3. Splash Screen

**File:** `src/screens/Splash.tsx`

**Video:** `public/splash.mp4` (copy from `D:\Sukoon\Lotus_Bloom_Camera_A_person_walks_through_a_bustling_city_street_at_Q42kRGe2.mp4`)

**Behavior:**
- Check `localStorage.getItem('sukoon_seen_splash')` on app mount
- If set → skip splash, render `<AppShell>` directly
- If not set → render `<Splash>`, set key on mount, auto-transition after 7s or when video ends (whichever first)

**Layout:**
```
[fullscreen video — object-fit: cover]
[gradient overlay: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)]
[centered bottom overlay]
  <Logo size="lg" color="white" />
  <p>सुकून — a safe space for your mind</p>
```

**Transition out:** Framer Motion exit `{ opacity: 0, scale: 1.04, transition: { duration: 0.8, ease: 'easeInOut' } }` → AnimatePresence wraps splash in `App.tsx`.

**Storage key:** `sukoon_seen_splash` (add to `src/lib/storage.ts` KEYS object)

---

## 4. Home Screen Upgrades

**File:** `src/screens/Home.tsx`

**Hero section:**
- Manu orb size: `140px` (up from 110px)
- Behind Manu: `<div>` with `radial-gradient(circle, rgba(27,108,168,0.1) 0%, transparent 70%)` absolute, `200px×200px`, centered behind orb — focal depth
- Greeting: `text-3xl font-extrabold tracking-tight` (up from 2xl)
- Streak badge: pill — `bg-saffron/15 text-saffron font-bold px-3 py-1 rounded-full text-sm` with 🔥 emoji

**Mood row:**
- Emoji size: `text-4xl` (up from 3xl)
- Selected: ring glow pulse — `ring-2 ring-teal ring-offset-2 bg-teal/10` + `animate-pulse` for 1s then stops
- `whileTap={{ scale: 0.85 }}` then spring back to `1.05` then `1.0`

**Cards:**
- All cards: `whileHover={{ y: -3 }}` + `transition boxShadow to '0 8px 24px rgba(0,0,0,0.10)'`

**Quick access buttons:**
- `whileHover={{ scale: 1.04, backgroundColor: 'rgba(27,108,168,0.05)' }}`

---

## 5. Breathe Screen Upgrades

**File:** `src/screens/Breathe.tsx`

**Phase color map:**
| Phase  | Ring color       | Text color | Glow color |
|--------|-----------------|------------|------------|
| inhale | `#1B6CA8` teal  | teal       | teal/40    |
| hold   | `#1A1B3A` indigo| dark-indigo| indigo/40  |
| exhale | `#F4A535` saffron| saffron   | saffron/40 |
| idle   | `#1B6CA8` teal  | muted      | none       |

**SVG circular progress ring:**
- Outer SVG `256×256`, `<circle>` stroke-dasharray = circumference, stroke-dashoffset animates from full to 0 over phase duration
- Replaces static ring divs for the outermost ring only; inner rings keep scale animation

**Ring glow:** `filter: drop-shadow(0 0 12px <phase-color>)` on animated SVG circle

**Phase label:** `text-3xl font-extrabold` colored to match phase color

**Start button:** add `whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(27,108,168,0.5)' }}`

---

## 6. Micro Interactions — All Screens

**Page transitions** (`src/components/PageTransition.tsx`):
- Upgrade to `initial={{ opacity: 0, y: 16 }}` slide-up + fade (currently just opacity)

**BottomNav** (`src/components/BottomNav.tsx`):
- Icons: `whileHover={{ y: -2 }}` spring
- Active indicator dot: scale spring on mount

**Learn cards** (`src/screens/Learn.tsx`):
- `whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.12)' }}`

**Help buttons** (`src/screens/Help.tsx`):
- Call buttons: `whileHover={{ scale: 1.04, backgroundColor: '#155d90' }}`

**Chat send button** (`src/screens/Chat.tsx`):
- `whileHover={{ scale: 1.08 }}` when input non-empty

---

## 7. PWA Icons

Update `public/icon-192.png` and `public/icon-512.png` to use the new diya+Sukoon branding. Regenerate via `scripts/gen-icons.py` — new icon: deep indigo background (`#1A1B3A`), saffron diya flame shape centered, "S" in Dancing Script below flame.

Since Python PIL is not available, generate via inline SVG → PNG approach using the existing stdlib PNG writer, drawing a flame shape with pixel math.

---

## Files Changed

| File | Action |
|------|--------|
| `src/components/Logo.tsx` | Create |
| `src/screens/Splash.tsx` | Create |
| `src/components/ManuOrb.tsx` | Full rewrite |
| `src/screens/Home.tsx` | Modify |
| `src/screens/Breathe.tsx` | Modify |
| `src/components/PageTransition.tsx` | Modify |
| `src/components/BottomNav.tsx` | Modify |
| `src/screens/Learn.tsx` | Modify |
| `src/screens/Help.tsx` | Modify |
| `src/screens/Chat.tsx` | Modify |
| `src/App.tsx` | Modify (splash routing) |
| `src/lib/storage.ts` | Add `sukoon_seen_splash` key |
| `src/index.css` | Update pulse-glow animation |
| `tailwind.config.js` | Add dancing font token |
| `index.html` | Add Dancing Script font link |
| `public/splash.mp4` | Copy from source |
| `scripts/gen-icons.py` | Update icon design |

---

## Constraints

- No new npm packages (use existing Framer Motion, Lucide, React)
- SVG for diya logo and orb face — inline, no external image files
- Dancing Script loaded via Google Fonts (already have font infrastructure)
- Splash shown only once per device (localStorage gate)
- All animations respect `prefers-reduced-motion` — wrap keyframe animations with `@media (prefers-reduced-motion: reduce) { animation: none }`
- No changes to Groq API, PHQ-9 logic, storage keys (except adding splash key), or translation strings
