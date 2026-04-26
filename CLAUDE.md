# PhonicsFlow — Agent Instructions

## What We're Building
A mobile app (iOS + Android) that teaches English phonics via pattern decoding and AI-powered TTS.
Core idea: show users the "secret" behind English spelling patterns so they can decode any word.
Target users: ESL learners, children learning to read, adults with dyslexia.
Goal: 4.9 App Store rating.

**All 13 screens have been designed and approved. Read /docs/ui-screens.md before building any screen.**

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | React Native + Expo SDK 52 |
| Navigation | Expo Router v3 |
| Backend | Supabase (auth, db, storage) |
| TTS | ElevenLabs (primary), Expo Speech (fallback) |
| Speech Recognition | OpenAI Whisper |
| Payments | RevenueCat |
| State | Zustand |
| Animations | Reanimated 3 + Lottie |
| Audio Playback | Expo AV |
| Haptics | Expo Haptics |
| Testing | Jest + React Native Testing Library |

---

## Folder Structure

```
/app
  /(auth)               → splash, onboarding (4 screens), signup
  /(tabs)
    /home               → home screen
    /progress           → progress screen
    /leagues            → leaderboard screen
    /profile            → profile + settings screen
  /lesson/[id]          → word learning step
  /sentences/[id]       → sentences step
  /quiz/[id]            → quiz step
  /complete/[id]        → lesson complete ceremony

/components
  /ui                   → Button, Card, Skeleton, Toggle, ErrorState, EmptyState
  /lesson               → WordCard, PatternDisplay, AudioButton, QueueStrip
  /quiz                 → QuizOption, ScoreBar
  /sentences            → SentenceCard, HintStrip
  /celebrations         → LessonComplete, StreakModal, LevelUp, XpPop, Confetti
  /onboarding           → GoalCard, PatternHero

/hooks
  /useLesson.ts
  /useAudio.ts
  /useProgress.ts
  /useSaveProgress.ts
  /useSubscription.ts

/lib
  /supabase.ts
  /elevenlabs.ts
  /whisper.ts
  /revenuecat.ts
  /tokens.ts
  /routes.ts
  /types.ts
  /sounds.ts            → SoundEngine class
  /haptics.ts           → haptics helper

/store
  /authStore.ts
  /lessonStore.ts
  /settingsStore.ts     → soundEnabled, hapticsEnabled, audioSpeed, accent

/supabase
  /migrations
  /seed.ts

/scripts
  /generate-audio.ts
  /seed-lessons.ts

/assets
  /fonts                → OpenDyslexic
  /lottie               → confetti.json, stars-burst.json, flame-pulse.json, checkmark.json
  /sounds               → correct.mp3, wrong.mp3, tap.mp3, lessonComplete.mp3 etc.

/skills                 → agent instruction templates
/docs
  /ui-screens.md        → ALL approved screen specs — read before building any screen
  /sprint-1.md
```

---

## Design Tokens (/lib/tokens.ts)

```typescript
export const colors = {
  primary: '#1D9E75',
  primaryLight: '#E1F5EE',
  primaryMid: '#5DCAA5',
  primaryDark: '#085041',
  primaryDeep: '#0F6E56',
  accent: '#F0997B',
  accentLight: '#FAECE7',
  amber: '#EF9F27',
  amberLight: '#FAEEDA',
  consonant: '#B4B2A9',   // always used for consonant part of words
  pattern: '#1D9E75',     // always used for pattern part of words
  neutral: '#F1EFE8',
  surface: '#fff',
  text: '#2C2C2A',
  textMuted: '#888780',
  textHint: '#B4B2A9',
  border: '#D3D1C7',
  borderLight: '#E1F5EE',
  error: '#E24B4A',
  errorLight: '#FCEBEB',
}

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
}

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999
}

export const fontSize = {
  xs: 9, sm: 11, md: 13, lg: 15, xl: 18, xxl: 22, hero: 52
}
```

---

## TypeScript Types (/lib/types.ts)

```typescript
type Word = {
  id: string
  text: string
  consonant: string        // e.g. "b"
  pattern: string          // e.g. "ake"
  definition: string
  phoneme: string          // e.g. "/beɪk/"
  audio_url: string
  slow_audio_url: string
}

type WordFamily = {
  id: string
  pattern: string          // e.g. "-ake"
  sound: string            // e.g. "/eɪk/"
  rule: string
  words: Word[]
}

type Lesson = {
  id: string
  word_family_id: string
  title: string
  level: 1 | 2 | 3
}

type UserProgress = {
  user_id: string
  lesson_id: string
  completed: boolean
  score: number
  xp_earned: number
  completed_at: string
  words_mastered: string[]
  words_skipped: string[]
}

type UserProfile = {
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
}

type WordStatus = 'unseen' | 'mastered' | 'skipped'
```

---

## Key UI Rules (enforce on every screen)

1. **Consonant always #B4B2A9, pattern always #1D9E75** — no exceptions
2. **Georgia serif only for pattern/word displays** — all other text is system sans
3. **Audio speed lives in profile settings only** — never show speed controls in lessons
4. **No confirm password field** — ever
5. **No Apple Sign In** — Google + email only
6. **Email signup expands inline** — fields appear below email button, no new screen
7. **Quiz has no next button** — auto-advances after correct (900ms) or wrong (1400ms)
8. **Lesson complete is a full teal screen takeover** — not a modal, not a toast
9. **All toggles default ON**: sound effects, haptics, notifications
10. **4 tabs**: home, progress, leagues, profile — in that order
11. **Scroll must work on profile screen** — all settings sections reachable by scroll
12. **Word learning queue**: horizontal scroll, shows current batch only

---

## Delight Rules (read /skills/delight-system.md)

Every meaningful interaction has 3 simultaneous layers:
- Visual (animation)
- Audio (sound effect)
- Haptic (physical feedback)

Key moments and timing:
- Correct quiz answer → green flash + sound + haptic → auto-next 900ms
- Wrong quiz answer → red flash + gentle sound + error haptic → correct reveals → auto-next 1400ms
- Word mastered → scale bounce + wordRevealed sound + medium haptic
- Lesson complete → confetti + lessonComplete sound + celebrate haptic sequence
- Name typed in onboarding → live avatar + greeting update (visual delight, no sound)
- "Let's go" tap → button expands to fill screen + levelUp sound

---

## Auth Rules

- Google Sign In — primary CTA
- Email + password — secondary, expands inline
- No Apple Sign In
- No confirm password field
- On signup: create user_profiles row with display_name from onboarding step

---

## Settings Store (/store/settingsStore.ts)

```typescript
type SettingsStore = {
  soundEnabled: boolean         // default: true
  hapticsEnabled: boolean       // default: true
  audioSpeed: 'slow' | 'normal' | 'fast'   // default: 'normal'
  accent: 'american' | 'british'           // default: 'american'
  dyslexiaFont: boolean         // default: false
  largerText: boolean           // default: false
}
```

SoundEngine and haptics must check these before playing/firing.

---

## Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
ELEVENLABS_API_KEY=
OPENAI_API_KEY=
REVENUECAT_IOS_KEY=
REVENUECAT_ANDROID_KEY=
```

---

## Skills Reference

| Task | Read first |
|------|-----------|
| Building any screen | /docs/ui-screens.md + /skills/create-screen.md |
| Supabase data hooks | /skills/create-supabase-hook.md |
| Audio playback + TTS | /skills/add-tts-audio.md |
| Any user interaction | /skills/delight-system.md |
| Celebration moments | /skills/celebration-components.md |

---

## Current Sprint
See /docs/sprint-1.md
