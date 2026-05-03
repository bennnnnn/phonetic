import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTranslation, prefetchTranslations } from '@/hooks/useTranslation'
import { useProfile } from '@/hooks/useProfile'
import { colors, fontSize } from '@/lib/tokens'

/**
 * Example sentence that reveals its translation on tap.
 * Translation shows inline below the sentence in system font (not italic).
 * Also alternates between available examples (sentence 1 ↔ sentence 2).
 * Only active when user has a non-English native_language set.
 * Use prefetchSentenceTranslations() ahead of time to warm the cache.
 */
export function prefetchSentenceTranslations(sentences: string[], langCode: string | null | undefined): void {
  if (!langCode || langCode === 'en' || !sentences.length) return
  prefetchTranslations(sentences, langCode)
}

export default function TappableTranslatedSentence({ sentence, sentences }: { sentence: string; sentences?: string[] }) {
  const { profile } = useProfile()
  const nativeLang = profile?.native_language
  const needsTranslation = nativeLang && nativeLang !== 'en'
  const { translation } = useTranslation(sentence, needsTranslation ? nativeLang : null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [currentSentence, setCurrentSentence] = useState(sentence)
  const altSentences = sentences ? sentences.filter((s) => s !== sentence) : []

  if (!needsTranslation) {
    return <Text style={styles.sentence}>{currentSentence}</Text>
  }

  const handleTap = () => {
    if (showTranslation) {
      // Hide translation and swap to alternative sentence if available
      setShowTranslation(false)
      if (altSentences.length > 0) {
        setCurrentSentence(altSentences[0]!)
      }
    } else {
      setShowTranslation(true)
    }
  }

  return (
    <View>
      <Pressable onPress={handleTap}>
        <Text style={styles.sentence}>{currentSentence}</Text>
      </Pressable>
      {showTranslation && translation && (
        <Text style={styles.translation}>{translation}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  sentence: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  translation: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    lineHeight: 22,
    marginTop: 2,
  },
})
