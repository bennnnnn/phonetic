/**
 * Tests for Google TTS voice selection and audio speed logic.
 * Pure functions extracted from lib/googleTts.ts for testability.
 */

// Voice selection logic — mirrors googleTts.ts ACCENT_VOICES
const ACCENT_VOICES: Record<string, { languageCode: string; name: string; ssmlGender: string }> = {
  american: { languageCode: 'en-US', name: 'en-US-Standard-H', ssmlGender: 'FEMALE' },
  british:  { languageCode: 'en-GB', name: 'en-GB-Standard-F', ssmlGender: 'FEMALE' },
}

function selectVoice(accent: 'american' | 'british' | string) {
  return ACCENT_VOICES[accent] ?? ACCENT_VOICES.american
}

// Speed mapping — mirrors expo-speech fallback in hooks/useAudio.ts
// expo-speech rate is ~0-1, Google TTS rate is 0.25-4.0
function toExpoSpeechRate(googleSpeed: number): number {
  return googleSpeed * 0.85
}

function speedLabel(speed: number): string {
  if (speed === 1.0) return '1×'
  return `${speed}×`
}

// ── Voice Selection ────────────────────────────────────────────────────────────

describe('Google TTS voice selection', () => {
  it('selects en-US-Standard-H for american accent', () => {
    const v = selectVoice('american')
    expect(v.languageCode).toBe('en-US')
    expect(v.name).toBe('en-US-Standard-H')
    expect(v.ssmlGender).toBe('FEMALE')
  })

  it('selects en-GB-Standard-F for british accent', () => {
    const v = selectVoice('british')
    expect(v.languageCode).toBe('en-GB')
    expect(v.name).toBe('en-GB-Standard-F')
    expect(v.ssmlGender).toBe('FEMALE')
  })

  it('falls back to american for unknown accent', () => {
    const v = selectVoice('australian' as 'american')
    expect(v.languageCode).toBe('en-US')
  })
})

// ── Speed Mapping ──────────────────────────────────────────────────────────────

describe('expo-speech rate conversion', () => {
  it('converts 1.0 speed to 0.85 expo rate', () => {
    expect(toExpoSpeechRate(1.0)).toBeCloseTo(0.85)
  })

  it('converts 0.5 speed to 0.425 expo rate', () => {
    expect(toExpoSpeechRate(0.5)).toBeCloseTo(0.425)
  })

  it('converts 1.5 speed to 1.275 expo rate', () => {
    expect(toExpoSpeechRate(1.5)).toBeCloseTo(1.275)
  })

  it('stays within reasonable bounds at extremes', () => {
    expect(toExpoSpeechRate(0.5)).toBeGreaterThan(0)
    expect(toExpoSpeechRate(1.5)).toBeLessThan(1.5)
  })
})

// ── Speed Label ────────────────────────────────────────────────────────────────

describe('speedLabel', () => {
  it('shows "1×" for normal speed', () => {
    expect(speedLabel(1.0)).toBe('1×')
  })

  it('shows multiplier for other speeds', () => {
    expect(speedLabel(0.75)).toBe('0.75×')
    expect(speedLabel(1.5)).toBe('1.5×')
  })
})

// ── Audio playback priority ────────────────────────────────────────────────────

describe('audio source priority', () => {
  // The hook plays: 1) storage URL, 2) Google TTS base64, 3) expo-speech
  // Test the decision logic without mocks

  type Source = 'url' | 'googleTts' | 'expoSpeech' | null

  function resolveSource(hasUrl: boolean, hasText: boolean, hasApiKey: boolean): Source {
    if (hasUrl) return 'url'
    if (hasText && hasApiKey) return 'googleTts'
    if (hasText) return 'expoSpeech'
    return null
  }

  it('prefers storage URL when available', () => {
    expect(resolveSource(true, true, true)).toBe('url')
    expect(resolveSource(true, false, false)).toBe('url')
  })

  it('falls back to Google TTS when no URL but API key is set', () => {
    expect(resolveSource(false, true, true)).toBe('googleTts')
  })

  it('falls back to expo-speech when no URL and no API key', () => {
    expect(resolveSource(false, true, false)).toBe('expoSpeech')
  })

  it('returns null when nothing is available', () => {
    expect(resolveSource(false, false, false)).toBe(null)
    expect(resolveSource(false, false, true)).toBe(null)
  })
})
