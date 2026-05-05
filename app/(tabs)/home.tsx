import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Alert, RefreshControl,
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
import { useLessonStore } from '@/store/lessonStore'
import { ROUTES } from '@/lib/routes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { soundEngine } from '@/lib/sounds'
import Skeleton from '@/components/ui/Skeleton'
import ChapterHeader from '@/components/home/ChapterHeader'
import CollapsibleSection from '@/components/home/CollapsibleSection'
import LessonNode from '@/components/home/LessonNode'
import { NewUserGuide } from '@/components/home/NewUserGuide'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { progressForLesson, wordsMasteredLength, hasWordsMastered } from '@/lib/lessonProgress'
import { GROUP_NODES, IRREGULAR_VERB_NODES, HOMOPHONE_NODES } from '@/lib/practiceThemes'
import { PROVERB_NODES, PROVERB_GROUPS } from '@/data/proverbs'
import { IDIOM_NODES, IDIOM_GROUPS } from '@/data/idioms'
import { PHRASAL_VERB_NODES } from '@/data/phrasalVerbs'
import { NODE_SIZE, NODE_STEP, WAVE, PALETTE, DOT_SIZE, buildDots } from '@/lib/pathLayout'
import { GroupSection, useGroupSectionData } from '@/components/home/GroupSection'
import type { ChapterData } from '@/components/home/ChapterHeader'
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
  const m = wordsMasteredLength(prog)
  if (m === 0) return 0
  return m < wordCount / 2 ? 1 : 2
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const { user }  = useAuthStore()
  const { completedLessonIds, totalXP, progress, loading: progressLoading, error: progressError, refetch: refetchProgress } = useProgress()
  const { profile, refetch: refetchProfile } = useProfile()
  const { lessons, loading: lessonsLoading, refetch: refetchLessons } = useLessonDirectory()
  const { completedGroups: groupProgressCompleted, refetch: refetchGroups } = useGroupProgress()
  const { groupNeedsRefresh, completedGroups: storeCompleted } = useLessonStore()

  // Merge: server data (slow) + local store (instant)
  const completedGroups = useMemo(() =>
    [...new Set([...groupProgressCompleted, ...storeCompleted])],
  [groupProgressCompleted, storeCompleted])

  const [phonicsExpanded, setPhonicsExpanded] = useState(false)
  const [vocabExpanded,   setVocabExpanded]   = useState(false)
  const [verbsExpanded,   setVerbsExpanded]   = useState(false)
  const [homoExpanded,    setHomoExpanded]    = useState(false)
  const [proverbsExpanded, setProverbsExpanded] = useState(false)
  const [idiomsExpanded, setIdiomsExpanded] = useState(false)
  const [phrasalExpanded, setPhrasalExpanded] = useState(false)
  const [showGuide,       setShowGuide]       = useState(true)
  const [focusTick,       setFocusTick]       = useState(0)
  const scrollRef     = useRef<ScrollView>(null)
  const didInitScroll = useRef(false)

  const displayName = profile?.display_name || (user?.user_metadata?.display_name as string | undefined) || 'Learner'
  const streak      = profile?.streak_days ?? 0
  const xp          = profile?.total_xp ?? totalXP
  const totalWords = useMemo(
    () => progress.reduce((sum, p) => sum + wordsMasteredLength(p), 0),
    [progress],
  )

  const isNewUser = !progressLoading && !lessonsLoading && completedLessonIds.length === 0 && completedGroups.length === 0
  const statsReady = !progressLoading && !lessonsLoading

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
    // First: find an incomplete lesson with in-progress progress that is unlocked
    const ip = sortedLessons.findIndex((l) => {
      if (completedLessonIds.includes(l.id)) return false
      if (!unlockedLessonIds.has(l.id)) return false
      const p = progressForLesson(progress, l.id)
      return hasWordsMastered(p)
    })
    if (ip >= 0) return ip
    // Fallback: first unlocked, incomplete lesson
    const f = sortedLessons.findIndex((l) => !completedLessonIds.includes(l.id) && unlockedLessonIds.has(l.id))
    return f >= 0 ? f : null
  }, [sortedLessons, progress, completedLessonIds, unlockedLessonIds])

  const heroLessonId = heroLessonIdx !== null ? (sortedLessons[heroLessonIdx]?.id ?? null) : null

  // ── Vocabulary data ───────────────────────────────────────────────────────

  const vocabSection = useGroupSectionData(GROUP_NODES, completedGroups, availableWidth)

  // ── Irregular verbs data ────────────────────────────────────────────────

  const verbsSection = useGroupSectionData(IRREGULAR_VERB_NODES, completedGroups, availableWidth)

  // ── Homophones data ───────────────────────────────────────────────────

  const homoSection = useGroupSectionData(HOMOPHONE_NODES, completedGroups, availableWidth)

  // ── Proverbs data ──────────────────────────────────────────────────
  const proverbSection = useGroupSectionData(PROVERB_NODES, completedGroups, availableWidth)

  // ══ Hero IDs for scroll targeting ══════════════════════════════════════════

  const heroGroupIdx = vocabSection.heroIdx

  // ── Phonics path items ─────────────────────────────────────────────────────

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

  const phonicsDots = useMemo(() => buildDots(phonicsItems), [phonicsItems])

  const phonicsSectionH = calcSectionHeight(sortedLessons.length)

  // ── Chapter data (dynamic — updates when lessons/groups are added) ─────────

  const phonicsChapter = useMemo<ChapterData>(() => ({
    id: 'phonics', name: 'Phonics',
    subtitle: '',
    wordCount: sortedLessons.reduce((s, l) => s + (l.wordCount ?? 0), 0),
    accentColor: colors.primary,
    completed: completedLessonIds.length,
    total: sortedLessons.length,
    comingSoon: false,
  }), [completedLessonIds.length, sortedLessons.length])

  const vocabChapter = useMemo<ChapterData>(() => ({
    id: 'vocabulary', name: 'Vocabulary',
    subtitle: '',
    wordCount: GROUP_NODES.reduce((s, g) => s + g.wordCount, 0),
    accentColor: colors.chapterVocab,
    completed: GROUP_NODES.filter((g) => completedGroups.includes(g.id)).length,
    total: GROUP_NODES.length,
    comingSoon: false,
  }), [completedGroups])

  const verbsChapter = useMemo<ChapterData>(() => ({
    id: 'irregular-verbs', name: 'Irregular Verbs',
    subtitle: '',
    wordCount: IRREGULAR_VERB_NODES.reduce((s, g) => s + g.wordCount, 0),
    accentColor: colors.chapterVerbs,
    completed: IRREGULAR_VERB_NODES.filter((g) => completedGroups.includes(g.id)).length,
    total: IRREGULAR_VERB_NODES.length,
    comingSoon: false,
  }), [completedGroups])

  const homoChapter = useMemo<ChapterData>(() => ({
    id: 'homophones', name: 'Homophones',
    subtitle: '',
    wordCount: HOMOPHONE_NODES.reduce((s, g) => s + g.wordCount, 0),
    accentColor: colors.chapterHomo,
    completed: HOMOPHONE_NODES.filter((g) => completedGroups.includes(g.id)).length,
    total: HOMOPHONE_NODES.length,
    comingSoon: false,
  }), [completedGroups])

  const proverbChapter = useMemo<ChapterData>(() => ({
    id: 'proverbs', name: 'Proverbs',
    subtitle: '',
    wordCount: PROVERB_NODES.reduce((s, g) => s + g.wordCount, 0),
    accentColor: colors.chapterProverb,
    completed: PROVERB_NODES.filter((g) => completedGroups.includes(g.id)).length,
    total: PROVERB_NODES.length,
    comingSoon: false,
  }), [completedGroups])

  const idiomSection = useGroupSectionData(IDIOM_NODES, completedGroups, availableWidth)

  const idiomChapter = useMemo<ChapterData>(() => ({
    id: 'idioms', name: 'Idioms',
    subtitle: '',
    wordCount: IDIOM_NODES.reduce((s, g) => s + g.wordCount, 0),
    accentColor: colors.chapterIdioms,
    completed: IDIOM_NODES.filter((g) => completedGroups.includes(g.id)).length,
    total: IDIOM_NODES.length,
    comingSoon: false,
  }), [completedGroups])

  const phrasalSection = useGroupSectionData(PHRASAL_VERB_NODES, completedGroups, availableWidth)

  const phrasalChapter = useMemo<ChapterData>(() => ({
    id: 'phrasal-verbs', name: 'Phrasal Verbs',
    subtitle: '',
    wordCount: PHRASAL_VERB_NODES.reduce((s, g) => s + g.wordCount, 0),
    accentColor: colors.chapterPhrasal,
    completed: PHRASAL_VERB_NODES.filter((g) => completedGroups.includes(g.id)).length,
    total: PHRASAL_VERB_NODES.length,
    comingSoon: false,
  }), [completedGroups])

  // ── Scroll to hero ────────────────────────────────────────────────────────

  type SectionKey = 'phonics' | 'vocab' | 'verbs' | 'homo' | 'proverbs' | 'idioms' | 'phrasal'
  type ExpandedStates = Record<SectionKey, boolean>
  const ALL_SECTIONS: SectionKey[] = ['phonics', 'vocab', 'verbs', 'homo', 'proverbs', 'idioms', 'phrasal']

  const scrollToHero = useCallback((
    section: SectionKey,
    expandedStates: ExpandedStates,
    delay = 700,
  ): (() => void) => {
    const id = setTimeout(() => {
      // ... (body unchanged)
      const sectionHeights: Record<SectionKey, number> = {
        phonics:  phonicsSectionH,
        vocab:    calcSectionHeight(GROUP_NODES.length),
        verbs:    calcSectionHeight(IRREGULAR_VERB_NODES.length),
        homo:     calcSectionHeight(HOMOPHONE_NODES.length),
        proverbs: calcSectionHeight(PROVERB_NODES.length),
        idioms:   calcSectionHeight(IDIOM_NODES.length),
        phrasal:  calcSectionHeight(PHRASAL_VERB_NODES.length),
      }
      const heroIndices: Record<SectionKey, number | null> = {
        phonics:  heroLessonIdx,
        vocab:    vocabSection.heroIdx,
        verbs:    verbsSection.heroIdx,
        homo:     homoSection.heroIdx,
        proverbs: proverbSection.heroIdx,
        idioms:   idiomSection.heroIdx,
        phrasal:  phrasalSection.heroIdx,
      }
      let y = CHAPTER_HEIGHT + SECTION_TOP_PAD
      for (const s of ALL_SECTIONS) {
        if (s === section) {
          const heroIdx = heroIndices[s]
          if (heroIdx !== null) y += heroIdx * NODE_STEP - 80
          break
        }
        if (expandedStates[s]) y += sectionHeights[s] + spacing.md
        else y += 80 + spacing.md
      }
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true })
    }, delay)
    return () => clearTimeout(id)
  }, [heroLessonIdx, vocabSection.heroIdx, verbsSection.heroIdx, homoSection.heroIdx, proverbSection.heroIdx, idiomSection.heroIdx, phrasalSection.heroIdx, phonicsSectionH])

  const scrollToFirstLesson = useCallback(() => {
    const y = CHAPTER_HEIGHT + SECTION_TOP_PAD - 40
    scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true })
  }, [])

  useEffect(() => {
    if (didInitScroll.current) return
    if (heroLessonIdx === null && heroGroupIdx === null &&
        verbsSection.heroIdx === null && homoSection.heroIdx === null) return
    didInitScroll.current = true
    const states = { phonics: true, vocab: true, verbs: true, homo: true, proverbs: true, idioms: false, phrasal: false }
    if (heroLessonIdx !== null) scrollToHero('phonics', states, 600)
    else if (vocabSection.heroIdx !== null) scrollToHero('vocab', states, 600)
    else if (verbsSection.heroIdx !== null) scrollToHero('verbs', states, 600)
    else scrollToHero('homo', states, 600)
  }, [heroLessonIdx, heroGroupIdx, vocabSection.heroIdx, verbsSection.heroIdx, homoSection.heroIdx, scrollToHero])

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1)
    void refetchProgress()
    void refetchProfile()
    void refetchLessons()
    void refetchGroups()
  }, [refetchProgress, refetchProfile, refetchLessons, refetchGroups]))

  // Force-refetch group progress whenever focus tick changes (extra safety net)
  useEffect(() => {
    if (focusTick > 0) void refetchGroups()
  }, [focusTick])

  // Re-fetch group progress when the complete screen flags it
  useEffect(() => {
    if (groupNeedsRefresh) {
      void refetchGroups()
      useLessonStore.getState().resetLesson()
    }
  }, [groupNeedsRefresh])

  // Preload welcome sound for new users
  useEffect(() => {
    if (isNewUser) {
      soundEngine.preload(['welcome'])
    }
  }, [isNewUser])

  const onLessonPress = (lesson: LessonDirectoryItem) => {
    if (!unlockedLessonIds.has(lesson.id) && !completedLessonIds.includes(lesson.id)) {
      Alert.alert('Locked', 'Complete the previous word family to unlock this one.')
      return
    }
    router.push(completedLessonIds.includes(lesson.id) ? ROUTES.REVIEW(lesson.id) : ROUTES.LESSON(lesson.id))
  }

  const listLoading = progressLoading || lessonsLoading
  const listError = progressError ?? null

  // Track if user is returning (has content but no active session today)
  const isReturning = !isNewUser && streak === 0 && totalWords > 0

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* First-time guide overlay — full screen, outside scroll */}
      {isNewUser && showGuide && (
        <NewUserGuide
          name={displayName}
          onDismiss={() => {
            setShowGuide(false)
            soundEngine.play('welcome')
          }}
          onAutoTapPhonics={() => {
            if (!phonicsExpanded) {
              setPhonicsExpanded(true)
            }
            // Scroll to show the phonics nodes after expanding
            setTimeout(() => scrollToHero('phonics', {
              phonics: true, vocab: false,
              verbs: false, homo: false, proverbs: false, idioms: false, phrasal: false,
            }, 400), 500)
          }}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingLine}>{getGreeting()},</Text>
          <Text style={styles.displayName} numberOfLines={1}>{displayName}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statsReady ? streak : '-'}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statsReady ? totalWords : '-'}</Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{statsReady ? xp : '-'}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>
        <NotificationBell onNavigate={(route) => {
          if (route === '/(tabs)/friends') router.push('/(tabs)/friends')
          if (route === '/(tabs)/profile') router.push('/(tabs)/profile')
          if (route === '/(tabs)/progress') router.push('/(tabs)/progress')
          if (route === '/(tabs)/home') return
        }} />
      </View>

      {listError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{listError}</Text>
          <TouchableOpacity onPress={() => { void refetchLessons(); void refetchProgress(); void refetchProfile(); }}>
            <Text style={styles.errorBannerLink}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

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
            <Skeleton width="100%" height={80} borderRadius={radius.xl} />
            <View style={{ height: spacing.md }} />
            <Skeleton width="100%" height={80} borderRadius={radius.xl} />
            <View style={{ height: spacing.md }} />
            <Skeleton width="100%" height={80} borderRadius={radius.xl} />
          </View>
        ) : (
          <>
            <View style={styles.sectionSpacer} />

            {/* ── Phonics ──────────────────────────────────────────────── */}
            <ChapterHeader
              item={phonicsChapter}
              expanded={phonicsExpanded}
              onPress={() => {
                const next = !phonicsExpanded
                setPhonicsExpanded(next)
                if (next) scrollToHero('phonics', {
                  phonics: true, vocab: vocabExpanded,
                  verbs: verbsExpanded, homo: homoExpanded, proverbs: proverbsExpanded,
                  idioms: idiomsExpanded, phrasal: phrasalExpanded,
                })
              }}
            />
            <CollapsibleSection expanded={phonicsExpanded} sectionHeight={phonicsSectionH}>
              {phonicsDots.map((d) => (
                <View key={`p-${d.key}`} style={[styles.dot, { left: d.x, top: d.y, opacity: d.opacity }]} />
              ))}
              {phonicsItems.map((item) => (
                <LessonNode
                  key={item.lesson.id}
                  pattern={item.lesson.pattern || item.lesson.title} index={item.index}
                  left={item.left} top={item.top}
                  done={item.done} unlocked={item.unlocked} isCurrent={item.isCurrent}
                  stars={item.stars}
                  expanded={phonicsExpanded}
                  onPress={() => onLessonPress(item.lesson)}
                />
              ))}
            </CollapsibleSection>

            <View style={styles.sectionSpacer} />

            {/* ── Group sections (vocab, verbs, homophones) ───────────────── */}
            <GroupSection
              config={{
                key: 'vocab',
                chapter: vocabChapter,
                nodes: GROUP_NODES,
                completedGroups,
                expanded: vocabExpanded,
                onToggle: () => {
                  const next = !vocabExpanded
                  setVocabExpanded(next)
                  if (next) scrollToHero('vocab', {
                    phonics: phonicsExpanded, vocab: true,
                    verbs: verbsExpanded, homo: homoExpanded, proverbs: proverbsExpanded,
                    idioms: idiomsExpanded, phrasal: phrasalExpanded,
                  })
                },
                showLockedAlert: true,
              }}
              items={vocabSection.items}
              expanded={vocabExpanded}
              availableWidth={availableWidth}
              onNavigate={(id, done) => router.push(done ? ROUTES.GROUP_REVIEW(id) : ROUTES.GROUP_LESSON(id))}
            />

            <View style={styles.sectionSpacer} />

            <GroupSection
              config={{
                key: 'verbs',
                chapter: verbsChapter,
                nodes: IRREGULAR_VERB_NODES,
                completedGroups,
                expanded: verbsExpanded,
                onToggle: () => {
                  const next = !verbsExpanded
                  setVerbsExpanded(next)
                  if (next) scrollToHero('verbs', {
                    phonics: phonicsExpanded, vocab: vocabExpanded,
                    verbs: true, homo: homoExpanded, proverbs: proverbsExpanded,
                    idioms: idiomsExpanded, phrasal: phrasalExpanded,
                  })
                },
                showLockedAlert: true,
              }}
              items={verbsSection.items}
              expanded={verbsExpanded}
              availableWidth={availableWidth}
              onNavigate={(id, done) => router.push(done ? ROUTES.GROUP_REVIEW(id) : ROUTES.GROUP_LESSON(id))}
            />

            <View style={styles.sectionSpacer} />

            <GroupSection
              config={{
                key: 'homo',
                chapter: homoChapter,
                nodes: HOMOPHONE_NODES,
                completedGroups,
                expanded: homoExpanded,
                onToggle: () => {
                  const next = !homoExpanded
                  setHomoExpanded(next)
                  if (next) scrollToHero('homo', {
                    phonics: phonicsExpanded, vocab: vocabExpanded,
                    verbs: verbsExpanded, homo: true, proverbs: proverbsExpanded,
                    idioms: idiomsExpanded, phrasal: phrasalExpanded,
                  })
                },
                showLockedAlert: true,
              }}
              items={homoSection.items}
              expanded={homoExpanded}
              availableWidth={availableWidth}
              onNavigate={(id, done) => router.push(done ? ROUTES.GROUP_REVIEW(id) : ROUTES.GROUP_LESSON(id))}
            />

            <View style={styles.sectionSpacer} />

            <GroupSection
              config={{
                key: 'proverbs',
                chapter: proverbChapter,
                nodes: PROVERB_NODES,
                completedGroups,
                expanded: proverbsExpanded,
                onToggle: () => {
                  const next = !proverbsExpanded
                  setProverbsExpanded(next)
                  if (next) scrollToHero('proverbs', {
                    phonics: phonicsExpanded, vocab: vocabExpanded,
                    verbs: verbsExpanded, homo: homoExpanded, proverbs: true,
                    idioms: idiomsExpanded, phrasal: phrasalExpanded,
                  })
                },
                showLockedAlert: true,
              }}
              items={proverbSection.items}
              expanded={proverbsExpanded}
              availableWidth={availableWidth}
              onNavigate={(id, done) => router.push(done ? ROUTES.GROUP_REVIEW(id) : ROUTES.GROUP_LESSON(id))}
            />

            <View style={styles.sectionSpacer} />

            <GroupSection
              config={{
                key: 'idioms',
                chapter: idiomChapter,
                nodes: IDIOM_NODES,
                completedGroups,
                expanded: idiomsExpanded,
                onToggle: () => {
                  const next = !idiomsExpanded
                  setIdiomsExpanded(next)
                  if (next) scrollToHero('idioms', {
                    phonics: phonicsExpanded, vocab: vocabExpanded,
                    verbs: verbsExpanded, homo: homoExpanded, proverbs: proverbsExpanded,
                    idioms: true, phrasal: phrasalExpanded,
                  })
                },
                showLockedAlert: true,
              }}
              items={idiomSection.items}
              expanded={idiomsExpanded}
              availableWidth={availableWidth}
              onNavigate={(id, done) => router.push(done ? ROUTES.GROUP_REVIEW(id) : ROUTES.GROUP_LESSON(id))}
            />

            <View style={styles.sectionSpacer} />

            <GroupSection
              config={{
                key: 'phrasal-verbs',
                chapter: phrasalChapter,
                nodes: PHRASAL_VERB_NODES,
                completedGroups,
                expanded: phrasalExpanded,
                onToggle: () => {
                  const next = !phrasalExpanded
                  setPhrasalExpanded(next)
                  if (next) scrollToHero('phrasal', {
                    phonics: phonicsExpanded, vocab: vocabExpanded,
                    verbs: verbsExpanded, homo: homoExpanded, proverbs: proverbsExpanded, idioms: idiomsExpanded, phrasal: true,
                  })
                },
                showLockedAlert: true,
              }}
              items={phrasalSection.items}
              expanded={phrasalExpanded}
              availableWidth={availableWidth}
              onNavigate={(id, done) => router.push(done ? ROUTES.GROUP_REVIEW(id) : ROUTES.GROUP_LESSON(id))}
            />
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
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  greetingBlock: { gap: 1, flexShrink: 0 },
  greetingLine:  { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  displayName:   { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-evenly', flex: 1,
    maxWidth: 240,
  },
  statCard: {
    alignItems: 'center', gap: 1,
    paddingVertical: 4, paddingHorizontal: 10,
    minWidth: 52,
  },
  statIcon: { fontSize: 14, lineHeight: 18 },
  statValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 8, color: colors.textMuted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  loadingWrap:   { gap: spacing.md, padding: spacing.lg, paddingTop: spacing.xl },
  loadingText:   { fontSize: fontSize.sm, color: colors.textMuted },

  sectionSpacer: { height: spacing.md },
  returnBanner: {
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  returnText: { fontSize: fontSize.sm, color: colors.primaryDark, fontWeight: '500' },

  // Dots
  dot: {
    position: 'absolute',
    width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.textHint,
  },

  statItem: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  statDot:  { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.border },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.errorLight, gap: spacing.md,
  },
  errorBannerText: { flex: 1, fontSize: fontSize.sm, color: colors.error },
  errorBannerLink: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
})