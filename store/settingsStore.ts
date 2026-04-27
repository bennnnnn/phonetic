import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

type SettingsStore = {
  soundEnabled: boolean
  hapticsEnabled: boolean
  notificationsEnabled: boolean
  audioSpeed: number  // 0.5 | 0.75 | 1.0 | 1.25 | 1.5
  accent: 'american' | 'british'
  dyslexiaFont: boolean
  largerText: boolean
  setSoundEnabled: (v: boolean) => void
  setHapticsEnabled: (v: boolean) => void
  setNotificationsEnabled: (v: boolean) => void
  setAudioSpeed: (v: number) => void
  setAccent: (v: 'american' | 'british') => void
  setDyslexiaFont: (v: boolean) => void
  setLargerText: (v: boolean) => void
}

const LEGACY_SPEED: Record<string, number> = { slow: 0.75, normal: 1.0, fast: 1.25 }

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      soundEnabled: true,
      hapticsEnabled: true,
      notificationsEnabled: true,
      audioSpeed: 1.0,
      accent: 'american',
      dyslexiaFont: false,
      largerText: false,
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setHapticsEnabled: (v) => set({ hapticsEnabled: v }),
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      setAudioSpeed: (v) => set({ audioSpeed: v }),
      setAccent: (v) => set({ accent: v }),
      setDyslexiaFont: (v) => set({ dyslexiaFont: v }),
      setLargerText: (v) => set({ largerText: v }),
    }),
    {
      name: 'phonicsflow-settings',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = (persistedState ?? {}) as Record<string, unknown>
        if (version < 2 && typeof state.audioSpeed === 'string') {
          state.audioSpeed = LEGACY_SPEED[state.audioSpeed as string] ?? 1.0
        }
        return state as SettingsStore
      },
    }
  )
)
