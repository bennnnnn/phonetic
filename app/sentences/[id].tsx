import { useMemo, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Speech from 'expo-speech'
import { useLesson } from '@/hooks/useLesson'
import { haptics } from '@/lib/haptics'
import { ROUTES } from '@/lib/routes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import type { Word } from '@/lib/types'
import SegmentedStepBar from '@/components/ui/SegmentedStepBar'

function normWord(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Leading non-letters, core letters/digits, trailing punctuation. */
function splitToken(raw: string): { lead: string; core: string; trail: string } {
  let i = 0
  while (i < raw.length && !/[a-zA-Z0-9]/.test(raw[i]!)) i++
  const lead = raw.slice(0, i)
  let j = raw.length
  while (j > i && !/[a-zA-Z0-9]/.test(raw[j - 1]!)) j--
  const core = raw.slice(i, j)
  const trail = raw.slice(j)
  return { lead, core, trail }
}

/** Short, readable practice lines built only from this lesson’s words. */
function buildPracticeSentences(words: Word[]): string[] {
  if (words.length === 0) return []
  const t = words.map((w) => w.text)
  const out: string[] = []
  out.push(`Can you read this word: ${t[0]}?`)
  if (t.length >= 2) {
    out.push(`Look at ${t[0]} and ${t[1]}. Say each one slowly.`)
  }
  if (t.length >= 3) {
    out.push(`Now read: ${t[0]}, ${t[1]}, and ${t[2]}.`)
  }
  if (t.length >= 4) {
    out.push(`Try these together: ${t.slice(0, 4).join(', ')}.`)
  }
  if (t.length >= 5) {
    out.push(`Great work with ${t[4]} and the rest of the family!`)
  }
  return out.slice(0, 5)
}

function HighlightedSentence({
  sentence,
  wordByNorm,
  onWordTap,
}: {
  sentence: string
  wordByNorm: Map<string, Word>
  onWordTap: (word: Word) => void
}) {
  const tokens = sentence.split(/\s+/).filter(Boolean)

  return (
    <Text style={styles.sentenceBlock}>
      {tokens.map((raw, i) => {
        const { lead, core, trail } = splitToken(raw)
        const key = `${i}-${raw}`
        const w = core ? wordByNorm.get(normWord(core)) : undefined

        if (!w) {
          return (
            <Text key={key} style={styles.sentencePlain}>
              {i > 0 ? ' ' : ''}
              {raw}
            </Text>
          )
        }

        return (
          <Text key={key}>
            {i > 0 ? ' ' : ''}
            <Text style={styles.sentencePlain}>{lead}</Text>
            <Text
              onPress={() => onWordTap(w)}
              accessibilityRole="link"
              accessibilityLabel={`Definition for ${w.text}`}
              style={styles.sentenceWordWrap}
            >
              <Text style={{ fontFamily: 'Georgia' }}>
                <Text style={styles.consonantInSentence}>{w.consonant}</Text>
                <Text style={styles.patternInSentence}>{w.pattern}</Text>
              </Text>
            </Text>
            <Text style={styles.sentencePlain}>{trail}</Text>
          </Text>
        )
      })}
    </Text>
  )
}

export default function SentencesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { lesson, loading, error } = useLesson(id)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [tappedWord, setTappedWord] = useState<Word | null>(null)

  const words = lesson?.word_family?.words ?? []
  const wordByNorm = useMemo(() => {
    const m = new Map<string, Word>()
    for (const w of words) {
      m.set(normWord(w.text), w)
    }
    return m
  }, [words])

  const sentences = useMemo(() => buildPracticeSentences(words), [words])
  const sentenceText = sentences[sentenceIndex] ?? ''
  const isLast = sentences.length > 0 && sentenceIndex === sentences.length - 1

  const lessonTitle = lesson?.title ?? 'Lesson'

  const handleWordTap = (word: Word) => {
    setTappedWord((prev) => (prev?.id === word.id ? null : word))
    haptics.tap()
  }

  const handleHear = () => {
    if (sentenceText) Speech.speak(sentenceText, { language: 'en-US', rate: 0.92 })
    haptics.tap()
  }

  const handleNext = () => {
    if (isLast) {
      router.push(ROUTES.QUIZ(id))
    } else {
      setSentenceIndex((idx) => Math.min(idx + 1, Math.max(0, sentences.length - 1)))
      setTappedWord(null)
      haptics.interact()
    }
  }

  const handleBack = () => {
    if (sentenceIndex === 0) {
      router.back()
    } else {
      setSentenceIndex((idx) => idx - 1)
      setTappedWord(null)
    }
  }

  if (loading && !lesson) {
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

  if (error || !lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error ?? 'Lesson not found.'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.hearBtn}>
            <Text style={styles.hearBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (sentences.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.lessonTitle} numberOfLines={1}>
            {lessonTitle}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>No words in this lesson yet. Add words in Supabase, then try again.</Text>
        </View>
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
          <Text style={styles.lessonTitle} numberOfLines={1}>
            {lessonTitle}
          </Text>
          <SegmentedStepBar current={2} />
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {sentenceIndex + 1} of {sentences.length}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.counter}>
            sentence {sentenceIndex + 1} of {sentences.length}
          </Text>

          <HighlightedSentence sentence={sentenceText} wordByNorm={wordByNorm} onWordTap={handleWordTap} />

          {tappedWord ? (
            <View style={styles.hintStrip}>
              <Text style={styles.hintWord}>{tappedWord.text}</Text>
              <Text style={styles.hintSep}> · </Text>
              <Text style={styles.hintDef} numberOfLines={4}>
                {tappedWord.definition}
              </Text>
            </View>
          ) : (
            <View style={[styles.hintStrip, styles.hintStripMuted]}>
              <Text style={styles.hintMuted}>Tap a teal word for its definition</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.hearBtn}
            onPress={handleHear}
            accessibilityRole="button"
            accessibilityLabel="Hear the sentence"
          >
            <Ionicons name="volume-medium" size={18} color={colors.primary} />
            <Text style={styles.hearBtnText}>hear the sentence</Text>
          </TouchableOpacity>

          <View style={styles.dots}>
            {sentences.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i < sentenceIndex && styles.dotDone, i === sentenceIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBack}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Previous sentence"
        >
          <Text style={styles.navBackText}>← back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navNext}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Go to quiz' : 'Next sentence'}
        >
          <Text style={styles.navNextText}>{isLast ? 'go to quiz →' : 'next sentence →'}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  backBtn: { padding: spacing.xs },
  headerCenter: { flex: 1, alignItems: 'center', gap: spacing.xs },
  lessonTitle: { fontSize: fontSize.md, fontWeight: '500', color: colors.text },
  countBadge: {
    backgroundColor: colors.neutral,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  countBadgeText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.neutral,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  counter: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sentenceBlock: {
    fontSize: fontSize.xl,
    lineHeight: 32,
    color: colors.text,
  },
  sentencePlain: {
    fontSize: fontSize.xl,
    lineHeight: 32,
    color: colors.text,
    fontWeight: '400',
  },
  sentenceWordWrap: {
    fontSize: fontSize.xl,
    lineHeight: 32,
    textDecorationLine: 'underline',
    textDecorationColor: colors.primaryMid,
  },
  consonantInSentence: {
    color: colors.consonant,
    fontSize: fontSize.xl,
    lineHeight: 32,
  },
  patternInSentence: {
    color: colors.pattern,
    fontSize: fontSize.xl,
    lineHeight: 32,
  },
  hintStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  hintWord: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.primaryDark,
    fontFamily: 'Georgia',
  },
  hintSep: { fontSize: fontSize.lg, color: colors.primaryMid, marginTop: 2 },
  hintDef: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.primaryDeep,
    lineHeight: 22,
  },
  hintStripMuted: { justifyContent: 'center', alignItems: 'center' },
  hintMuted: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center' },
  hearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primaryMid,
    backgroundColor: colors.surface,
  },
  hearBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primaryMid },
  dotDone: { backgroundColor: colors.primary },
  nav: {
    flexDirection: 'row',
    gap: 11,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  navBack: {
    flex: 1,
    backgroundColor: colors.neutral,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  navBackText: { color: colors.textMuted, fontSize: fontSize.md, fontWeight: '500' },
  navNext: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  navNextText: { color: '#fff', fontSize: fontSize.md, fontWeight: '500' },
})
