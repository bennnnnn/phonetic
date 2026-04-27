const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1'
const VOICE_ID_AMERICAN = 'EXAVITQu4vr4xnSDxMaL'
const VOICE_ID_BRITISH = 'onwK4e9ZLuTAKqWW03F9'

type GenerateAudioOptions = {
  text: string
  slow?: boolean
  accent?: 'american' | 'british'
}

export async function generateAudio(options: GenerateAudioOptions): Promise<ArrayBuffer> {
  const { text, slow = false, accent = 'american' } = options
  const voiceId = accent === 'british' ? VOICE_ID_BRITISH : VOICE_ID_AMERICAN

  const response = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.85,
        speed: slow ? 0.7 : 1.0,
      },
    }),
  })

  if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`)
  return response.arrayBuffer()
}
