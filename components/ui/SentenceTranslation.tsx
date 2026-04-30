import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

// Session-level cache for sentence translations
const sentenceCache = new Map<string, string>()
const BASE_URL = 'https://api.mymemory.translated.net/get'

type Props = {
  sentence: string
  langCode: string
}

/**
 * Translates an entire sentence and shows it in a pill below the sentence card.
 * Uses MyMemory API (same as TranslationPill).
 */
export default function SentenceTranslation({ sentence, langCode }: Props) {
  const [translation, setTranslation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!sentence || !langCode || langCode === 'en') {
      setTranslation(null)
      return
    }

    const key = `${langCode}:${sentence}`
    if (sentenceCache.has(key)) {
      setTranslation(sentenceCache.get(key)!)
      return
    }

    let cancelled = false
    setLoading(true)

    const url = `${BASE_URL}?q=${encodeURIComponent(sentence)}&langpair=en|${langCode}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const t: string = data?.responseData?.translatedText ?? ''
        if (t && t.toLowerCase() !== sentence.toLowerCase()) {
          sentenceCache.set(key, t)
          setTranslation(t)
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [sentence, langCode])

  if (!translation) return null

  return (
    <View style={styles.pill}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primaryMid} />
      ) : (
        <Text style={styles.text} numberOfLines={2}>{translation}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.primaryLight, borderRadius: radius.md,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  text: { fontSize: fontSize.sm, color: colors.primaryDark, fontWeight: '500', lineHeight: 18 },
})
