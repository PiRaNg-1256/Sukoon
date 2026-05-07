import type { MoodEntry, ChatMessage, BreatheEntry, Streak, Lang } from '../types'

const KEYS = {
  MOOD_LOG: 'sukoon_mood_log',
  CHAT_HISTORY: 'sukoon_chat_history',
  BREATHE_LOG: 'sukoon_breathe_log',
  STREAK: 'sukoon_streak',
  LANG: 'sukoon_lang',
} as const

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full — fail silently
  }
}

export const storage = {
  getMoodLog: (): MoodEntry[] => get(KEYS.MOOD_LOG, []),

  addMood: (entry: MoodEntry): void => {
    const log = get<MoodEntry[]>(KEYS.MOOD_LOG, [])
    set(KEYS.MOOD_LOG, [...log, entry])
  },

  getTodayMood: (): MoodEntry | null => {
    const today = new Date().toISOString().split('T')[0]
    const log = get<MoodEntry[]>(KEYS.MOOD_LOG, [])
    const todayEntries = log.filter(e => e.date === today)
    return todayEntries[todayEntries.length - 1] ?? null
  },

  getChatHistory: (): ChatMessage[] => get(KEYS.CHAT_HISTORY, []),

  addChatMessage: (msg: ChatMessage): void => {
    const history = get<ChatMessage[]>(KEYS.CHAT_HISTORY, [])
    const trimmed = [...history, msg].slice(-50)
    set(KEYS.CHAT_HISTORY, trimmed)
  },

  clearChatHistory: (): void => set(KEYS.CHAT_HISTORY, []),

  getBreatheLog: (): BreatheEntry[] => get(KEYS.BREATHE_LOG, []),

  addBreatheEntry: (entry: BreatheEntry): void => {
    const log = get<BreatheEntry[]>(KEYS.BREATHE_LOG, [])
    set(KEYS.BREATHE_LOG, [...log, entry])
  },

  getStreak: (): Streak => get(KEYS.STREAK, { current: 0, longest: 0, lastDate: '' }),

  updateStreak: (): Streak => {
    const today = new Date().toISOString().split('T')[0]
    const streak = get<Streak>(KEYS.STREAK, { current: 0, longest: 0, lastDate: '' })
    if (streak.lastDate === today) return streak
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
    const current = streak.lastDate === yesterday ? streak.current + 1 : 1
    const updated: Streak = { current, longest: Math.max(current, streak.longest), lastDate: today }
    set(KEYS.STREAK, updated)
    return updated
  },

  getLang: (): Lang => get(KEYS.LANG, 'hi'),
  setLang: (lang: Lang): void => set(KEYS.LANG, lang),
}
