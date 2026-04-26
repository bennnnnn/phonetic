# Skill: Celebration Components

These are the big moments — lesson complete, level up, streak milestone.
Each one is a full ceremony, not a toast notification.

---

## 1. LessonComplete Screen (/components/celebrations/LessonComplete.tsx)

This is NOT a modal. It's a full screen takeover that slides up.

```typescript
import Animated, {
  useSharedValue, withSpring, withTiming,
  withDelay, withSequence, useAnimatedStyle
} from 'react-native-reanimated'
import LottieView from 'lottie-react-native'
import { soundEngine } from '@/lib/sounds'
import { haptics } from '@/lib/haptics'

type Props = {
  score: number           // 0-100
  xpEarned: number
  wordsLearned: number
  onContinue: () => void
}

// Animation sequence (total ~2.5 seconds before user can interact):
// 0ms    — screen slides up from bottom (spring)
// 0ms    — confetti Lottie starts playing
// 0ms    — celebrate haptic fires
// 0ms    — lessonComplete sound plays
// 200ms  — score circle draws itself (stroke-dashoffset animation)
// 600ms  — score number counts from 0 to actual score
// 900ms  — "Words Learned" stat fades in
// 1100ms — XP badge bounces in
// 1400ms — stars fill in one by one (3 stars max based on score)
//           score >= 90 → 3 stars, >= 70 → 2 stars, else → 1 star
// 1800ms — "Continue" button fades in and pulses gently
// 2200ms — ready for user interaction

// Star score:
//   < 70: "Keep practicing! You'll get it."
//   70-89: "Great work! Almost perfect."
//   90-100: "Perfect! You nailed it! 🔥"
```

---

## 2. StreakModal (/components/celebrations/StreakModal.tsx)

Slides up from bottom. Auto-dismisses after 3s or on tap.

```typescript
// Props: streakDays, isNewRecord
// 
// Layout:
//   Giant flame emoji (animated scale pulse, loop)
//   "X Day Streak!" — number scales in with spring
//   If new record: "Personal best!" badge
//   Thin progress bar showing streak towards next milestone (7, 14, 30, 100)
//
// Sounds: streakContinue
// Haptic: streak()
// Auto-dismiss: 3000ms with fade out
```

---

## 3. XpLevelUp Screen (/components/celebrations/LevelUp.tsx)

Full screen takeover — biggest moment in the app.

```typescript
// Props: oldLevel, newLevel, unlockedContent: string[]
//
// Sequence:
// 0ms    — screen fades in with teal radial burst from center
// 0ms    — levelUp sound
// 0ms    — celebrate haptic
// 300ms  — "LEVEL UP" text scales from 0 to 1 with heavy spring
// 500ms  — level number counts up (old → new)
// 800ms  — horizontal divider draws itself left to right
// 1000ms — "You unlocked:" label fades in
// 1100ms — unlocked items appear staggered (150ms each) with lock→unlock icon
//           each item plays 'unlock' sound
// End    — "Awesome!" button fades in

// Lottie: /assets/lottie/stars-burst.json plays in background
```

---

## 4. Confetti (/components/ui/Confetti.tsx)

Reusable. Can be triggered from anywhere.

```typescript
// Use react-native-confetti-cannon or build with Reanimated particles
// 
// Usage:
//   const confettiRef = useRef<ConfettiRef>(null)
//   confettiRef.current?.fire()
//   <Confetti ref={confettiRef} count={80} colors={['#1D9E75', '#F0997B', '#EF9F27', '#E24B4A']} />
//
// Colors match PhonicsFlow brand tokens
// Duration: 2500ms
// Physics: gravity 0.3, spread 60 degrees
```

---

## 5. Correct Answer Flash (/components/quiz/CorrectFlash.tsx)

Micro-celebration — plays on each correct quiz answer.

```typescript
// Overlay that appears for 600ms then disappears:
// - Green checkmark icon scales in (spring)
// - Background briefly tints green (opacity 0.15)
// - "+10 XP" floats up (XpPop component)
// - All fades out together

// Do NOT use this for lesson complete — that's LessonComplete screen
```

---

## 6. Onboarding Completion Portal

The transition from onboarding to the home screen.

```typescript
// Trigger: user taps "Let's go" on final onboarding screen
//
// Step 1: Button expands with spring to fill entire screen (borderRadius 0)
// Step 2: Screen behind fades from dark to teal
// Step 3: App name fades in centered, then out
// Step 4: Home screen content fades in through teal
// Step 5: Teal fades to white — home screen fully revealed
//
// Sound: levelUp at full volume
// Haptic: celebrate()
// Total duration: ~1400ms
//
// Implementation:
//   Use Reanimated shared values on the button
//   position: absolute, zIndex: 999 once animation starts
//   Coordinate with router.replace('/home') timing
```

---

## 7. Word Family Complete Banner

Shown when user completes all lessons in a word family (e.g. all -ake lessons).

```typescript
// Slides down from top for 4 seconds then dismisses
//
// Content:
//   Pattern badge (e.g. "-ake")
//   "Word family complete!"
//   Stat: "You learned X words"
//   Mini confetti burst (20 particles only — subtle)
//
// Sound: perfect
// Haptic: success()
```

---

## Lottie Files Needed

Place in /assets/lottie/:

| File | Where to get | Used in |
|------|-------------|---------|
| confetti.json | LottieFiles.com — search "confetti" | LessonComplete |
| stars-burst.json | LottieFiles.com — search "stars explode" | LevelUp |
| flame-pulse.json | LottieFiles.com — search "fire flame" | StreakModal |
| checkmark.json | LottieFiles.com — search "success checkmark" | CorrectFlash |
| unlock.json | LottieFiles.com — search "lock unlock" | LevelUp items |

All must be free/CC0 from lottiefiles.com.
Test each on both iOS and Android before using.

---

## Rules

1. **Ceremony first, data second** — user sees the celebration before any stats
2. **Never skip the animation** — even on slow devices, play it at reduced quality
3. **Sound and haptic fire at frame 0** — not after the animation starts
4. **Auto-dismiss streaks** — don't block the user, streak modal goes away on its own
5. **Confetti uses brand colors** — not random colors
6. **Level up is the biggest moment** — it should feel like a video game achievement
7. **Always show what was unlocked** — user needs to know the reward was worth it
