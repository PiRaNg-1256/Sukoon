import { useMemo } from 'react'

interface Star {
  x: number
  y: number
  r: number
  opacity: number
  delay: number
  duration: number
}

function generateStars(count: number, seed: number): Star[] {
  const stars: Star[] = []
  let s = seed
  const rand = () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * 100,
      y: rand() * 100,
      r: rand() * 1.2 + 0.3,
      opacity: rand() * 0.5 + 0.3,
      delay: rand() * 6,
      duration: rand() * 3 + 2,
    })
  }
  return stars
}

export default function StarField() {
  const stars = useMemo(() => generateStars(180, 42), [])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #080b18 0%, #0d0f2a 60%, #080b18 100%)',
      }}
    >
      {/* Milky Way band */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '-20%',
          width: '140%',
          height: '45%',
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.07) 0%, rgba(14,165,233,0.04) 40%, transparent 70%)',
          transform: 'rotate(-15deg)',
          filter: 'blur(24px)',
        }}
      />

      {/* Stars SVG */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="white"
            style={{
              opacity: s.opacity,
              animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </svg>

      {/* Ambient violet glow bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '60%',
          height: '50%',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
    </div>
  )
}
