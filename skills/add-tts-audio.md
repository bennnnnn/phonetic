# Skill: Add TTS Audio (ElevenLabs)

Read this before adding any audio playback or generation to a component.

---

## Architecture Overview

```
Request audio for word
       ↓
Check Supabase storage for cached URL
       ↓
Found? → Play directly from URL
       ↓
Not found? → Call ElevenLabs API → Store in Supabase → Play
```

Never call ElevenLabs from the client at runtime for pre-existing words.
All lesson words are pre-generated via `/scripts/generate-audio.ts`.
ElevenLabs is only called live for user-generated content (e.g. pronunciation practice).

---

## ElevenLabs Client (/lib/elevenlabs.ts)

```typescript
const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1'
const VOICE_ID_AMERICAN = 'EXAVITQu4vr4xnSDxMaL'   // Sarah — clear, warm
const VOICE_ID_BRITISH  = 'onwK4e9ZLuTAKqWW03F9'   // Daniel — clear, neutral

type GenerateAudioOptions = {
  text: string
  slow?: boolean                    // use lower speed for learners
  accent?: 'american' | 'british'
}

export async function generateAudio(options: GenerateAudioOptions): Promise<ArrayBuffer> {
  const { text, slow = false, accent = 'american' } = options
  const voiceId = accent === 'british' ? VOICE_ID_BRITISH : VOICE_ID_AMERICAN

  const response = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.85,
        speed: slow ? 0.7 : 1.0,
      },
    }),
  })

  if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`)
  return response.arrayBuffer()
}
```

---

## Audio Playback Hook (/hooks/useAudio.ts)

```typescript
import { useState, useEffect, useRef, useCallback } from 'react'
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'

type UseAudioReturn = {
  playing: boolean
  loading: boolean
  error: string | null
  play: (url: string) => Promise<void>
  stop: () => Promise<void>
}

export function useAudio(): UseAudioReturn {
  const soundRef = useRef<Audio.Sound | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Configure audio session once
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,         // play even when phone is silenced
      shouldDuckAndroid: true,
    })
    return () => {
      soundRef.current?.unloadAsync()     // always unload on unmount
    }
  }, [])

  const play = useCallback(async (url: string) => {
    try {
      setLoading(true)
      setError(null)

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync()
        soundRef.current = null
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      )
      soundRef.current = sound
      setPlaying(true)

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false)
        }
      })
    } catch (err) {
      setError('Could not play audio')
      setPlaying(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const stop = useCallback(async () => {
    await soundRef.current?.stopAsync()
    setPlaying(false)
  }, [])

  return { playing, loading, error, play, stop }
}
```

---

## AudioButton Component (/components/lesson/AudioButton.tsx)

```typescript
import { Pressable, StyleSheet } from 'react-native'
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated'
import { useAudio } from '@/hooks/useAudio'
import { colors } from '@/lib/tokens'

type Props = {
  audioUrl: string
  size?: 'sm' | 'md' | 'lg'
  accessibilityLabel: string
}

export default function AudioButton({ audioUrl, size = 'md', accessibilityLabel }: Props) {
  const { play, playing, loading } = useAudio()
  const scale = useSharedValue(1)

  const handlePress = async () => {
    scale.value = withSpring(0.9, {}, () => { scale.value = withSpring(1) })
    await play(audioUrl)
  }

  const buttonSize = { sm: 36, md: 48, lg: 60 }[size]

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.button, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]}
        onPress={handlePress}
        disabled={loading}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ busy: loading }}
      >
        {/* Speaker icon — use your icon library here */}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
```

---

## Rules

1. **Always call `sound.unloadAsync()` on unmount** — memory leak otherwise
2. **Set `playsInSilentModeIOS: true`** — users expect a learning app to play audio even on silent
3. **Pre-cache all lesson audio** — never call ElevenLabs API live during a lesson
4. **Haptic feedback on play** — `ImpactFeedbackStyle.Light` feels satisfying
5. **Slow audio URL** — always provide a slow version for learners; store as `slow_audio_url` in DB
6. **Accent preference** — read from `userProfile.preferred_accent` before playing
7. **One sound at a time** — always unload previous sound before loading new one
