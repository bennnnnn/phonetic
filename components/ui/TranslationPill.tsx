import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useTranslation, prefetchTranslations } from '@/hooks/useTranslation'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { useProfile } from '@/hooks/useProfile'
import { SPEECH_LOCALES } from '@/lib/practiceThemes'

/**
 * Shows a translated version of a word in the user's native language.
 * Fetches from MyMemory API (free) on first load, caches in memory.
 * Pass `words` to `prefetchAll` to warm the cache for an entire list.
 */
export function usePrefetchWordTranslations(words: string[]) {
  const { profile } = useProfile()
  const nativeLang = profile?.native_language
  if (nativeLang && nativeLang !== 'en') {
    prefetchTranslations(words, nativeLang)
  }
}

export default function TranslationPill({ word }: { word: string }) {
  const { profile } = useProfile()
  const nativeLang = profile?.native_language
  const { translation, loading } = useTranslation(word, nativeLang)

  if (!nativeLang || nativeLang === 'en' || !translation) return null

  // Try to find a flag emoji for the language
  const langInfo = Object.entries(SPEECH_LOCALES).find(([, code]) => code.startsWith(nativeLang))
  const flag = langInfo ? getFlagEmoji(nativeLang) : ''

  return (
    <View style={styles.pill}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primaryMid} />
      ) : (
        <>
          {flag ? <Text style={styles.flag}>{flag}</Text> : null}
          <Text style={styles.text}>{translation}</Text>
        </>
      )}
    </View>
  )
}

function getFlagEmoji(langCode: string): string {
  const map: Record<string, string> = {
    es: '🇪🇸', fr: '🇫🇷', ar: '🇸🇦', am: '🇪🇹',
    pt: '🇵🇹', zh: '🇨🇳', hi: '🇮🇳', tr: '🇹🇷',
    ko: '🇰🇷', ja: '🇯🇵', de: '🇩🇪', it: '🇮🇹',
    ru: '🇷🇺', id: '🇮🇩', sw: '🇰🇪', so: '🇸🇴',
  }
  return map[langCode] ?? ''
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingVertical: 4, paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  flag: { fontSize: 14 },
  text: { fontSize: fontSize.sm, color: colors.primaryDark, fontWeight: '600' },
})
