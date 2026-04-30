import { useMemo, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Speech from 'expo-speech'
import { useGroupLesson } from '@/hooks/useGroupLesson'
import { useAudio } from '@/hooks/useAudio'
import { buildPracticeSentences, buildWordByNorm } from '@/lib/sentenceHelpers'
import { haptics } from '@/lib/haptics'
import { ROUTES } from '@/lib/routes'
import { WORD_THEMES, IRREGULAR_VERB_GROUPS, HOMOPHONE_GROUPS } from '@/lib/practiceThemes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import SegmentedStepBar from '@/components/ui/SegmentedStepBar'
import HighlightedSentence from '@/components/sentences/HighlightedSentence'
import ErrorState from '@/components/ui/ErrorState'
import type { Word } from '@/lib/types'

export default function GroupSentencesScreen() {
  const { theme } = useLocalSearchParams<{ theme: string }>()
  const { words, loading, error } = useGroupLesson(theme)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [tappedWord, setTappedWord] = useState<Word | null>(null)

  const themeData = WORD_THEMES[theme] ?? IRREGULAR_VERB_GROUPS[theme] ?? HOMOPHONE_GROUPS[theme]
  const title     = `${themeData?.emoji ?? '🗂'} ${theme}`

  const wordByNorm = useMemo(() => buildWordByNorm(words), [words])

  const sentences   = useMemo(() => buildPracticeSentences(words), [words])
  const sentenceText = sentences[sentenceIndex] ?? ''
  const isLast       = sentences.length > 0 && sentenceIndex === sentences.length - 1

  const { play: playTts } = useAudio()

  const handleWordTap = (word: Word) => {
    setTappedWord((prev) => (prev?.id === word.id ? null : word))
    haptics.tap()
  }

  const handleHear = () => {
    if (sentenceText) playTts('', sentenceText)
    haptics.tap()
  }

  const handleNext = () => {
    if (isLast) {
      // Homophones sound the same — skip the listen quiz, go straight to complete
      if (HOMOPHONE_GROUPS[theme]) {
        router.push(ROUTES.GROUP_COMPLETE(theme))
      } else {
        router.push(ROUTES.GROUP_QUIZ(theme))
      }
    } else {
      setSentenceIndex((idx) => Math.min(idx + 1, sentences.length - 1))
      setTappedWord(null)
      haptics.interact()
    }
  }

  const handleBack = () => {
    if (sentenceIndex === 0) router.back()
    else {
      setSentenceIndex((idx) => idx - 1)
      setTappedWord(null)
    }
  }

  if (loading && !words.length) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading sentences…</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || (!loading && !words.length)) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState message={error ?? 'No words found.'} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.lessonTitle} numberOfLines={1}>{title}</Text>
          <SegmentedStepBar current={2} />
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{sentenceIndex + 1} of {sentences.length}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.counter}>sentence {sentenceIndex + 1} of {sentences.length}</Text>

          <HighlightedSentence sentence={sentenceText} wordByNorm={wordByNorm} onWordTap={handleWordTap} />

          {tappedWord ? (
            <View style={styles.hintStrip}>
              <Text style={styles.hintWord}>{tappedWord.text}</Text>
              <Text style={styles.hintSep}> · </Text>
              <Text style={styles.hintDef} numberOfLines={4}>{tappedWord.definition}</Text>
            </View>
          ) : (
            <View style={[styles.hintStrip, styles.hintStripMuted]}>
              <Text style={styles.hintMuted}>Tap a teal word for its definition</Text>
            </View>
          )}

          <TouchableOpacity style={styles.hearBtn} onPress={handleHear} accessibilityRole="button">
            <Ionicons name="volume-medium" size={18} color={colors.primary} />
            <Text style={styles.hearBtnText}>hear the sentence</Text>
          </TouchableOpacity>

          <View style={styles.dots}>
            {sentences.map((_, i) => (
              <View key={i} style={[styles.dot, i < sentenceIndex && styles.dotDone, i === sentenceIndex && styles.dotActive]} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBack} onPress={handleBack} accessibilityRole="button">
          <Text style={styles.navBackText}>← back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navNext} onPress={handleNext} accessibilityRole="button">
          <Text style={styles.navNextText}>
            {isLast
              ? (HOMOPHONE_GROUPS[theme] ? 'done →' : 'go to quiz →')
              : 'next sentence →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  loadingText: { fontSize: fontSize.md, color: colors.textMuted },
  errorText: { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm,
    backgroundColor: colors.surface, gap: spacing.sm,
  },
  backBtn: { padding: spacing.xs },
  headerCenter: { flex: 1, alignItems: 'center', gap: spacing.xs },
  lessonTitle: { fontSize: fontSize.md, fontWeight: '500', color: colors.text },
  countBadge: {
    backgroundColor: colors.neutral, borderRadius: radius.full,
    paddingVertical: 4, paddingHorizontal: 10,
  },
  countBadgeText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  card: {
    backgroundColor: colors.neutral, borderRadius: 20,
    padding: spacing.lg, gap: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  counter: {
    fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  sentenceBlock: { fontSize: fontSize.xl, lineHeight: 32, color: colors.text },
  sentencePlain: { fontSize: fontSize.xl, lineHeight: 32, color: colors.text, fontWeight: '400' },
  sentenceWordWrap: {
    fontSize: fontSize.xl, lineHeight: 32,
    textDecorationLine: 'underline', textDecorationColor: colors.primaryMid,
  },
  consonantInSentence: { color: colors.consonant, fontSize: fontSize.xl, lineHeight: 32 },
  patternInSentence:   { color: colors.pattern,   fontSize: fontSize.xl, lineHeight: 32 },
  hintStrip: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md,
  },
  hintWord: { fontSize: fontSize.lg, fontWeight: '600', color: colors.primaryDark, fontFamily: 'Georgia' },
  hintSep:  { fontSize: fontSize.lg, color: colors.primaryMid, marginTop: 2 },
  hintDef:  { flex: 1, fontSize: fontSize.md, color: colors.primaryDeep, lineHeight: 22 },
  hintStripMuted: { justifyContent: 'center', alignItems: 'center' },
  hintMuted: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center' },
  hearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    alignSelf: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.primaryMid,
    backgroundColor: colors.surface,
  },
  hearBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primaryMid },
  dotDone:   { backgroundColor: colors.primary },
  nav: {
    flexDirection: 'row', gap: 11,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.sm,
  },
  navBack: {
    flex: 1, backgroundColor: colors.neutral, borderRadius: 14,
    paddingVertical: 13, alignItems: 'center',
  },
  navBackText: { color: colors.textMuted, fontSize: fontSize.md, fontWeight: '500' },
  navNext: {
    flex: 2, backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 13, alignItems: 'center',
  },
  navNextText: { color: '#fff', fontSize: fontSize.md, fontWeight: '500' },
})
