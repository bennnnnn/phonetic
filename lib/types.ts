export type Word = {
  id: string
  text: string
  consonant: string
  pattern: string
  definition: string
  phoneme: string
  pronunciation: string
  audio_url: string
  slow_audio_url: string
  pastText?: string
}

export type WordFamily = {
  id: string
  pattern: string
  sound: string
  rule: string
  words: Word[]
}

export type Lesson = {
  id: string
  word_family_id: string
  title: string
  level: 1 | 2 | 3
}

export type UserProgress = {
  user_id: string
  lesson_id: string
  completed: boolean
  score: number
  xp_earned: number
  completed_at: string
  words_mastered: string[]
  words_skipped: string[]
}

export type UserProfile = {
  id: string
  display_name: string
  streak_days: number
  total_xp: number
  level: number
  subscription_tier: 'free' | 'pro' | 'lifetime'
  dyslexia_font: boolean
  larger_text: boolean
  preferred_accent: 'american' | 'british'
  daily_goal: 1 | 2 | 3 | 5
  reminder_time: string
  native_language: string
}

export type WordStatus = 'unseen' | 'mastered' | 'skipped'

export type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
