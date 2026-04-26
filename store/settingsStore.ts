import { create } from 'zustand'

type SettingsStore = {
  soundEnabled: boolean
  hapticsEnabled: boolean
  audioSpeed: 'slow' | 'normal' | 'fast'
  accent: 'american' | 'british'
  dyslexiaFont: boolean
  largerText: boolean
  setSoundEnabled: (v: boolean) => void
  setHapticsEnabled: (v: boolean) => void
  setAudioSpeed: (v: 'slow' | 'normal' | 'fast') => void
  setAccent: (v: 'american' | 'british') => void
  setDyslexiaFont: (v: boolean) => void
  setLargerText: (v: boolean) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  soundEnabled: true,
  hapticsEnabled: true,
  audioSpeed: 'normal',
  accent: 'american',
  dyslexiaFont: false,
  largerText: false,
  setSoundEnabled: (v) => set({ soundEnabled: v }),
  setHapticsEnabled: (v) => set({ hapticsEnabled: v }),
  setAudioSpeed: (v) => set({ audioSpeed: v }),
  setAccent: (v) => set({ accent: v }),
  setDyslexiaFont: (v) => set({ dyslexiaFont: v }),
  setLargerText: (v) => set({ largerText: v }),
}))
