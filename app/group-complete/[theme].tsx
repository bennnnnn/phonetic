import { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue, withSpring, withTiming, withDelay,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useLessonStore } from '@/store/lessonStore'
import { useProfile } from '@/hooks/useProfile'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { WORD_THEMES } from '@/lib/practiceThemes'
import ConfettiBurst from '@/components/celebrations/ConfettiBurst'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'
import { ROUTES } from '@/lib/routes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

function Star({ filled, delay }: { filled: boolean; delay: number }) {
  const scale = useSharedValue(0)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  useEffect(() => {
    if (filled) scale.value = withDelay(delay, withSpring(1, { damping: 6 }))
  }, [filled])
  return <Animated.Text style={[styles.star, style]}>{filled ? '⭐' : '☆'}</Animated.Text>
}

export default function GroupCompleteScreen() {
  const { theme } = useLocalSearchParams<{ theme: string }>()
  const { quizScore, quizTotal, wordsMastered, wordsSkipped, resetLesson } = useLessonStore()
  const { profile } = useProfile()
  const { user } = useAuthStore()
  const saved = useRef(false)

  const themeData    = WORD_THEMES[theme]
  const title        = `${themeData?.emoji ?? '🗂'} ${theme}`
  const streakDays   = profile?.streak_days ?? 0

  const scorePercent = quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : quizScore
  const stars        = scorePercent >= 90 ? 3 : scorePercent >= 70 ? 2 : 1
  const xpEarned     = Math.max(10, Math.round(scorePercent * 0.4) + wordsMastered.length * 4)

  const [scoreDisplay, setScoreDisplay] = useState(0)
  useEffect(() => {
    const target = scorePercent
    const start  = performance.now()
    const dur    = 650
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      setScoreDisplay(Math.round(target * t))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scorePercent])

  const cardTranslateY = useSharedValue(300)
  const scoreScale     = useSharedValue(0)
  const xpScale        = useSharedValue(0)
  const btnOpacity     = useSharedValue(0)

  const cardStyle  = useAnimatedStyle(() => ({ transform: [{ translateY: cardTranslateY.value }] }))
  const scoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }))
  const xpStyle    = useAnimatedStyle(() => ({ transform: [{ scale: xpScale.value }] }))
  const btnStyle   = useAnimatedStyle(() => ({ opacity: btnOpacity.value }))

  useEffect(() => {
    // Persist group completion once so the path unlocks the next group
    if (!saved.current && user && theme) {
      saved.current = true
      void supabase.from('group_progress').upsert(
        { user_id: user.id, group_name: theme, completed: true, completed_at: new Date().toISOString() },
        { onConflict: 'user_id,group_name' },
      )
    }

    haptics.celebrate()
    soundEngine.play('lessonComplete')
    cardTranslateY.value = withSpring(0, { damping: 18 })
    scoreScale.value     = withDelay(300, withSpring(1, { damping: 10 }))
    xpScale.value        = withDelay(700, withSpring(1, { damping: 8 }))
    btnOpacity.value     = withDelay(1400, withTiming(1, { duration: 400 }))
  }, [])

  const handleDone = () => {
    resetLesson()
    router.replace(ROUTES.HOME)
  }

  const message =
    scorePercent >= 90 ? 'You crushed it!' : scorePercent >= 70 ? 'Great work!' : 'Keep going!'

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.bg}>
        <ConfettiBurst />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>group complete</Text>
        </View>
        <Text style={styles.headline}>{message}</Text>
        <Text style={styles.patternSubtitle}>{title}</Text>
        <View style={styles.stars}>
          <Star filled={stars >= 1} delay={900} />
          <Star filled={stars >= 2} delay={1100} />
          <Star filled={stars >= 3} delay={1300} />
        </View>
      </View>

      <Animated.View style={[styles.bottomCard, cardStyle]}>
        <Animated.View style={[styles.scoreCircle, scoreStyle]}>
          <Text style={styles.scoreNum}>{scoreDisplay}</Text>
          <Text style={styles.scorePct}>%</Text>
        </Animated.View>

        <Animated.View style={[styles.xpBanner, xpStyle]}>
          <Text style={styles.xpText}>+{xpEarned} XP</Text>
        </Animated.View>

        <View style={styles.statsGrid}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{wordsMastered.length}</Text>
            <Text style={styles.statLabel}>Words mastered</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{wordsSkipped.length}</Text>
            <Text style={styles.statLabel}>Words skipped</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{streakDays}</Text>
            <Text style={styles.statLabel}>Streak kept</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{scorePercent}%</Text>
            <Text style={styles.statLabel}>Quiz accuracy</Text>
          </View>
        </View>

        <Animated.View style={[styles.btnRow, btnStyle]}>
          <TouchableOpacity style={styles.doneBtn} onPress={handleDone} accessibilityRole="button">
            <Text style={styles.doneBtnText}>back to groups →</Text>
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
  star:  { fontSize: 36 },
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
  btnRow: { flexDirection: 'row' },
  doneBtn: {
    flex: 1, backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },
})
