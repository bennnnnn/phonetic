const GOOGLE_TTS_BASE = 'https://texttospeech.googleapis.com/v1/text:synthesize'

type TTSVoice = {
  languageCode: string
  name: string
  ssmlGender: 'NEUTRAL' | 'FEMALE' | 'MALE'
}

const ACCENT_VOICES: Record<string, TTSVoice> = {
  american: { languageCode: 'en-US', name: 'en-US-Standard-H', ssmlGender: 'FEMALE' },
  british:  { languageCode: 'en-GB', name: 'en-GB-Standard-F', ssmlGender: 'FEMALE' },
}

/**
 * Generate TTS audio via Google Cloud Text-to-Speech API.
 * Returns a base64-encoded audio string (MP3).
 */
export async function googleTts(
  text: string,
  accent: 'american' | 'british' = 'american',
  speed: number = 1.0,
): Promise<string | null> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_TTS_API_KEY
  if (!apiKey) return null

  const voice = ACCENT_VOICES[accent] ?? ACCENT_VOICES.american

  try {
    const response = await fetch(`${GOOGLE_TTS_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice,
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speed,
          pitch: 0,
        },
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    return (data as { audioContent?: string }).audioContent ?? null
  } catch {
    return null
  }
}
