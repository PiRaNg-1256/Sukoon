import type { Badge, MoodEntry } from '../types'

export const ALL_BADGES: Badge[] = [
  { id: 'first_mood',    emoji: '🌱', name: 'First Step',       description: 'Log your first mood' },
  { id: 'streak_3',      emoji: '🔥', name: 'On Fire',          description: '3-day streak' },
  { id: 'streak_7',      emoji: '⭐', name: 'Week Strong',       description: '7-day streak' },
  { id: 'streak_30',     emoji: '🏅', name: 'Monthly Warrior',   description: '30-day streak' },
  { id: 'breathe_1',     emoji: '🌬️', name: 'First Breath',     description: 'Complete first breathing session' },
  { id: 'breathe_10',    emoji: '🌊', name: 'Breath Master',     description: '10 breathing sessions' },
  { id: 'meditate_1',    emoji: '🧘', name: 'Still Mind',        description: 'First meditation' },
  { id: 'ground_1',      emoji: '🌿', name: 'Grounded',          description: 'Complete grounding exercise' },
  { id: 'journal_note',  emoji: '📝', name: 'Inner Voice',       description: 'Add first journal note' },
  { id: 'chat_1',        emoji: '💬', name: 'Open Up',           description: 'First chat with Manu' },
  { id: 'story_seeker', emoji: '📖', name: 'Story Seeker',       description: 'Read 3 stories' },
]

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}

function set<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

const BADGES_KEY = 'sukoon_badges'

export function getUnlockedBadges(): Record<string, number> {
  return get<Record<string, number>>(BADGES_KEY, {})
}

export function getBadgesWithStatus(): (Badge & { unlocked: boolean; unlockedAt?: number })[] {
  const unlocked = getUnlockedBadges()
  return ALL_BADGES.map(b => ({
    ...b,
    unlocked: !!unlocked[b.id],
    unlockedAt: unlocked[b.id],
  }))
}

function unlock(id: string): boolean {
  const unlocked = getUnlockedBadges()
  if (unlocked[id]) return false
  unlocked[id] = Date.now()
  set(BADGES_KEY, unlocked)
  return true
}

interface CheckContext {
  moodLog?: MoodEntry[]
  streak?: { current: number; longest: number }
  breatheCount?: number
  meditateCount?: number
  groundCount?: number
  chatCount?: number
  hasJournalNote?: boolean
  storiesCount?: number
}

export function checkAndUnlockBadges(ctx: CheckContext): string[] {
  const newlyUnlocked: string[] = []

  const tryUnlock = (id: string, condition: boolean) => {
    if (condition && unlock(id)) newlyUnlocked.push(id)
  }

  const moodCount = ctx.moodLog?.length ?? 0
  const streak = ctx.streak?.current ?? 0

  tryUnlock('first_mood',   moodCount >= 1)
  tryUnlock('streak_3',     streak >= 3)
  tryUnlock('streak_7',     streak >= 7)
  tryUnlock('streak_30',    streak >= 30)
  tryUnlock('breathe_1',    (ctx.breatheCount ?? 0) >= 1)
  tryUnlock('breathe_10',   (ctx.breatheCount ?? 0) >= 10)
  tryUnlock('meditate_1',   (ctx.meditateCount ?? 0) >= 1)
  tryUnlock('ground_1',     (ctx.groundCount ?? 0) >= 1)
  tryUnlock('journal_note', ctx.hasJournalNote === true)
  tryUnlock('chat_1',       (ctx.chatCount ?? 0) >= 1)
  tryUnlock('story_seeker', (ctx.storiesCount ?? 0) >= 3)

  return newlyUnlocked
}
