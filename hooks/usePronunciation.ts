import { useState, useRef, useCallback } from 'react'
import { Audio } from 'expo-av'
import { transcribeAudio } from '@/lib/whisper'

export type PronunciationState = 'idle' | 'recording' | 'processing' | 'correct' | 'wrong'

const MIN_RECORDING_MS = 400
const AUTO_STOP_MS = 5000

export function usePronunciation(targetWord: string) {
  const [state, setState] = useState<PronunciationState>('idle')
  const recRef = useRef<Audio.Recording | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef(0)
  // Use ref so the auto-stop timer always calls the latest stopRecording
  const stopRef = useRef<() => Promise<void>>(async () => {})

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  const stopRecording = useCallback(async () => {
    clearTimer()
    const rec = recRef.current
    if (!rec) return
    recRef.current = null

    const elapsed = Date.now() - startTimeRef.current
    setState('processing')

    try {
      await rec.stopAndUnloadAsync()
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true })

      if (elapsed < MIN_RECORDING_MS) {
        setState('idle')
        return
      }

      const uri = rec.getURI()
      if (!uri) { setState('idle'); return }

      const transcript = await transcribeAudio(uri)
      const target = targetWord.toLowerCase().trim()
      const words = transcript.split(/\s+/).map((w) => w.replace(/[^a-z'-]/g, ''))
      const matched = words.some((w) => w === target || w.startsWith(target) || target.startsWith(w))

      setState(matched ? 'correct' : 'wrong')
      setTimeout(() => setState('idle'), 2200)
    } catch {
      setState('wrong')
      setTimeout(() => setState('idle'), 2200)
    }
  }, [targetWord])

  // Keep ref current so auto-stop timer uses latest version
  stopRef.current = stopRecording

  const startRecording = useCallback(async () => {
    if (state !== 'idle') return
    try {
      const { granted } = await Audio.requestPermissionsAsync()
      if (!granted) return
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      recRef.current = recording
      startTimeRef.current = Date.now()
      setState('recording')
      timerRef.current = setTimeout(() => void stopRef.current(), AUTO_STOP_MS)
    } catch {
      setState('idle')
    }
  }, [state])

  const reset = useCallback(() => {
    clearTimer()
    recRef.current?.stopAndUnloadAsync().catch(() => {})
    recRef.current = null
    setState('idle')
  }, [])

  return { state, startRecording, stopRecording, reset }
}
