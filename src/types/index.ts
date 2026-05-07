export type Mood = 'sad' | 'anxious' | 'neutral' | 'good' | 'happy'
export type Lang = 'hi' | 'en'
export type BreathPreset = 'sleep' | 'anxiety' | 'calm'
export type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale'

export interface MoodEntry {
  date: string
  mood: Mood
  timestamp: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface BreatheEntry {
  date: string
  preset: BreathPreset
  duration: number
}

export interface Streak {
  current: number
  longest: number
  lastDate: string
}
