/**
 * Sound engine — manages playback of UI sound effects.
 *
 * Sound files are not yet added to /assets/sounds/.
 * This module gracefully no-ops until MP3 files are placed there
 * and the SOUND_MAP is updated with require() calls.
 *
 * To enable sounds:
 *   1. Add .mp3 files to /assets/sounds/
 *   2. Update SOUND_MAP below with require() paths
 *   3. The engine handles preloading and playback automatically
 */

class SoundEngine {
  private muted = false

  async preload(_keys: string[]) {
    // Sound files not yet added — no-op until then
  }

  async play(_key: string, _volume = 1.0) {
    if (this.muted) return
    // Sound files not yet added — no-op until then
  }

  setMuted(muted: boolean) {
    this.muted = muted
  }

  async unloadAll() {
    // No-op until sounds exist
  }
}

export const soundEngine = new SoundEngine()
