/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // legacy (keep for Chat/Help/etc still using them)
        teal: '#1B6CA8',
        saffron: '#F4A535',
        cream: '#FDF6EC',
        'dark-indigo': '#1A1B3A',
        'text-main': '#1C1C1E',
        muted: '#6B7280',
        success: '#34C759',
        danger: '#FF3B30',
        // Cosmic Night
        'cn-bg':      '#080b18',
        'cn-violet':  '#7c3aed',
        'cn-gold':    '#f59e0b',
        'cn-teal':    '#0ea5e9',
        'cn-text':    '#e2e8f0',
        'cn-muted':   'rgba(226,232,240,0.5)',
      },
      fontFamily: {
        nunito:  ['Nunito', 'Noto Sans Devanagari', 'sans-serif'],
        dancing: ['Dancing Script', 'cursive'],
      },
      boxShadow: {
        soft:    '0 2px 16px rgba(0,0,0,0.06)',
        glow:    '0 0 30px rgba(27,108,168,0.4)',
        violet:  '0 0 24px rgba(124,58,237,0.5)',
      },
    },
  },
  plugins: [],
}
