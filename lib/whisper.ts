const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions'

export async function transcribeAudio(uri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY
  if (!apiKey) throw new Error('EXPO_PUBLIC_OPENAI_API_KEY not set')

  const formData = new FormData()
  formData.append('file', { uri, type: 'audio/m4a', name: 'speech.m4a' } as unknown as Blob)
  formData.append('model', 'whisper-1')
  formData.append('language', 'en')

  const res = await fetch(WHISPER_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })
  if (!res.ok) throw new Error(`Whisper ${res.status}`)
  const json = (await res.json()) as { text: string }
  return json.text.trim().toLowerCase()
}
