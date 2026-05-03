import { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue, withSpring, withTiming, withDelay,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useLesson } from '@/hooks/useLesson'
import { useLessonStore } from '@/store/lessonStore'
import { useSaveProgress } from '@/hooks/useSaveProgress'
import { useProfile } from '@/hooks/useProfile'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { pushNotification } from '@/lib/notifications'
import ConfettiBurst from '@/components/celebrations/ConfettiBurst'
import { Star } from '@/components/celebrations/CompleteShared'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'
import { ROUTES } from '@/lib/routes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

export default function CompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { lesson } = useLesson(id)
  const { wordsMastered, resetLesson } = useLessonStore()
  const { saveProgress } = useSaveProgress()
  const { profile } = useProfile()
  const { user } = useAuthStore()
  const saved = useRef(false)

  const wordsMasteredCount = wordsMastered.length
  const streakDays = profile?.streak_days ?? 0
  const xpEarned = Math.max(10, wordsMasteredCount * 5 + 25)

  // Animations
  const cardTranslateY = useSharedValue(300)
  const scoreScale = useSharedValue(0)
  const xpScale = useSharedValue(0)
  const btnOpacity = useSharedValue(0)

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateY: cardTranslateY.value }] }))
  const scoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }))
  const xpStyle = useAnimatedStyle(() => ({ transform: [{ scale: xpScale.value }] }))
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }))

  useEffect(() => {
    if (!saved.current && id) {
      saved.current = true
      void saveProgress({
        lessonId: id,
        score: 100,
        xpEarned,
        wordsMastered,
        wordsSkipped: [],
      })
    }

    haptics.celebrate()
    soundEngine.play('lessonComplete')

    try {
      void pushNotification({
        userId: user?.id ?? '',
        type: 'lesson_complete',
        title: `Lesson complete! 🎉`,
        body: `You mastered ${wordsMasteredCount} words.`,
        emoji: '📚',
        linkRoute: '/(tabs)/home',
      })
    } catch {}

    cardTranslateY.value = withSpring(0, { damping: 18 })
    scoreScale.value = withDelay(300, withSpring(1, { damping: 10 }))
    xpScale.value = withDelay(700, withSpring(1, { damping: 8 }))
    btnOpacity.value = withDelay(1400, withTiming(1, { duration: 400 }))
  }, [])

  const handleHome = () => { resetLesson(); router.replace(ROUTES.HOME) }
  const handleNext = async () => {
    resetLesson()
    if (!lesson) { router.replace(ROUTES.HOME); return }
    // Find next lesson in the same word family
    const { data: siblings } = await supabase
      .from('lessons')
      .select('id, title, level')
      .eq('word_family_id', lesson.word_family_id)
      .order('level', { ascending: true })
    if (siblings && siblings.length > 0) {
      const currentIdx = siblings.findIndex((l) => l.id === id)
      if (currentIdx !== -1 && currentIdx < siblings.length - 1) {
        router.replace(ROUTES.LESSON(siblings[currentIdx + 1]!.id))
        return
      }
    }
    router.replace(ROUTES.HOME)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.bg}>
        <ConfettiBurst />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>lesson complete</Text>
        </View>
        <Text style={styles.headline}>You crushed it!</Text>
        <Text style={styles.patternSubtitle}>{lesson?.title ?? 'The -ake pattern'}</Text>

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
          <TouchableOpacity style={styles.homeBtn} onPress={handleHome} accessibilityRole="button">
            <Text style={styles.homeBtnText}>home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} accessibilityRole="button">
            <Text style={styles.nextBtnText}>next lesson →</Text>
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
  homeBtn: {
    flex: 1, backgroundColor: colors.primaryLight, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  homeBtnText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '700' },
  nextBtn: {
    flex: 2, backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },
})
