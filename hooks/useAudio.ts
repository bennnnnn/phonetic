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
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { hapticsEnabled, audioSpeed, accent } = useSettingsStore()

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
      setPlaying(true)
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) setPlaying(false)
      })
      return
    }

    // Fallback to expo-speech (Google TTS API key not configured)
    setPlaying(true)
    Speech.speak(text, {
      language: accent === 'british' ? 'en-GB' : 'en-US',
      pitch: 1.0,
      rate: audioSpeed * 0.85, // expo-speech rate range is roughly 0-1
      onDone: () => setPlaying(false),
      onError: () => setPlaying(false),
    })
  }, [accent, audioSpeed])

  const play = useCallback(async (url: string, fallbackText?: string) => {
    try {
      setLoading(true)
      setError(null)

      if (hapticsEnabled) haptics.tap()

      if (url) {
        // Try playing the pre-recorded audio URL
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

        // If URL fails, fall through to TTS
        return
      }

      // No URL — use TTS (Google primary, expo-speech backup)
      if (fallbackText) {
        await speakWithSettings(fallbackText)
      } else {
        setError('No audio available')
        setPlaying(false)
      }
    } catch {
      // If URL playback fails, try TTS as fallback
      if (fallbackText) {
        await speakWithSettings(fallbackText)
      } else {
        setError('Could not play audio')
        setPlaying(false)
      }
    } finally {
      setLoading(false)
    }
  }, [hapticsEnabled, speakWithSettings])

  const stop = useCallback(async () => {
    await soundRef.current?.stopAsync()
    Speech.stop()
    setPlaying(false)
  }, [])

  return { playing, loading, error, play, stop }
}
