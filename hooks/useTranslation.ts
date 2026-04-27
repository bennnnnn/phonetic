import { useState, useEffect } from 'react'

// Session-level cache — survives re-renders, cleared on app restart
const cache = new Map<string, string>()

function cacheKey(word: string, langCode: string) {
  return `${langCode}:${word.toLowerCase()}`
}

const BASE_URL = 'https://api.mymemory.translated.net/get'

function fetchAndCache(word: string, langCode: string): Promise<void> {
  const key = cacheKey(word, langCode)
  if (cache.has(key)) return Promise.resolve()
  const url = `${BASE_URL}?q=${encodeURIComponent(word)}&langpair=en|${langCode}&de=bmecuriaw@gmail.com`
  return fetch(url)
    .then((r) => r.json())
    .then((data) => {
      const t: string = data?.responseData?.translatedText ?? ''
      if (t && t.toLowerCase() !== word.toLowerCase()) cache.set(key, t)
    })
    .catch(() => {})
}

// Fire-and-forget: warms the cache for an entire word list before cards are shown
export function prefetchTranslations(words: string[], langCode: string | null | undefined): void {
  if (!langCode || langCode === 'en') return
  for (const word of words) void fetchAndCache(word, langCode)
}

export function useTranslation(word: string, targetLang: string | null | undefined) {
  const [translation, setTranslation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!word || !targetLang || targetLang === 'en') {
      setTranslation(null)
      return
    }

    const key = cacheKey(word, targetLang)
    if (cache.has(key)) {
      setTranslation(cache.get(key)!)
      return
    }

    let cancelled = false
    setLoading(true)

    const url = `${BASE_URL}?q=${encodeURIComponent(word)}&langpair=en|${targetLang}&de=bmecuriaw@gmail.com`

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const t: string = data?.responseData?.translatedText ?? ''
        if (t && t.toLowerCase() !== word.toLowerCase()) {
          cache.set(key, t)
          setTranslation(t)
        } else {
          setTranslation(null)
        }
      })
      .catch(() => {
        if (!cancelled) setTranslation(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [word, targetLang])

  return { translation, loading }
}
