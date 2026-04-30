import { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue, withSpring, withTiming, withDelay,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useLessonStore } from '@/store/lessonStore'
import { useProfile } from '@/hooks/useProfile'
import { useGroupLesson } from '@/hooks/useGroupLesson'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { pushNotification } from '@/lib/notifications'
import { updateStreak } from '@/lib/streak'
import { WORD_THEMES, IRREGULAR_VERB_GROUPS, HOMOPHONE_GROUPS, GROUP_NODES, IRREGULAR_VERB_NODES, HOMOPHONE_NODES } from '@/lib/practiceThemes'
import ConfettiBurst from '@/components/celebrations/ConfettiBurst'
import { Star } from '@/components/celebrations/CompleteShared'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'
import { ROUTES } from '@/lib/routes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

export default function GroupCompleteScreen() {
  const { theme } = useLocalSearchParams<{ theme: string }>()
  const { wordsMastered, resetLesson } = useLessonStore()
  const { profile } = useProfile()
  const { user } = useAuthStore()
  const saved = useRef(false)

  const { words } = useGroupLesson(theme ?? '')

  const themeData    = WORD_THEMES[theme] ?? IRREGULAR_VERB_GROUPS[theme] ?? HOMOPHONE_GROUPS[theme]
  const title        = `${themeData?.emoji ?? '🗂'} ${theme}`
  const streakDays   = profile?.streak_days ?? 0
  const wordsMasteredCount = wordsMastered.length

  const xpEarned = Math.max(10, wordsMasteredCount * 4 + 25)

  const cardTranslateY = useSharedValue(300)
  const scoreScale     = useSharedValue(0)
  const xpScale        = useSharedValue(0)
  const btnOpacity     = useSharedValue(0)

  const cardStyle  = useAnimatedStyle(() => ({ transform: [{ translateY: cardTranslateY.value }] }))
  const scoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }))
  const xpStyle    = useAnimatedStyle(() => ({ transform: [{ scale: xpScale.value }] }))
  const btnStyle   = useAnimatedStyle(() => ({ opacity: btnOpacity.value }))

  useEffect(() => {
    if (!saved.current && user && theme) {
      saved.current = true
      supabase.from('group_progress').upsert(
        { user_id: user.id, group_name: theme, completed: true, completed_at: new Date().toISOString() },
        { onConflict: 'user_id,group_name' },
      ).then(() => {}, () => {})
      try { void updateStreak(user.id) } catch {}
      try {
        void pushNotification({
          userId: user.id, type: 'group_complete',
          title: `${title} complete! 🎉`,
          body: `You mastered ${wordsMasteredCount} words in this group.`,
          emoji: '🏆', linkRoute: '/(tabs)/home',
        })
      } catch {}
      useLessonStore.getState().flagGroupRefresh()
      useLessonStore.getState().addCompletedGroup(theme)
    }

    haptics.celebrate()
    soundEngine.play('lessonComplete')
    cardTranslateY.value = withSpring(0, { damping: 18 })
    scoreScale.value     = withDelay(300, withSpring(1, { damping: 10 }))
    xpScale.value        = withDelay(700, withSpring(1, { damping: 8 }))
    btnOpacity.value     = withDelay(1400, withTiming(1, { duration: 400 }))
  }, [])

  const handleDone = () => { resetLesson(); router.replace(ROUTES.HOME) }

  const handleNextGroup = () => {
    resetLesson()
    const homoIdx = HOMOPHONE_NODES.findIndex((g) => g.id === theme)
    if (homoIdx !== -1 && homoIdx < HOMOPHONE_NODES.length - 1) {
      router.replace(ROUTES.GROUP_LESSON(HOMOPHONE_NODES[homoIdx + 1]!.id)); return
    }
    const verbIdx = IRREGULAR_VERB_NODES.findIndex((g) => g.id === theme)
    if (verbIdx !== -1 && verbIdx < IRREGULAR_VERB_NODES.length - 1) {
      router.replace(ROUTES.GROUP_LESSON(IRREGULAR_VERB_NODES[verbIdx + 1]!.id)); return
    }
    const vocabIdx = GROUP_NODES.findIndex((g) => g.id === theme)
    if (vocabIdx !== -1 && vocabIdx < GROUP_NODES.length - 1) {
      router.replace(ROUTES.GROUP_LESSON(GROUP_NODES[vocabIdx + 1]!.id)); return
    }
    router.replace(ROUTES.HOME)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.bg}>
        <ConfettiBurst />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>group complete</Text>
        </View>
        <Text style={styles.headline}>You crushed it!</Text>
        <Text style={styles.patternSubtitle}>{title}</Text>
        <View style={styles.stars}>
          <Star filled={true} delay={900} />
          <Star filled={true} delay={1100} />
          <Star filled={true} delay={1300} />
        </View>
      </View>

      <Animated.View style={[styles.bottomCard, cardStyle]}>
        <Animated.View style={[styles.scoreCircle, scoreStyle]}>
          <Text style={styles.scoreNum}>100</Text>
          <Text style={styles.scorePct}>%</Text>
        </Animated.View>

        <Animated.View style={[styles.xpBanner, xpStyle]}>
          <Text style={styles.xpText}>+{xpEarned} XP</Text>
        </Animated.View>

        <View style={styles.statsGrid}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{wordsMasteredCount}</Text>
            <Text style={styles.statLabel}>Words mastered</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{streakDays}</Text>
            <Text style={styles.statLabel}>Streak kept</Text>
          </View>
        </View>

        <Animated.View style={[styles.btnRow, btnStyle]}>
          <TouchableOpacity style={styles.doneBtn} onPress={handleDone} accessibilityRole="button">
            <Text style={styles.doneBtnText}>back to home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNextGroup} accessibilityRole="button">
            <Text style={styles.nextBtnText}>next group →</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  bg: {
    flex: 1, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    gap: spacing.lg, paddingBottom: 160,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.full,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.lg,
  },
  badgeText: {
    color: colors.primaryLight, fontSize: fontSize.sm, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  headline:       { color: '#fff', fontSize: 32, fontWeight: '800' },
  patternSubtitle: { fontSize: fontSize.md, color: '#9FE1CB', marginTop: 4 },
  stars: { flexDirection: 'row', gap: spacing.sm },

  bottomCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl,
    padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl,
  },
  scoreCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.primaryLight, borderWidth: 4, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', alignSelf: 'center',
  },
  scoreNum: { fontSize: 32, fontWeight: '800', color: colors.primary },
  scorePct: { fontSize: fontSize.lg, color: colors.primaryMid, marginTop: 8 },
  xpBanner: {
    backgroundColor: colors.amberLight, borderRadius: radius.full,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, alignSelf: 'center',
  },
  xpText: { fontSize: fontSize.xl, fontWeight: '800', color: colors.amber },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    flex: 1, minWidth: '45%', backgroundColor: colors.neutral,
    borderRadius: radius.lg, padding: spacing.md, gap: 4,
  },
  statNum:   { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  btnRow: { flexDirection: 'row', gap: spacing.sm },
  doneBtn: {
    flex: 1, backgroundColor: colors.neutral, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  doneBtnText: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  nextBtn: {
    flex: 1, backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },
})
