import { useState, useEffect, useRef, useCallback } from 'react'
import { Audio } from 'expo-av'
import * as Speech from 'expo-speech'
import { haptics } from '@/lib/haptics'
import { useSettingsStore } from '@/store/settingsStore'
import { googleTts } from '@/lib/googleTts'

type UseAudioReturn = {
  playing: boolean
  loading: boolean
  error: string | null
  play: (url: string, fallbackText?: string) => Promise<void>
  stop: () => Promise<void>
}

export function useAudio(): UseAudioReturn {
  const soundRef = useRef<Audio.Sound | null>(null)
  const mountedRef = useRef(true)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { hapticsEnabled, audioSpeed, accent } = useSettingsStore()

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

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

  const safeSet = useCallback((fn: () => void) => {
    if (mountedRef.current) fn()
  }, [])

  const speakWithSettings = useCallback(async (text: string) => {
    // Try Google TTS first (primary)
    const base64 = await googleTts(text, accent, audioSpeed)
    if (base64) {
      const uri = `data:audio/mp3;base64,${base64}`
      if (soundRef.current) {
        await soundRef.current.unloadAsync()
        soundRef.current = null
      }
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true })
      soundRef.current = sound
      safeSet(() => setPlaying(true))
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) safeSet(() => setPlaying(false))
      })
      return
    }

    // Fallback to expo-speech (Google TTS API key not configured)
    safeSet(() => setPlaying(true))
    Speech.speak(text, {
      language: accent === 'british' ? 'en-GB' : 'en-US',
      pitch: 1.0,
      rate: audioSpeed * 0.85,
      onDone: () => safeSet(() => setPlaying(false)),
      onError: () => safeSet(() => setPlaying(false)),
    })
  }, [accent, audioSpeed, safeSet])

  const play = useCallback(async (url: string, fallbackText?: string) => {
    try {
      safeSet(() => { setLoading(true); setError(null) })

      if (hapticsEnabled) haptics.tap()

      if (url) {
        if (soundRef.current) {
          await soundRef.current.unloadAsync()
          soundRef.current = null
        }

        const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true })
        soundRef.current = sound
        safeSet(() => setPlaying(true))

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) safeSet(() => setPlaying(false))
        })
        return
      }

      if (fallbackText) {
        await speakWithSettings(fallbackText)
      } else {
        safeSet(() => { setError('No audio available'); setPlaying(false) })
      }
    } catch {
      if (fallbackText) {
        await speakWithSettings(fallbackText)
      } else {
        safeSet(() => { setError('Could not play audio'); setPlaying(false) })
      }
    } finally {
      safeSet(() => setLoading(false))
    }
  }, [hapticsEnabled, speakWithSettings, safeSet])

  const stop = useCallback(async () => {
    await soundRef.current?.stopAsync()
    Speech.stop()
    safeSet(() => setPlaying(false))
  }, [safeSet])

  return { playing, loading, error, play, stop }
}
