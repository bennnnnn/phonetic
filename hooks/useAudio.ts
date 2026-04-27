import { useState, useEffect, useRef, useCallback } from 'react'
import { Audio } from 'expo-av'
import * as Speech from 'expo-speech'
import { haptics } from '@/lib/haptics'
import { useSettingsStore } from '@/store/settingsStore'

type UseAudioReturn = {
  playing: boolean
  loading: boolean
  error: string | null
  play: (url: string, fallbackText?: string) => Promise<void>
  stop: () => Promise<void>
}

export function useAudio(): UseAudioReturn {
  const soundRef = useRef<Audio.Sound | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { hapticsEnabled } = useSettingsStore()

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    })
    return () => {
      soundRef.current?.unloadAsync()
    }
  }, [])

  const play = useCallback(async (url: string, fallbackText?: string) => {
    try {
      setLoading(true)
      setError(null)

      if (hapticsEnabled) haptics.tap()

      // Fallback to expo-speech if no URL
      if (!url && fallbackText) {
        setPlaying(true)
        Speech.speak(fallbackText, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.85,
          onDone: () => setPlaying(false),
          onError: () => setPlaying(false),
        })
        return
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync()
        soundRef.current = null
      }

      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true })
      soundRef.current = sound
      setPlaying(true)

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) setPlaying(false)
      })
    } catch {
      // If URL fails, try expo-speech as fallback
      if (fallbackText) {
        setPlaying(true)
        Speech.speak(fallbackText, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.85,
          onDone: () => setPlaying(false),
          onError: () => setPlaying(false),
        })
      } else {
        setError('Could not play audio')
        setPlaying(false)
      }
    } finally {
      setLoading(false)
    }
  }, [hapticsEnabled])

  const stop = useCallback(async () => {
    await soundRef.current?.stopAsync()
    Speech.stop()
    setPlaying(false)
  }, [])

  return { playing, loading, error, play, stop }
}
