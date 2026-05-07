/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: '#1B6CA8',
        saffron: '#F4A535',
        cream: '#FDF6EC',
        'dark-indigo': '#1A1B3A',
        'text-main': '#1C1C1E',
        muted: '#6B7280',
        success: '#34C759',
        danger: '#FF3B30',
      },
      fontFamily: {
        nunito: ['Nunito', 'Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 16px rgba(0,0,0,0.06)',
        glow: '0 0 30px rgba(27,108,168,0.4)',
      },
    },
  },
  plugins: [],
}
