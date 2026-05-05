# Skill: Delight System

This is the most important skill in the codebase.
Every 5-star review comes from how the app *feels*, not just what it does.
Read this before building any screen, component, or interaction.

---

## The 3 Layers of Delight

Every meaningful moment in the app has 3 simultaneous layers:
1. **Visual** — animation on screen
2. **Audio** — a sound effect
3. **Haptic** — physical feedback in the hand

Never do just one. Always combine all three.

---

## Sound Design System (/lib/sounds.ts)

```typescript
import { Audio } from 'expo-av'

// Sound file map — all files live in /assets/sounds/
// File format: .mp3, mono, 44.1kHz, normalized to -14 LUFS
const SOUND_MAP = {
  // Positive feedback
  correct:        require('@/assets/sounds/correct.mp3'),       // bright ding, 0.4s
  perfect:        require('@/assets/sounds/perfect.mp3'),       // chord swell, 1.2s
  levelUp:        require('@/assets/sounds/level-up.mp3'),      // ascending fanfare, 2s
  streakContinue: require('@/assets/sounds/streak.mp3'),        // whoosh + sparkle, 1s
  lessonComplete: require('@/assets/sounds/lesson-complete.mp3'),// celebratory chime, 2.5s
  xpEarned:       require('@/assets/sounds/xp-earn.mp3'),       // coin collect, 0.3s
  wordRevealed:   require('@/assets/sounds/reveal.mp3'),        // soft pop, 0.2s
  cardFlip:       require('@/assets/sounds/flip.mp3'),          // paper flip, 0.15s

  // Negative feedback (gentle — never punishing)
  wrong:          require('@/assets/sounds/wrong.mp3'),         // soft thud, 0.3s
  tryAgain:       require('@/assets/sounds/try-again.mp3'),     // gentle buzz, 0.4s

  // Navigation / UI
  tap:            require('@/assets/sounds/tap.mp3'),           // soft click, 0.1s
  swipe:          require('@/assets/sounds/swipe.mp3'),         // whoosh, 0.2s
  unlock:         require('@/assets/sounds/unlock.mp3'),        // satisfying click, 0.5s
  modalOpen:      require('@/assets/sounds/modal-open.mp3'),    // soft rise, 0.3s

  // Onboarding
  welcome:        require('@/assets/sounds/welcome.mp3'),       // warm chime, 1.5s
  onboardStep:    require('@/assets/sounds/onboard-step.mp3'),  // light ping, 0.2s
}

type SoundKey = keyof typeof SOUND_MAP

class SoundEngine {
  private cache: Map<SoundKey, Audio.Sound> = new Map()
  private muted = false

  async preload(keys: SoundKey[]) {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
    })
    await Promise.all(keys.map(key => this.load(key)))
  }

  private async load(key: SoundKey) {
    if (this.cache.has(key)) return
    const { sound } = await Audio.Sound.createAsync(SOUND_MAP[key], {
      shouldPlay: false,
      volume: 1.0,
    })
    this.cache.set(key, sound)
  }

  async play(key: SoundKey, volume = 1.0) {
    if (this.muted) return
    try {
      let sound = this.cache.get(key)
      if (!sound) {
        await this.load(key)
        sound = this.cache.get(key)!
      }
      await sound.setPositionAsync(0)
      await sound.setVolumeAsync(volume)
      await sound.playAsync()
    } catch {
      // Sound failure should never crash the app
    }
  }

  setMuted(muted: boolean) { this.muted = muted }

  async unloadAll() {
    for (const sound of this.cache.values()) {
      await sound.unloadAsync()
    }
    this.cache.clear()
  }
}

export const soundEngine = new SoundEngine()
```

---

## Haptic Patterns (/lib/haptics.ts)

```typescript
import * as Haptics from 'expo-haptics'

export const haptics = {
  // Light — tap, select, small interactions
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  // Medium — word revealed, card tap, step advance
  interact: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  // Heavy — correct answer, level complete, major milestone
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  // Error — wrong answer (gentle)
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  // Warning — hint used, time low
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  // Celebration sequence — fires 3 pulses in rhythm
  celebrate: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    await new Promise(r => setTimeout(r, 100))
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await new Promise(r => setTimeout(r, 80))
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  },

  // Streak pulse — rhythmic double tap
  streak: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await new Promise(r => setTimeout(r, 120))
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  },
}
```

---

## Moment Library — Every Delight Moment Defined

### 1. Correct Answer

```typescript
// Trigger: user selects right quiz option
import { soundEngine } from '@/lib/sounds'
import { haptics } from '@/lib/haptics'
import Animated, { withSequence, withSpring, useSharedValue } from 'react-native-reanimated'

const onCorrectAnswer = async () => {
  // All three layers simultaneously
  haptics.success()
  soundEngine.play('correct')

  // Visual: button bounces green
  scale.value = withSequence(
    withSpring(1.15, { damping: 4 }),
    withSpring(1.0, { damping: 10 })
  )
  // Then: green checkmark fades in over the button
  // Then: +XP pill floats up and fades out (see XpPop component)
}
```

### 2. Wrong Answer

```typescript
// Trigger: user selects wrong quiz option
const onWrongAnswer = async () => {
  haptics.error()
  soundEngine.play('wrong', 0.6)   // quieter — not punishing

  // Visual: button shakes side to side
  translateX.value = withSequence(
    withSpring(-8), withSpring(8),
    withSpring(-6), withSpring(6),
    withSpring(0)
  )
  // Then: red tint fades in, correct answer highlights green
}
```

### 3. Word Revealed (Word Bank tap)

```typescript
const onWordRevealed = async () => {
  haptics.interact()
  soundEngine.play('wordRevealed')

  // Visual: card flips (Y-axis rotation) revealing definition
  rotateY.value = withSpring(180, { damping: 12 })
}
```

### 4. Audio Button Tap

```typescript
const onAudioTap = async () => {
  haptics.tap()
  soundEngine.play('tap', 0.3)   // very subtle — TTS is the main audio
  // Then plays the word audio
}
```

### 5. Step Complete (advance to next lesson step)

```typescript
const onStepComplete = async () => {
  haptics.success()
  soundEngine.play('correct')

  // Visual: progress bar fills with spring animation
  // Step indicator pulses and turns solid teal
  // Next step slides in from right
}
```

### 6. Lesson Complete 🎉

```typescript
const onLessonComplete = async (score: number) => {
  haptics.celebrate()
  soundEngine.play('lessonComplete')

  // Visual sequence (800ms total):
  // 1. Score number counts up from 0 (spring easing)
  // 2. XP badge flies in from bottom
  // 3. Confetti explosion (Lottie)
  // 4. Stars fill in one by one (based on score)
  // 5. "Continue" button fades in last
}
```

### 7. Streak Milestone

```typescript
const onStreakMilestone = async (days: number) => {
  haptics.streak()
  soundEngine.play('streakContinue')

  // Visual: flame icon pulses and glows
  // "X day streak!" badge slides up from bottom
  // Number increments with satisfying spring
}
```

### 8. Level Up

```typescript
const onLevelUp = async (newLevel: number) => {
  haptics.celebrate()
  soundEngine.play('levelUp')

  // Visual: full-screen moment
  // Background pulses with radial burst
  // "Level X" text scales in from 0
  // Unlocked content list animates in staggered
}
```

### 9. XP Earned Pop (reusable component)

```typescript
// /components/ui/XpPop.tsx
// Floats up above the triggering element and fades out
// Usage: <XpPop amount={10} visible={showXp} onComplete={() => setShowXp(false)} />

import Animated, {
  useSharedValue, withTiming, withSequence,
  withDelay, useAnimatedStyle, runOnJS
} from 'react-native-reanimated'

export default function XpPop({ amount, visible, onComplete }) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(0)

  useEffect(() => {
    if (!visible) return
    opacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withDelay(600, withTiming(0, { duration: 300 }))
    )
    translateY.value = withSequence(
      withTiming(-40, { duration: 800 }),
      withTiming(-60, { duration: 250 }, () => runOnJS(onComplete)())
    )
  }, [visible])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.Text style={[styles.xpText, style]}>
      +{amount} XP
    </Animated.Text>
  )
}
```

---

## Onboarding Delight Sequence

Onboarding must feel like the app is alive from second one.

```typescript
// /app/(auth)/onboarding/index.tsx
// Step-by-step sequence:

// Screen 1 — Welcome
// - App icon drops in with spring bounce
// - "Welcome to PhonicsFlow" fades in word by word
// - Subtle background pattern animates slowly
// - Sound: welcome chime plays at 0.8 volume
// - Haptic: single medium pulse

// Screen 2 — What you'll learn
// - Word pattern "_ake" draws itself on screen stroke by stroke (SVG animation)
// - Each example word pops in staggered: rake → bake → cake → lake
// - Each pop plays a tiny 'tap' sound
// - Haptic: light tap per word

// Screen 3 — How it works
// - 3 cards slide in from bottom staggered (150ms each)
// - Each card has a mini looping animation (listen → decode → speak)
// - Sound: onboard-step per card

// Screen 4 — Set your goal
// - "How many lessons per day?" selector
// - Each option taps + haptic on hover
// - Selected option bounces + plays 'unlock' sound

// Screen 5 — Name entry
// - Keyboard slides up naturally
// - Character counter animates as user types
// - "Let's go, [name]!" button pulses gently while idle

// Final transition
// - User taps "Let's go" → button expands to fill screen (like a portal)
// - Background color matches button (teal)
// - Home screen fades in through the teal
// - Sound: levelUp
// - Haptic: celebrate()
```

---

## Preloading Strategy

Preload sounds before they're needed — never let a sound play late.

```typescript
// /app/_layout.tsx — root layout
useEffect(() => {
  // Preload the most common sounds on app start
  soundEngine.preload([
    'correct', 'wrong', 'tap', 'wordRevealed',
    'correct', 'lessonComplete', 'xpEarned'
  ])
}, [])

// /app/lesson/[id].tsx — before lesson starts
useEffect(() => {
  soundEngine.preload(['correct', 'wrong', 'perfect', 'lessonComplete', 'xpEarned'])
}, [])

// /app/(auth)/onboarding/index.tsx
useEffect(() => {
  soundEngine.preload(['welcome', 'onboardStep', 'levelUp'])
}, [])
```

---

## Sound File Sourcing

Get these sounds from:
- **Freesound.org** — free, CC0 license, search "UI correct", "game ding", "coin collect"
- **Zapsplat.com** — free tier, high quality UI sounds
- **Pixabay sounds** — CC0, great for notification sounds
- **Custom / licensed SFX** — paid libraries or your own recordings for branded UI sounds
- **Adobe Audition free pack** — professional UI sound kit

File requirements:
- Format: MP3, 128kbps minimum
- Length: under 3 seconds for UI sounds
- Normalize to -14 LUFS
- Mono is fine for UI sounds

---

## Settings — User Controls

Always give users control. Some users (classrooms, quiet spaces) need to mute.

```typescript
// /store/settingsStore.ts
type SettingsStore = {
  soundEnabled: boolean
  hapticsEnabled: boolean
  setSoundEnabled: (v: boolean) => void
  setHapticsEnabled: (v: boolean) => void
}

// Check these before every sound/haptic call
// soundEngine checks this.muted internally
// haptics functions should check settingsStore.hapticsEnabled
```

In the Profile/Settings screen:
- Sound effects toggle (default: ON)
- Haptic feedback toggle (default: ON)
- Both save to Supabase user_profiles + AsyncStorage (offline)

---

## Rules

1. **Every correct answer gets all 3 layers** — visual + sound + haptic
2. **Wrong answers are gentle** — soft sound, no harsh buzz, never red flash the whole screen
3. **Onboarding must have sound from screen 1** — first impression is everything
4. **Never play sounds during TTS** — duck or wait
5. **Preload before the screen renders** — no delayed sounds
6. **Always respect user's mute/haptic settings**
7. **Lesson complete is a ceremony** — minimum 2 seconds, not just a score screen
8. **Streaks get their own moment** — never bury it in a stats screen
9. **XP always floats up visually** — user must see the reward accumulate
10. **Silence is wrong** — if a meaningful action has no sound, add one
