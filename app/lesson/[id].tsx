import { useState, useEffect } from 'react'
import { View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withSequence,
} from 'react-native-reanimated'
import { useLesson } from '@/hooks/useLesson'
import { useLessonStore } from '@/store/lessonStore'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'
import { ROUTES } from '@/lib/routes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import AudioButton from '@/components/lesson/AudioButton'
import QueueStrip from '@/components/lesson/QueueStrip'
import type { Word } from '@/lib/types'
import SegmentedStepBar from '@/components/ui/SegmentedStepBar'

// ── Word focus card — slides in from right on each mount ─────────────────────

function WordFocusCard({ word, onMaster, onSkip }: { word: Word; onMaster: () => void; onSkip: () => void }) {
  // Entry animation — triggered once on mount (key={currentIndex} drives remount)
  const tx  = useSharedValue(60)
  const op  = useSharedValue(0)
  const skipScale   = useSharedValue(1)
  const masterScale = useSharedValue(1)

  useEffect(() => {
    tx.value = withSpring(0, { damping: 18, stiffness: 200 })
    op.value = withTiming(1, { duration: 180 })
  }, [])

  const cardStyle  = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateX: tx.value }] }))
  const skipStyle  = useAnimatedStyle(() => ({ transform: [{ scale: skipScale.value }] }))
  const masterStyle = useAnimatedStyle(() => ({ transform: [{ scale: masterScale.value }] }))

  const handleSkipPress = () => {
    skipScale.value = withSequence(
      withSpring(0.93, { damping: 8, stiffness: 400 }),
      withSpring(1,    { damping: 10, stiffness: 300 }),
    )
    onSkip()
  }

  const handleMasterPress = () => {
    masterScale.value = withSequence(
      withSpring(0.93, { damping: 8, stiffness: 400 }),
      withSpring(1,    { damping: 10, stiffness: 300 }),
    )
    onMaster()
  }

  return (
    <Animated.View style={[styles.focusCard, cardStyle]}>
      <View style={styles.focusTop}>
        <View style={styles.wordDisplay}>
          <Text style={styles.wordText}>
            <Text style={styles.consonant}>{word.consonant}</Text>
            <Text style={styles.pattern}>{word.pattern}</Text>
          </Text>
          <Text style={styles.phoneme}>{word.phoneme}</Text>
          <Text style={styles.definition}>{word.definition}</Text>
        </View>
        <AudioButton
          audioUrl={word.audio_url}
          fallbackText={word.text}
          size="lg"
          accessibilityLabel={`Hear ${word.text}`}
        />
      </View>

      <View style={styles.actionRow}>
        <Animated.View style={[{ flex: 1 }, skipStyle]}>
          <Pressable
            style={styles.skipBtn}
            onPress={handleSkipPress}
            accessibilityRole="button"
            accessibilityLabel="Skip this word"
          >
            <Text style={styles.skipBtnText}>skip</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={[{ flex: 1 }, masterStyle]}>
          <Pressable
            style={styles.masterBtn}
            onPress={handleMasterPress}
            accessibilityRole="button"
            accessibilityLabel="Got it, word mastered"
          >
            <Text style={styles.masterBtnText}>got it ✓</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { lesson, loading, error, refetch } = useLesson(id)
  const { masterWord, skipWord, wordsMastered, wordsSkipped, startLesson } = useLessonStore()
  const [currentIndex, setCurrentIndex] = useState(0)

  const words: Word[] = (lesson?.word_family?.words ?? []).sort((a, b) => a.text.localeCompare(b.text))

  useEffect(() => {
    if (lesson) startLesson(id)
  }, [id, lesson?.id])

  const currentWord = words[currentIndex] ?? null
  const isComplete  = currentIndex >= words.length

  const handleMaster = () => {
    if (!currentWord) return
    masterWord(currentWord.id)
    haptics.success()
    soundEngine.play('wordRevealed')
    setCurrentIndex((i) => i + 1)
  }

  const handleSkip = () => {
    if (!currentWord) return
    skipWord(currentWord.id)
    haptics.tap()
    setCurrentIndex((i) => i + 1)
  }

  const handleContinue = () => router.push(ROUTES.SENTENCES(id))

  const handleWordSelect = (wordId: string) => {
    const idx = words.findIndex((w) => w.id === wordId)
    if (idx >= 0) setCurrentIndex(idx)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.skeletonContainer}>
          <Skeleton width="100%" height={300} borderRadius={20} />
          <Skeleton width="100%" height={56} borderRadius={14} />
          <Skeleton width="100%" height={56} borderRadius={14} />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState message={error ?? 'Lesson not found'} onRetry={refetch} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
          <SegmentedStepBar current={1} />
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{Math.min(currentIndex + 1, words.length)}/{words.length}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isComplete ? (
          <CompleteBanner
            mastered={wordsMastered.length}
            skipped={wordsSkipped.length}
            onContinue={handleContinue}
          />
        ) : currentWord ? (
          // key forces remount → triggers the slide-in animation each time
          <WordFocusCard key={currentIndex} word={currentWord} onMaster={handleMaster} onSkip={handleSkip} />
        ) : null}
      </View>

      {/* Queue Strip */}
      {!isComplete && words.length > 0 && (
        <QueueStrip
          words={words}
          currentId={currentWord?.id ?? ''}
          masteredIds={wordsMastered}
          skippedIds={wordsSkipped}
          onWordPress={handleWordSelect}
        />
      )}
    </SafeAreaView>
  )
}

// ── Complete banner — springs in ─────────────────────────────────────────────

function CompleteBanner({
  mastered, skipped, onContinue,
}: { mastered: number; skipped: number; onContinue: () => void }) {
  const scale = useSharedValue(0.8)
  const op    = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 140 })
    op.value    = withTiming(1, { duration: 220 })
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[styles.completeCard, style]}>
      <Text style={styles.completeTitle}>Word learning done! 🎉</Text>
      <Text style={styles.completeSub}>
        {mastered} mastered · {skipped} skipped
      </Text>
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityLabel="Continue to sentences"
      >
        <Text style={styles.continueBtnText}>Next: Sentences →</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral },
  skeletonContainer: { flex: 1, padding: spacing.lg, gap: spacing.md },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  headerCenter: { flex: 1, alignItems: 'center', gap: spacing.xs, minWidth: 0 },
  lessonTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  countBadge: {
    backgroundColor: colors.surface, borderRadius: radius.full,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  countText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },

  content: { flex: 1, padding: spacing.lg, justifyContent: 'flex-start' },

  // Word card
  focusCard: {
    backgroundColor: colors.surface,
    borderRadius: 24, padding: spacing.xl, gap: spacing.xl,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  focusTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  wordDisplay: { gap: spacing.sm, flex: 1 },
  wordText: { fontSize: fontSize.hero, fontFamily: 'Georgia', lineHeight: 64 },
  consonant: { color: colors.consonant },
  pattern:   { color: colors.pattern },
  phoneme:   { fontSize: fontSize.lg, color: colors.textMuted },
  definition: { fontSize: fontSize.md, color: colors.text, lineHeight: 22 },

  actionRow: { flexDirection: 'row', gap: spacing.sm },
  skipBtn: {
    backgroundColor: colors.neutral, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  skipBtnText: { fontSize: fontSize.md, color: colors.textMuted, fontWeight: '500' },
  masterBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  masterBtnText: { fontSize: fontSize.md, color: '#fff', fontWeight: '700' },

  // Complete banner
  completeCard: {
    backgroundColor: colors.surface, borderRadius: radius.xxl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.lg,
  },
  completeTitle: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, textAlign: 'center' },
  completeSub:   { fontSize: fontSize.md, color: colors.textMuted },
  continueBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
    alignItems: 'center', width: '100%',
  },
  continueBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },
})
