import { useMemo, useCallback, useEffect, useRef, memo } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity, Pressable,
  StyleSheet, Alert, RefreshControl, ActivityIndicator,
  useWindowDimensions,
} from 'react-native'
import { Stack, router, useFocusEffect } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay, withRepeat, withSequence,
} from 'react-native-reanimated'
import { useProgress } from '@/hooks/useProgress'
import { useProfile } from '@/hooks/useProfile'
import { useLessonDirectory, type LessonDirectoryItem } from '@/hooks/useLessonDirectory'
import { ROUTES } from '@/lib/routes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { progressForLesson } from '@/lib/lessonProgress'
import { NODE_SIZE, NODE_GAP, NODE_STEP, INITIAL_TOP, DOT_SIZE, WAVE, PALETTE, buildDots } from '@/lib/pathLayout'
import ErrorState from '@/components/ui/ErrorState'
import type { UserProgress } from '@/lib/types'

// ── Stars ─────────────────────────────────────────────────────────────────────

function starsFor(prog: UserProgress | undefined, wordCount: number, done: boolean): number {
  if (done) return 3
  const m = prog?.words_mastered?.length ?? 0
  if (m === 0) return 0
  return m < wordCount / 2 ? 1 : 2
}

function Stars({ filled }: { filled: number }) {
  return (
    <View style={styles.starsRow}>
      {[0, 1, 2].map((i) => (
        <Ionicons
          key={i}
          name={i < filled ? 'star' : 'star-outline'}
          size={11}
          color={i < filled ? '#FFD700' : 'rgba(255,255,255,0.4)'}
        />
      ))}
    </View>
  )
}

// ── Lesson node ───────────────────────────────────────────────────────────────

type NodeProps = {
  lesson: LessonDirectoryItem
  index: number; left: number; top: number
  done: boolean; unlocked: boolean; isCurrent: boolean; stars: number
  onPress: () => void
}

const LessonNode = memo(function LessonNode({
  lesson, index, left, top, done, unlocked, isCurrent, stars, onPress,
}: NodeProps) {
  const pressed   = useSharedValue(0)
  const opacity   = useSharedValue(0)
  const glowScale = useSharedValue(1)

  const palette = done
    ? { bg: colors.primary, shadow: colors.primaryDark }
    : unlocked ? PALETTE[index % PALETTE.length]! : { bg: '#C5C3BC', shadow: '#9C9A92' }

  useEffect(() => {
    opacity.value = withDelay(index * 55, withTiming(1, { duration: 280 }))
    if (isCurrent) {
      glowScale.value = withRepeat(
        withSequence(withSpring(1.18, { damping: 8 }), withSpring(1, { damping: 8 })),
        -1, false,
      )
    }
  }, [isCurrent])

  const entryStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(pressed.value * 4, { damping: 12, stiffness: 400 }) }],
  }))
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: withSpring(isCurrent ? 0.35 : 0),
  }))

  return (
    <Animated.View style={[styles.nodeOuter, { left, top }, entryStyle]}>
      <Animated.View style={[styles.glowRing, { backgroundColor: palette.bg }, glowStyle]} pointerEvents="none" />
      <Pressable
        onPressIn={() => { if (unlocked || done) pressed.value = 1 }}
        onPressOut={() => { pressed.value = 0 }}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={done ? `Review ${lesson.title}` : unlocked ? `Open ${lesson.title}` : `${lesson.title} is locked`}
      >
        <View style={[styles.nodeShadow, { backgroundColor: palette.shadow }]} />
        <Animated.View style={[
          styles.nodeBody, { backgroundColor: palette.bg },
          !unlocked && !done && styles.nodeBodyLocked, pressStyle,
        ]}>
          {!unlocked && !done && (
            <View style={styles.lockBadge} pointerEvents="none">
              <Ionicons name="lock-closed" size={11} color="#fff" />
            </View>
          )}
          {done && (
            <View style={styles.doneBadge} pointerEvents="none">
              <Ionicons name="checkmark" size={11} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.nodePattern, !unlocked && !done && styles.nodePatternMuted]}
            adjustsFontSizeToFit numberOfLines={1}>
            {(lesson.pattern || lesson.title).replace(/^-/, '')}
          </Text>
          <Stars filled={done ? 3 : stars} />
        </Animated.View>
      </Pressable>
      {isCurrent && (
        <View style={styles.tooltip}>
          <View style={styles.tooltipBubble}>
            <Text style={styles.tooltipText}>{stars > 0 ? 'continue →' : 'start →'}</Text>
          </View>
          <View style={styles.tooltipArrow} />
        </View>
      )}
    </Animated.View>
  )
})

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PhonicsPathScreen() {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const { completedLessonIds, progress, loading: progressLoading, refetch: refetchProgress } = useProgress()
  const { refetch: refetchProfile } = useProfile()
  const { lessons, loading: lessonsLoading, error, refetch: refetchLessons } = useLessonDirectory()
  const scrollRef           = useRef<ScrollView>(null)
  const lastAutoScrolledFor = useRef<string | null>(null)

  const sortedLessons = useMemo(() => {
    const sorted = [...lessons].sort((a, b) => a.level - b.level || a.title.localeCompare(b.title))
    const seen = new Set<string>()
    return sorted.filter((l) => {
      const key = l.pattern?.trim() || l.id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [lessons])

  const unlockedLessonIds = useMemo(() => {
    const set = new Set<string>()
    sortedLessons.forEach((l, i) => {
      if (i === 0 || completedLessonIds.includes(sortedLessons[i - 1]!.id)) set.add(l.id)
    })
    return set
  }, [sortedLessons, completedLessonIds])

  const heroLesson = useMemo(() => {
    if (!sortedLessons.length) return null
    const inProg = sortedLessons.find((l) =>
      !completedLessonIds.includes(l.id) &&
      (progressForLesson(progress, l.id)?.words_mastered?.length ?? 0) > 0
    )
    return inProg ?? sortedLessons.find((l) => !completedLessonIds.includes(l.id)) ?? null
  }, [sortedLessons, progress, completedLessonIds])

  const availableWidth = width - spacing.lg * 2 - NODE_SIZE
  const pathNodes = useMemo(() =>
    sortedLessons.map((lesson, i) => ({
      lesson, index: i,
      left: Math.round(availableWidth * WAVE[i % WAVE.length]!) + spacing.lg,
      top:  INITIAL_TOP + i * NODE_STEP,
    })),
  [sortedLessons, availableWidth])

  const dots = useMemo(() => buildDots(pathNodes), [pathNodes])

  const totalHeight = pathNodes.length
    ? pathNodes[pathNodes.length - 1]!.top + NODE_SIZE + NODE_GAP + insets.bottom + spacing.xxl
    : 300

  useEffect(() => {
    if (!heroLesson || !pathNodes.length) return
    if (lastAutoScrolledFor.current === heroLesson.id) return
    const heroNode = pathNodes.find((n) => n.lesson.id === heroLesson.id)
    if (!heroNode) return
    lastAutoScrolledFor.current = heroLesson.id
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, heroNode.top - 100), animated: true })
    }, 500)
    return () => clearTimeout(t)
  }, [heroLesson?.id, pathNodes])

  useFocusEffect(useCallback(() => {
    void refetchProgress()
    void refetchProfile()
    void refetchLessons()
  }, [refetchProgress, refetchProfile, refetchLessons]))

  const onNodePress = (lesson: LessonDirectoryItem) => {
    if (!unlockedLessonIds.has(lesson.id) && !completedLessonIds.includes(lesson.id)) {
      Alert.alert('Locked', 'Complete the previous word family to unlock this one.')
      return
    }
    router.push(completedLessonIds.includes(lesson.id) ? ROUTES.REVIEW(lesson.id) : ROUTES.LESSON(lesson.id))
  }

  const listLoading = progressLoading || lessonsLoading

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phonics</Text>
        <View style={styles.headerSpacer} />
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => void refetchLessons()} />
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => { void refetchLessons(); void refetchProgress() }}
            />
          }
        >
          {listLoading && !lessons.length ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Loading…</Text>
            </View>
          ) : !listLoading && !lessons.length ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No lessons yet</Text>
              <Text style={styles.emptySub}>Add word families in Supabase — they'll appear here automatically.</Text>
            </View>
          ) : !listLoading && lessons.length > 0 && !heroLesson ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>All done! 🎉</Text>
              <Text style={styles.emptySub}>You've mastered every word family. More coming soon.</Text>
            </View>
          ) : null}

          {pathNodes.length > 0 && (
            <View style={[styles.pathContainer, { height: totalHeight }]}>
              {dots.map((d) => (
                <View key={d.key} style={[styles.dot, { left: d.x, top: d.y, opacity: d.opacity }]} />
              ))}
              {pathNodes.map(({ lesson, index, left, top }) => {
                const done      = completedLessonIds.includes(lesson.id)
                const unlocked  = unlockedLessonIds.has(lesson.id)
                const isCurrent = lesson.id === heroLesson?.id
                const prog      = progressForLesson(progress, lesson.id)
                return (
                  <LessonNode
                    key={lesson.id}
                    lesson={lesson} index={index} left={left} top={top}
                    done={done} unlocked={unlocked || done} isCurrent={isCurrent}
                    stars={starsFor(prog, lesson.wordCount, done)}
                    onPress={() => onNodePress(lesson)}
                  />
                )
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.neutral },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  backBtn:      { padding: spacing.xs },
  headerTitle:  { flex: 1, textAlign: 'center', fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  headerSpacer: { width: 32 },
  scroll: { flex: 1 },
  loadingWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  loadingText: { fontSize: fontSize.sm, color: colors.textMuted },
  emptyWrap: {
    margin: spacing.lg, backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  emptySub:   { fontSize: fontSize.md, color: colors.textMuted, lineHeight: 22 },
  pathContainer: { position: 'relative' },
  dot: {
    position: 'absolute',
    width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.textHint,
  },
  nodeOuter: { position: 'absolute', width: NODE_SIZE },
  glowRing: {
    position: 'absolute',
    width: NODE_SIZE + 24, height: NODE_SIZE + 24,
    borderRadius: (NODE_SIZE + 24) / 2,
    top: -12, left: -12,
  },
  nodeShadow: {
    position: 'absolute',
    top: 5, left: 0, right: 0, bottom: -5, borderRadius: NODE_SIZE / 2,
  },
  nodeBody: {
    width: NODE_SIZE, height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
    gap: 4, padding: 10,
  },
  nodeBodyLocked:   { opacity: 0.6 },
  lockBadge: {
    position: 'absolute', top: 7, right: 7,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.30)',
    alignItems: 'center', justifyContent: 'center',
  },
  doneBadge: {
    position: 'absolute', top: 7, right: 7,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  nodePattern:      { fontFamily: 'Georgia', fontSize: 30, fontWeight: '700', color: '#fff', textAlign: 'center' },
  nodePatternMuted: { color: 'rgba(255,255,255,0.55)' },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  tooltip: { alignItems: 'center', marginTop: 6 },
  tooltipBubble: {
    backgroundColor: colors.text, borderRadius: radius.full,
    paddingVertical: 4, paddingHorizontal: 12,
  },
  tooltipText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  tooltipArrow: {
    width: 8, height: 6,
    borderLeftWidth: 4, borderRightWidth: 4,
    borderTopWidth: 6, borderBottomWidth: 0,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: colors.text,
  },
})
