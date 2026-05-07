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
      <svg
        width={flame}
        height={Math.round(flame * 1.3)}
        viewBox="0 0 20 26"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 24C6 24 3 21 3 17C3 12 7 9 10 2C13 9 17 12 17 17C17 21 14 24 10 24Z"
          fill="#F4A535"
        />
        <ellipse cx="10" cy="17" rx="3" ry="4.5" fill="rgba(255,255,200,0.45)" />
        <ellipse cx="10" cy="24" rx="4" ry="1.2" fill="rgba(244,165,53,0.3)" />
      </svg>

      <span className={`font-dancing font-bold leading-none ${text} ${textColor}`}>
        Sukoon
      </span>
    </div>
  )
}
