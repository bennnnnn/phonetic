import { Audio } from 'expo-av'

// Sound files live in /assets/sounds/ — add real MP3s to enable
// Gracefully no-ops when files are missing
const SOUND_MAP: Record<string, number | null> = {
  correct: null,
  perfect: null,
  levelUp: null,
  streakContinue: null,
  lessonComplete: null,
  xpEarned: null,
  wordRevealed: null,
  cardFlip: null,
  wrong: null,
  tryAgain: null,
  tap: null,
  swipe: null,
  unlock: null,
  modalOpen: null,
  welcome: null,
  onboardStep: null,
}

type SoundKey = keyof typeof SOUND_MAP

class SoundEngine {
  private cache: Map<SoundKey, Audio.Sound> = new Map()
  private muted = false

  async preload(keys: SoundKey[]) {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
      })
    } catch {}
  }

  async play(key: SoundKey, volume = 1.0) {
    if (this.muted) return
    const module = SOUND_MAP[key]
    if (!module) return
    try {
      let sound = this.cache.get(key)
      if (!sound) {
        const { sound: loaded } = await Audio.Sound.createAsync(module as number, {
          shouldPlay: false,
          volume: 1.0,
        })
        this.cache.set(key, loaded)
        sound = loaded
      }
      await sound.setPositionAsync(0)
      await sound.setVolumeAsync(volume)
      await sound.playAsync()
    } catch {}
  }

  setMuted(muted: boolean) {
    this.muted = muted
  }

  async unloadAll() {
    for (const sound of this.cache.values()) {
      await sound.unloadAsync()
    }
    this.cache.clear()
  }
}

export const soundEngine = new SoundEngine()
