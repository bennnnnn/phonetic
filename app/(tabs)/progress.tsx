import { useState, useMemo, useCallback } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useProgress } from '@/hooks/useProgress'
import { useProfile } from '@/hooks/useProfile'
import { useLessonDirectory } from '@/hooks/useLessonDirectory'
import { useGroupProgress } from '@/hooks/useGroupProgress'
import { GROUP_NODES } from '@/lib/practiceThemes'
import { ROUTES } from '@/lib/routes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { progressForLesson, familyProgressPct } from '@/lib/lessonProgress'
import { levelFromTotalXp, xpProgressPercentInCurrentLevel, xpToReachNextLevel } from '@/lib/xpLevel'
import type { UserProgress } from '@/lib/types'

// ── Utilities ─────────────────────────────────────────────────────────────────

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
type Period = 'week' | 'month' | 'all'

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function startOfToday(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isCompletedInPeriod(row: UserProgress, period: Period): boolean {
  if (!row.completed || !row.completed_at) return false
  const t = new Date(row.completed_at).getTime()
  if (Number.isNaN(t)) return false
  if (period === 'all') return true
  const todayStart = startOfToday().getTime()
  const endOfToday  = todayStart + 86400000 - 1
  const cutoff = todayStart - (period === 'week' ? 6 : 29) * 86400000
  return t >= cutoff && t <= endOfToday
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const insets = useSafeAreaInsets()
  const [period, setPeriod]       = useState<Period>('week')
  const [refreshing, setRefreshing] = useState(false)

  const { completedLessonIds, totalXP, progress, loading: progressLoading, error: progressError, refetch: refetchProgress } = useProgress()
  const { profile, error: profileError, refetch: refetchProfile } = useProfile()
  const { lessons, refetch: refetchLessons } = useLessonDirectory()
  const { completedGroups, refetch: refetchGroups } = useGroupProgress()

  const streak       = profile?.streak_days ?? 0
  const xp           = profile?.total_xp ?? totalXP
  const level        = levelFromTotalXp(xp)
  const levelPct     = xpProgressPercentInCurrentLevel(xp)
  const xpRemaining  = xpToReachNextLevel(xp)

  // ── All-time totals ───────────────────────────────────────────────────────

  const totalWordsMastered = useMemo(() => {
    const all = new Set<string>()
    progress.forEach((p) => p.words_mastered?.forEach((w) => all.add(w)))
    return all.size
  }, [progress])

  // ── Period-filtered stats ─────────────────────────────────────────────────

  const filteredProgress = useMemo(
    () => progress.filter((p) => isCompletedInPeriod(p, period)),
    [progress, period],
  )

  const lessonsCompletedInPeriod = useMemo(() => {
    const ids = new Set<string>()
    filteredProgress.forEach((p) => { if (p.completed) ids.add(p.lesson_id) })
    return ids.size
  }, [filteredProgress])

  const wordsMasteredInPeriod = useMemo(() => {
    const set = new Set<string>()
    filteredProgress.forEach((p) => p.words_mastered?.forEach((w) => set.add(w)))
    return set.size
  }, [filteredProgress])

  const xpInPeriod = useMemo(
    () => filteredProgress.reduce((sum, p) => sum + (p.xp_earned || 0), 0),
    [filteredProgress],
  )

  const quizScores = filteredProgress.filter((p) => p.completed && p.score > 0).map((p) => p.score)
  const quizAvg    = quizScores.length > 0
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
    : null

  // ── Activity dots (always last 7 days) ────────────────────────────────────

  const completedDays = useMemo(() => {
    const set = new Set<string>()
    progress.forEach((p) => {
      if (!p.completed || !p.completed_at) return
      const d = new Date(p.completed_at)
      if (!Number.isNaN(d.getTime())) set.add(dayKey(d))
    })
    return set
  }, [progress])

  const weekDays = useMemo(() => {
    const today    = new Date()
    const todayKey = dayKey(today)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      const k = dayKey(d)
      return { key: k, label: WEEKDAY_SHORT[d.getDay()]!, isToday: k === todayKey }
    })
  }, [])

  // ── Phonics: only lessons that have been started or completed ─────────────

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

  const startedLessons = useMemo(() =>
    sortedLessons.filter((l) =>
      completedLessonIds.includes(l.id) ||
      (progressForLesson(progress, l.id)?.words_mastered?.length ?? 0) > 0
    ),
  [sortedLessons, completedLessonIds, progress])

  // ── Vocabulary: only completed groups ────────────────────────────────────

  const completedGroupItems = useMemo(
    () => GROUP_NODES.filter((g) => completedGroups.includes(g.id)),
    [completedGroups],
  )

  // ── Data plumbing ─────────────────────────────────────────────────────────

  useFocusEffect(useCallback(() => {
    void refetchProgress()
    void refetchProfile()
    void refetchLessons()
    void refetchGroups()
  }, [refetchProgress, refetchProfile, refetchLessons, refetchGroups]))

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchProgress(), refetchProfile(), refetchLessons(), refetchGroups()])
    } finally {
      setRefreshing(false)
    }
  }, [refetchProgress, refetchProfile, refetchLessons, refetchGroups])

  const dataError       = progressError ?? profileError
  const hasAnyProgress  = completedLessonIds.length > 0 || totalWordsMastered > 0 || completedGroups.length > 0
  const periodLabel     = period === 'week' ? 'this week' : period === 'month' ? 'this month' : 'all time'

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {dataError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{dataError}</Text>
          <TouchableOpacity onPress={() => void onRefresh()}>
            <Text style={styles.errorBannerLink}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>your progress</Text>
          <View style={styles.toggle}>
            {(['week', 'month', 'all'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.toggleItem, period === p && styles.toggleItemOn]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.toggleText, period === p && styles.toggleTextOn]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.pillRow}>
          <View style={styles.pill}><Text style={styles.pillText}>🔥 {streak} day streak</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>⚡ {xp} XP total</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>📖 {totalWordsMastered} words</Text></View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
      >
        {/* Streak / activity card — always last 7 days */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <View>
              <Text style={styles.streakNum}>{streak}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>
            <View style={styles.pbBadge}>
              <Text style={styles.pbText}>last 7 days</Text>
            </View>
          </View>
          <View style={styles.weekGrid}>
            {weekDays.map(({ key, label, isToday }) => {
              const done = completedDays.has(key)
              return (
                <View key={key} style={styles.dayCol}>
                  <View style={[styles.dayDot, done && styles.dayDotDone, isToday && done && styles.dayDotToday]}>
                    {done && <Text style={styles.check}>✓</Text>}
                  </View>
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{label}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Period stats */}
        <Text style={styles.periodHint}>Stats · {periodLabel}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{wordsMasteredInPeriod}</Text>
            <Text style={styles.statLabel}>words mastered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{lessonsCompletedInPeriod}</Text>
            <Text style={styles.statLabel}>lessons done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>
              {xpInPeriod}<Text style={styles.statNumSuffix}> xp</Text>
            </Text>
            <Text style={styles.statLabel}>points earned</Text>
          </View>
          <View style={styles.statCard}>
            {quizAvg !== null ? (
              <Text style={[styles.statNum, { color: colors.primary }]}>
                {quizAvg}<Text style={styles.statNumSuffix}>%</Text>
              </Text>
            ) : (
              <Text style={[styles.statNum, { color: colors.textHint }]}>—</Text>
            )}
            <Text style={styles.statLabel}>quiz accuracy</Text>
          </View>
        </View>

        {/* Level progress */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelTitle}>level progress</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>level {level}</Text>
            </View>
          </View>
          <View style={styles.levelTrack}>
            <View style={[styles.levelFill, { width: `${levelPct}%` as `${number}%` }]} />
          </View>
          <View style={styles.levelFoot}>
            <Text style={styles.levelFootText}>{xp} XP</Text>
            <Text style={styles.levelFootText}>{xpRemaining} XP to level {level + 1}</Text>
          </View>
        </View>

        {/* Phonics: started + completed lessons only */}
        {startedLessons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>phonics</Text>
            <View style={styles.itemList}>
              {startedLessons.map((lesson, i) => {
                const done = completedLessonIds.includes(lesson.id)
                const p    = progressForLesson(progress, lesson.id)
                const pct  = familyProgressPct(p, done, lesson.wordCount)
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[styles.itemRow, i < startedLessons.length - 1 && styles.itemRowBorder]}
                    onPress={() => router.push(done ? ROUTES.REVIEW(lesson.id) : ROUTES.LESSON(lesson.id))}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.itemPattern}>{lesson.pattern || '—'}</Text>
                    <View style={styles.itemMeta}>
                      <View style={styles.itemNameRow}>
                        <Text style={styles.itemName} numberOfLines={1}>{lesson.title}</Text>
                        <Text style={[styles.itemPct, done && styles.itemPctDone]}>
                          {done ? '✓ done' : `${pct}%`}
                        </Text>
                      </View>
                      <View style={styles.itemTrack}>
                        <View style={[styles.itemFill, { width: `${pct}%` as `${number}%` }, done && styles.itemFillDone]} />
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={colors.textHint} />
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {/* Vocabulary: completed groups only */}
        {completedGroupItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>vocabulary</Text>
            <View style={styles.itemList}>
              {completedGroupItems.map((g, i) => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.itemRow, i < completedGroupItems.length - 1 && styles.itemRowBorder]}
                  onPress={() => router.push(ROUTES.GROUP_LESSON(g.id))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.itemEmoji}>{g.emoji}</Text>
                  <View style={styles.itemMeta}>
                    <View style={styles.itemNameRow}>
                      <Text style={styles.itemName}>{g.name}</Text>
                      <Text style={styles.itemPctDone}>✓ done</Text>
                    </View>
                    <View style={styles.itemTrack}>
                      <View style={[styles.itemFill, styles.itemFillDone, { width: '100%' }]} />
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={colors.textHint} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty state */}
        {!progressLoading && !hasAnyProgress && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptySub}>
              Complete your first lesson on the Home tab — your progress will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.errorLight, gap: spacing.md,
  },
  errorBannerText: { flex: 1, fontSize: fontSize.sm, color: colors.error },
  errorBannerLink: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },

  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:       { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  toggle: {
    flexDirection: 'row', backgroundColor: colors.neutral,
    borderRadius: radius.full, padding: 3, gap: 2,
  },
  toggleItem:    { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 16 },
  toggleItemOn:  { backgroundColor: colors.surface },
  toggleText:    { fontSize: fontSize.sm, fontWeight: '500', color: colors.textMuted },
  toggleTextOn:  { color: colors.text, fontWeight: '600' },
  pillRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  pill: {
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingVertical: 5, paddingHorizontal: 12,
  },
  pillText: { fontSize: fontSize.sm, color: colors.primaryDark, fontWeight: '500' },

  scroll:   { flex: 1 },
  content:  { padding: spacing.lg, gap: spacing.md },
  periodHint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: -4 },

  // Streak card
  streakCard: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    padding: 14, gap: spacing.md,
  },
  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  streakNum:    { color: '#fff', fontSize: 28, fontWeight: '700', lineHeight: 32 },
  streakLabel:  { color: '#9FE1CB', fontSize: fontSize.md },
  pbBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.full,
    paddingVertical: 4, paddingHorizontal: 11,
  },
  pbText:       { fontSize: 10, color: '#fff', fontWeight: '500' },
  weekGrid:     { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol:       { alignItems: 'center', gap: 3 },
  dayDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  dayDotDone:   { backgroundColor: colors.surface },
  dayDotToday:  { borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  check:        { fontSize: 11, fontWeight: '700', color: colors.primary },
  dayLabel:     { fontSize: 9, color: '#9FE1CB' },
  dayLabelToday: { color: '#fff', fontWeight: '600' },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  statNum:       { fontSize: 22, fontWeight: '700', color: colors.text },
  statNumSuffix: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  statLabel:     { fontSize: 10, color: colors.textMuted, marginTop: 3 },

  // Level card
  levelCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, gap: 6,
  },
  levelHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  levelTitle:    { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  levelBadge: {
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingVertical: 3, paddingHorizontal: 10,
  },
  levelBadgeText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primaryDark },
  levelTrack:  { height: 8, backgroundColor: colors.neutral, borderRadius: 4, overflow: 'hidden' },
  levelFill:   { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  levelFoot:   { flexDirection: 'row', justifyContent: 'space-between' },
  levelFootText: { fontSize: 10, color: colors.textMuted },

  // Sections (phonics / vocab)
  section:     { gap: 6 },
  sectionEyebrow: {
    fontSize: 10, fontWeight: '600', color: colors.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  itemList: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 12, gap: 10,
  },
  itemRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  itemPattern: {
    fontFamily: 'Georgia', fontSize: fontSize.sm, color: colors.primary,
    width: 36, textAlign: 'right', flexShrink: 0,
  },
  itemEmoji:   { fontSize: 22, width: 36, textAlign: 'center', flexShrink: 0 },
  itemMeta:    { flex: 1, gap: 4 },
  itemNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName:    { fontSize: fontSize.sm, fontWeight: '500', color: colors.text, flex: 1 },
  itemPct:     { fontSize: 10, color: colors.textMuted, marginLeft: spacing.sm },
  itemPctDone: { fontSize: 10, color: colors.primary, fontWeight: '700', marginLeft: spacing.sm },
  itemTrack: {
    height: 4, backgroundColor: colors.neutral, borderRadius: radius.full, overflow: 'hidden',
  },
  itemFill:     { height: '100%', backgroundColor: colors.primaryMid, borderRadius: radius.full },
  itemFillDone: { backgroundColor: colors.primary },

  // Empty state
  emptyCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  emptySub:   { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
})
