import { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity, Pressable,
  StyleSheet, Alert, RefreshControl, ActivityIndicator,
  useWindowDimensions,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay, withRepeat, withSequence,
} from 'react-native-reanimated'
import { useAuthStore } from '@/store/authStore'
import { useProgress } from '@/hooks/useProgress'
import { useProfile } from '@/hooks/useProfile'
import { useLessonDirectory, type LessonDirectoryItem } from '@/hooks/useLessonDirectory'
import { useGroupProgress } from '@/hooks/useGroupProgress'
import { ROUTES } from '@/lib/routes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { progressForLesson } from '@/lib/lessonProgress'
import { GROUP_NODES } from '@/lib/practiceThemes'
import { NODE_SIZE, NODE_STEP, DOT_SIZE, WAVE, PALETTE, buildDots } from '@/lib/pathLayout'
import type { UserProgress } from '@/lib/types'

// ── Layout constants ──────────────────────────────────────────────────────────
const CHAPTER_HEIGHT  = 80
const SECTION_TOP_PAD = 28   // gap from chapter card bottom to first node top
const SECTION_BOT_PAD = 40   // padding below last node

function calcSectionHeight(count: number): number {
  return count === 0 ? 0 : SECTION_TOP_PAD + count * NODE_STEP + SECTION_BOT_PAD
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function starsFor(prog: UserProgress | undefined, wordCount: number, done: boolean): number {
  if (done) return 3
  const m = prog?.words_mastered?.length ?? 0
  if (m === 0) return 0
  return m < wordCount / 2 ? 1 : 2
}

// ── Chapter header ────────────────────────────────────────────────────────────

type ChapterData = {
  id: string; emoji: string; name: string; subtitle: string
  accentColor: string; completed: number; total: number
  comingSoon: boolean
}

const ChapterHeader = memo(function ChapterHeader({
  item, expanded, onPress,
}: {
  item: ChapterData; expanded?: boolean; onPress?: () => void
}) {
  const pct        = item.total > 0 ? item.completed / item.total : 0
  const chevronRot = useSharedValue(expanded ? 1 : 0)

  useEffect(() => {
    chevronRot.value = withSpring(expanded ? 1 : 0, { damping: 14, stiffness: 200 })
  }, [expanded])

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRot.value * 180}deg` }],
  }))

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={item.comingSoon || !onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.chapterCard, { borderLeftColor: item.accentColor }, item.comingSoon && styles.chapterCardSoon]}>
        <View style={[styles.chapterIcon, { backgroundColor: item.accentColor + '22' }]}>
          <Text style={styles.chapterEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.chapterBody}>
          <View style={styles.chapterRow}>
            <Text style={[styles.chapterName, item.comingSoon && styles.chapterNameMuted]}>
              {item.name}
            </Text>
            <View style={styles.chapterMeta}>
              {item.comingSoon ? (
                <View style={styles.soonBadge}><Text style={styles.soonText}>soon</Text></View>
              ) : item.total > 0 ? (
                <Text style={[styles.chapterCount, { color: item.accentColor }]}>
                  {item.completed}/{item.total}
                </Text>
              ) : null}
              {!item.comingSoon && (
                <Animated.View style={chevronStyle}>
                  <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                </Animated.View>
              )}
            </View>
          </View>
          <Text style={styles.chapterSub}>{item.subtitle}</Text>
          {!item.comingSoon && item.total > 0 && (
            <View style={styles.chapterTrack}>
              <View style={[styles.chapterFill, { width: `${pct * 100}%` as `${number}%`, backgroundColor: item.accentColor }]} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
})

// ── Collapsible section ───────────────────────────────────────────────────────

const CollapsibleSection = memo(function CollapsibleSection({
  expanded, sectionHeight, children,
}: {
  expanded: boolean; sectionHeight: number; children: React.ReactNode
}) {
  const animH = useSharedValue(expanded ? sectionHeight : 0)

  useEffect(() => {
    animH.value = withSpring(expanded ? sectionHeight : 0, {
      damping: 22, stiffness: 160, mass: 1,
    })
  }, [expanded, sectionHeight])

  const style = useAnimatedStyle(() => ({ height: animH.value }))

  return (
    <Animated.View style={[styles.sectionWrap, style]}>
      {children}
    </Animated.View>
  )
})

// ── Stars ─────────────────────────────────────────────────────────────────────

function Stars({ filled }: { filled: number }) {
  return (
    <View style={styles.starsRow}>
      {[0, 1, 2].map((i) => (
        <Ionicons key={i}
          name={i < filled ? 'star' : 'star-outline'}
          size={11}
          color={i < filled ? '#FFD700' : 'rgba(255,255,255,0.4)'}
        />
      ))}
    </View>
  )
}

// ── Lesson node ───────────────────────────────────────────────────────────────

const LessonNode = memo(function LessonNode({
  lesson, index, left, top, done, unlocked, isCurrent, stars, expanded, onPress,
}: {
  lesson: LessonDirectoryItem
  index: number; left: number; top: number
  done: boolean; unlocked: boolean; isCurrent: boolean; stars: number
  expanded: boolean
  onPress: () => void
}) {
  const pressed   = useSharedValue(0)
  const cascadeY  = useSharedValue(-28)
  const cascadeOp = useSharedValue(0)
  const glowScale = useSharedValue(1)
  const palette   = done
    ? { bg: colors.primary, shadow: colors.primaryDark }
    : unlocked ? PALETTE[index % PALETTE.length]! : { bg: '#C5C3BC', shadow: '#9C9A92' }

  useEffect(() => {
    if (expanded) {
      cascadeY.value  = -28
      cascadeOp.value = 0
      cascadeY.value  = withDelay(index * 55, withSpring(0, { damping: 14, stiffness: 180 }))
      cascadeOp.value = withDelay(index * 55, withTiming(1, { duration: 220 }))
    } else {
      cascadeY.value  = withTiming(-28, { duration: 160 })
      cascadeOp.value = withTiming(0, { duration: 160 })
    }
  }, [expanded])

  useEffect(() => {
    if (isCurrent) {
      glowScale.value = withRepeat(
        withSequence(withSpring(1.18, { damping: 8 }), withSpring(1, { damping: 8 })),
        -1, false,
      )
    }
  }, [isCurrent])

  const cascadeStyle = useAnimatedStyle(() => ({
    opacity: cascadeOp.value,
    transform: [{ translateY: cascadeY.value }],
  }))
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(pressed.value * 4, { damping: 12, stiffness: 400 }) }],
  }))
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: withSpring(isCurrent ? 0.35 : 0),
  }))

  return (
    <Animated.View style={[styles.nodeOuter, { left, top }, cascadeStyle]}>
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

// ── Group node ────────────────────────────────────────────────────────────────

const GroupNode = memo(function GroupNode({
  emoji, name, index, left, top, done, unlocked, isCurrent, expanded, onPress,
}: {
  emoji: string; name: string
  index: number; left: number; top: number
  done: boolean; unlocked: boolean; isCurrent: boolean
  expanded: boolean
  onPress: () => void
}) {
  const pressed   = useSharedValue(0)
  const cascadeY  = useSharedValue(-28)
  const cascadeOp = useSharedValue(0)
  const glowScale = useSharedValue(1)
  const palette   = done
    ? { bg: colors.primary, shadow: colors.primaryDark }
    : unlocked ? PALETTE[index % PALETTE.length]! : { bg: '#C5C3BC', shadow: '#9C9A92' }

  useEffect(() => {
    if (expanded) {
      cascadeY.value  = -28
      cascadeOp.value = 0
      cascadeY.value  = withDelay(index * 55, withSpring(0, { damping: 14, stiffness: 180 }))
      cascadeOp.value = withDelay(index * 55, withTiming(1, { duration: 220 }))
    } else {
      cascadeY.value  = withTiming(-28, { duration: 160 })
      cascadeOp.value = withTiming(0, { duration: 160 })
    }
  }, [expanded])

  useEffect(() => {
    if (isCurrent) {
      glowScale.value = withRepeat(
        withSequence(withSpring(1.18, { damping: 8 }), withSpring(1, { damping: 8 })),
        -1, false,
      )
    }
  }, [isCurrent])

  const cascadeStyle = useAnimatedStyle(() => ({
    opacity: cascadeOp.value,
    transform: [{ translateY: cascadeY.value }],
  }))
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(pressed.value * 4, { damping: 12, stiffness: 400 }) }],
  }))
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: withSpring(isCurrent ? 0.35 : 0),
  }))

  return (
    <Animated.View style={[styles.nodeOuter, { left, top }, cascadeStyle]}>
      <Animated.View style={[styles.glowRing, { backgroundColor: palette.bg }, glowStyle]} pointerEvents="none" />
      <Pressable
        onPressIn={() => { if (unlocked || done) pressed.value = 1 }}
        onPressOut={() => { pressed.value = 0 }}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={done ? `Review ${name}` : unlocked ? `Start ${name}` : `${name} is locked`}
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
          <Text style={styles.groupEmoji}>{emoji}</Text>
          <Text style={[styles.groupName, !unlocked && !done && styles.groupNameMuted]}
            adjustsFontSizeToFit numberOfLines={1}>{name}</Text>
        </Animated.View>
      </Pressable>
      {isCurrent && (
        <View style={styles.tooltip}>
          <View style={styles.tooltipBubble}>
            <Text style={styles.tooltipText}>start →</Text>
          </View>
          <View style={styles.tooltipArrow} />
        </View>
      )}
    </Animated.View>
  )
})

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const { user }  = useAuthStore()
  const { completedLessonIds, totalXP, progress, loading: progressLoading, refetch: refetchProgress } = useProgress()
  const { profile, refetch: refetchProfile } = useProfile()
  const { lessons, loading: lessonsLoading, refetch: refetchLessons } = useLessonDirectory()
  const { completedGroups, refetch: refetchGroups } = useGroupProgress()

  const [phonicsExpanded, setPhonicsExpanded] = useState(true)
  const [vocabExpanded,   setVocabExpanded]   = useState(true)
  const scrollRef     = useRef<ScrollView>(null)
  const didInitScroll = useRef(false)

  const displayName = profile?.display_name || (user?.user_metadata?.display_name as string | undefined) || 'Learner'
  const streak      = profile?.streak_days ?? 0
  const xp          = profile?.total_xp ?? totalXP

  // Node left positions are relative to the section container (scrollContent has paddingHorizontal: spacing.lg)
  const availableWidth = width - spacing.lg * 2 - NODE_SIZE

  // ── Phonics data ──────────────────────────────────────────────────────────

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

  const heroLessonIdx = useMemo(() => {
    const ip = sortedLessons.findIndex((l) =>
      !completedLessonIds.includes(l.id) &&
      (progressForLesson(progress, l.id)?.words_mastered?.length ?? 0) > 0
    )
    if (ip >= 0) return ip
    const f = sortedLessons.findIndex((l) => !completedLessonIds.includes(l.id))
    return f >= 0 ? f : null
  }, [sortedLessons, progress, completedLessonIds])

  const heroLessonId = heroLessonIdx !== null ? (sortedLessons[heroLessonIdx]?.id ?? null) : null

  // ── Vocabulary data ───────────────────────────────────────────────────────

  const unlockedGroupNames = useMemo(() => {
    const set = new Set<string>()
    GROUP_NODES.forEach((g, i) => {
      if (i === 0 || completedGroups.includes(GROUP_NODES[i - 1]!.id)) set.add(g.id)
    })
    return set
  }, [completedGroups])

  const heroGroupIdx = useMemo(() => {
    const idx = GROUP_NODES.findIndex((g) => !completedGroups.includes(g.id))
    return idx >= 0 ? idx : null
  }, [completedGroups])

  const heroGroupId = heroGroupIdx !== null ? (GROUP_NODES[heroGroupIdx]?.id ?? null) : null

  // ── Path items (positions relative to their section container) ────────────

  const phonicsItems = useMemo(() =>
    sortedLessons.map((lesson, i) => {
      const done     = completedLessonIds.includes(lesson.id)
      const unlocked = unlockedLessonIds.has(lesson.id) || done
      return {
        lesson, index: i,
        left: Math.round(availableWidth * WAVE[i % WAVE.length]!),
        top:  SECTION_TOP_PAD + i * NODE_STEP,
        done, unlocked,
        isCurrent: lesson.id === heroLessonId,
        stars: starsFor(progressForLesson(progress, lesson.id), lesson.wordCount, done),
      }
    }),
  [sortedLessons, completedLessonIds, unlockedLessonIds, heroLessonId, progress, availableWidth])

  const vocabItems = useMemo(() =>
    GROUP_NODES.map((g, i) => {
      const done     = completedGroups.includes(g.id)
      const unlocked = unlockedGroupNames.has(g.id) || done
      return {
        id: g.id, emoji: g.emoji, name: g.name, index: i,
        left: Math.round(availableWidth * WAVE[i % WAVE.length]!),
        top:  SECTION_TOP_PAD + i * NODE_STEP,
        done, unlocked,
        isCurrent: g.id === heroGroupId,
      }
    }),
  [completedGroups, unlockedGroupNames, heroGroupId, availableWidth])

  const phonicsDots = useMemo(() => buildDots(phonicsItems), [phonicsItems])
  const vocabDots   = useMemo(() => buildDots(vocabItems),   [vocabItems])

  const phonicsSectionH = calcSectionHeight(sortedLessons.length)
  const vocabSectionH   = calcSectionHeight(GROUP_NODES.length)

  // ── Chapter data (dynamic — updates when lessons/groups are added) ─────────

  const phonicsChapter = useMemo<ChapterData>(() => ({
    id: 'phonics', emoji: '📚', name: 'Phonics',
    subtitle: 'Word patterns · sound-spelling rules',
    accentColor: colors.primary,
    completed: completedLessonIds.length,
    total: sortedLessons.length,
    comingSoon: false,
  }), [completedLessonIds.length, sortedLessons.length])

  const vocabChapter = useMemo<ChapterData>(() => ({
    id: 'vocabulary', emoji: '📝', name: 'Vocabulary',
    subtitle: 'Travel · Food · Nature · Feelings · more',
    accentColor: '#5856D6',
    completed: completedGroups.length,
    total: GROUP_NODES.length,
    comingSoon: false,
  }), [completedGroups.length])

  const irregularChapter: ChapterData = {
    id: 'irregular-verbs', emoji: '📖', name: 'Irregular Verbs',
    subtitle: 'In development — coming soon',
    accentColor: colors.textHint,
    completed: 0, total: 0, comingSoon: true,
  }

  // ── Scroll to hero ────────────────────────────────────────────────────────

  const scrollToHero = useCallback((
    section: 'phonics' | 'vocab',
    currentPhonicsExpanded: boolean,
    delay = 700,
  ) => {
    setTimeout(() => {
      let y = 0
      if (section === 'phonics' && heroLessonIdx !== null) {
        y = CHAPTER_HEIGHT + SECTION_TOP_PAD + heroLessonIdx * NODE_STEP - 80
      } else if (section === 'vocab' && heroGroupIdx !== null) {
        const phonicsH = currentPhonicsExpanded ? phonicsSectionH : 0
        y = CHAPTER_HEIGHT + phonicsH + spacing.md + CHAPTER_HEIGHT + SECTION_TOP_PAD + heroGroupIdx * NODE_STEP - 80
      }
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true })
    }, delay)
  }, [heroLessonIdx, heroGroupIdx, phonicsSectionH])

  useEffect(() => {
    if (didInitScroll.current) return
    if (heroLessonIdx === null && heroGroupIdx === null) return
    didInitScroll.current = true
    if (heroLessonIdx !== null) scrollToHero('phonics', true, 600)
    else scrollToHero('vocab', true, 600)
  }, [heroLessonIdx, heroGroupIdx, scrollToHero])

  useFocusEffect(useCallback(() => {
    void refetchProgress()
    void refetchProfile()
    void refetchLessons()
    void refetchGroups()
  }, [refetchProgress, refetchProfile, refetchLessons, refetchGroups]))

  const onLessonPress = (lesson: LessonDirectoryItem) => {
    if (!unlockedLessonIds.has(lesson.id) && !completedLessonIds.includes(lesson.id)) {
      Alert.alert('Locked', 'Complete the previous word family to unlock this one.')
      return
    }
    router.push(completedLessonIds.includes(lesson.id) ? ROUTES.REVIEW(lesson.id) : ROUTES.LESSON(lesson.id))
  }

  const listLoading = progressLoading || lessonsLoading

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingLine}>{getGreeting()},</Text>
          <Text style={styles.displayName} numberOfLines={1}>{displayName}</Text>
        </View>
        <View style={styles.statsChip}>
          <Text style={styles.statItem}>🔥 {streak}</Text>
          <View style={styles.statDot} />
          <Text style={styles.statItem}>⚡ {xp} XP</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => void Promise.all([refetchLessons(), refetchProgress(), refetchProfile(), refetchGroups()])}
          />
        }
      >
        {listLoading && !lessons.length ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Loading your path…</Text>
          </View>
        ) : (
          <>
            {/* ── Phonics ──────────────────────────────────────────────── */}
            <ChapterHeader
              item={phonicsChapter}
              expanded={phonicsExpanded}
              onPress={() => {
                const next = !phonicsExpanded
                setPhonicsExpanded(next)
                if (next) scrollToHero('phonics', true)
              }}
            />
            <CollapsibleSection expanded={phonicsExpanded} sectionHeight={phonicsSectionH}>
              {phonicsDots.map((d) => (
                <View key={`p-${d.key}`} style={[styles.dot, { left: d.x, top: d.y, opacity: d.opacity }]} />
              ))}
              {phonicsItems.map((item) => (
                <LessonNode
                  key={item.lesson.id}
                  lesson={item.lesson} index={item.index}
                  left={item.left} top={item.top}
                  done={item.done} unlocked={item.unlocked} isCurrent={item.isCurrent}
                  stars={item.stars}
                  expanded={phonicsExpanded}
                  onPress={() => onLessonPress(item.lesson)}
                />
              ))}
            </CollapsibleSection>

            <View style={styles.sectionSpacer} />

            {/* ── Vocabulary ───────────────────────────────────────────── */}
            <ChapterHeader
              item={vocabChapter}
              expanded={vocabExpanded}
              onPress={() => {
                const next = !vocabExpanded
                setVocabExpanded(next)
                if (next) scrollToHero('vocab', phonicsExpanded)
              }}
            />
            <CollapsibleSection expanded={vocabExpanded} sectionHeight={vocabSectionH}>
              {vocabDots.map((d) => (
                <View key={`v-${d.key}`} style={[styles.dot, { left: d.x, top: d.y, opacity: d.opacity }]} />
              ))}
              {vocabItems.map((item) => (
                <GroupNode
                  key={item.id}
                  emoji={item.emoji} name={item.name}
                  index={item.index} left={item.left} top={item.top}
                  done={item.done} unlocked={item.unlocked} isCurrent={item.isCurrent}
                  expanded={vocabExpanded}
                  onPress={() => {
                    if (!item.unlocked) {
                      Alert.alert('Locked', 'Complete the previous topic to unlock this one.')
                      return
                    }
                    router.push(ROUTES.GROUP_LESSON(item.id))
                  }}
                />
              ))}
            </CollapsibleSection>

            <View style={styles.sectionSpacer} />

            {/* ── Coming soon ──────────────────────────────────────────── */}
            <ChapterHeader item={irregularChapter} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  greetingBlock: { gap: 1 },
  greetingLine:  { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  displayName:   { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  statsChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.neutral, borderRadius: radius.full,
    paddingVertical: 7, paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  statItem: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  statDot:  { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.border },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  loadingWrap:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  loadingText:   { fontSize: fontSize.sm, color: colors.textMuted },

  // Chapter card (normal flow, not absolute)
  chapterCard: {
    height: CHAPTER_HEIGHT,
    backgroundColor: colors.surface, borderRadius: radius.xl, borderLeftWidth: 4,
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, gap: spacing.sm,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  chapterCardSoon:  { opacity: 0.45 },
  chapterIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  chapterEmoji:     { fontSize: 22 },
  chapterBody:      { flex: 1, gap: 2 },
  chapterRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chapterName:      { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  chapterNameMuted: { color: colors.textMuted },
  chapterMeta:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chapterCount:     { fontSize: fontSize.sm, fontWeight: '700' },
  chapterSub:       { fontSize: fontSize.xs, color: colors.textMuted },
  chapterTrack:     { height: 4, borderRadius: 2, backgroundColor: colors.neutral, marginTop: 3, overflow: 'hidden' },
  chapterFill:      { height: '100%', borderRadius: 2 },
  soonBadge: {
    backgroundColor: colors.neutral, borderRadius: radius.full,
    paddingVertical: 2, paddingHorizontal: 8, borderWidth: 1, borderColor: colors.border,
  },
  soonText: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },

  // Collapsible section — clips nodes during expand/collapse
  sectionWrap:   { overflow: 'hidden', position: 'relative' },
  sectionSpacer: { height: spacing.md },

  // Dots
  dot: {
    position: 'absolute',
    width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.textHint,
  },

  // Nodes
  nodeOuter: { position: 'absolute', width: NODE_SIZE },
  glowRing: {
    position: 'absolute', width: NODE_SIZE + 24, height: NODE_SIZE + 24,
    borderRadius: (NODE_SIZE + 24) / 2, top: -12, left: -12,
  },
  nodeShadow: {
    position: 'absolute', top: 5, left: 0, right: 0, bottom: -5,
    borderRadius: NODE_SIZE / 2,
  },
  nodeBody: {
    width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2,
    alignItems: 'center', justifyContent: 'center', gap: 4, padding: 10,
  },
  nodeBodyLocked: { opacity: 0.6 },
  lockBadge: {
    position: 'absolute', top: 7, right: 7, width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.30)', alignItems: 'center', justifyContent: 'center',
  },
  doneBadge: {
    position: 'absolute', top: 7, right: 7, width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  nodePattern:      { fontFamily: 'Georgia', fontSize: 30, fontWeight: '700', color: '#fff', textAlign: 'center' },
  nodePatternMuted: { color: 'rgba(255,255,255,0.55)' },
  starsRow:         { flexDirection: 'row', gap: 2, marginTop: 2 },
  groupEmoji:       { fontSize: 32, lineHeight: 38 },
  groupName:        { fontSize: 13, fontWeight: '700', color: '#fff', textAlign: 'center' },
  groupNameMuted:   { color: 'rgba(255,255,255,0.55)' },
  tooltip: { alignItems: 'center', marginTop: 6 },
  tooltipBubble: {
    backgroundColor: colors.text, borderRadius: radius.full,
    paddingVertical: 4, paddingHorizontal: 12,
  },
  tooltipText:  { fontSize: 11, color: '#fff', fontWeight: '600' },
  tooltipArrow: {
    width: 8, height: 6,
    borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 6, borderBottomWidth: 0,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.text,
  },
})
