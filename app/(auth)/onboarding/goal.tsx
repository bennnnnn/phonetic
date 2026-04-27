import React, { useEffect } from 'react'
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { OnboardingProgressDots } from '@/components/onboarding/ProgressDots'
import { useOnboardingStore } from '@/store/onboardingStore'
import { haptics } from '@/lib/haptics'

type GoalOption = {
  goal: 1 | 2 | 3 | 5
  label: string
  sublabel: string
  timeEst: string
  emoji: string
  tag?: string
  highlight?: boolean
}

const GOALS: GoalOption[] = [
  { goal: 1, label: 'Casual',  sublabel: '1 lesson',  timeEst: '~5 min a day',  emoji: '🌱', tag: 'Great place to start' },
  { goal: 2, label: 'Regular', sublabel: '2 lessons', timeEst: '~10 min a day', emoji: '⚡', tag: 'Most popular', highlight: true },
  { goal: 3, label: 'Serious', sublabel: '3 lessons', timeEst: '~15 min a day', emoji: '🔥', tag: '4× faster progress' },
  { goal: 5, label: 'Intense', sublabel: '5 lessons', timeEst: '~25 min a day', emoji: '🚀', tag: 'Full commitment' },
]

function GoalCard({
  option,
  selected,
  onSelect,
  delayMs,
}: {
  option: GoalOption
  selected: boolean
  onSelect: (goal: 1 | 2 | 3 | 5) => void
  delayMs: number
}) {
  const translateX = useSharedValue(60)
  const opacity = useSharedValue(0)
  const cardScale = useSharedValue(1)
  const radioScale = useSharedValue(selected ? 1 : 0)

  useEffect(() => {
    translateX.value = withDelay(
      delayMs,
      withSpring(0, { damping: 16, stiffness: 120 })
    )
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 250 }))
  }, [])

  useEffect(() => {
    radioScale.value = withSpring(selected ? 1 : 0, {
      damping: 10,
      stiffness: 200,
    })
  }, [selected])

  const handlePress = () => {
    cardScale.value = withSequence(
      withSpring(1.03, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    )
    runOnJS(haptics.tap)()
    onSelect(option.goal)
  }

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }))

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    backgroundColor: selected ? colors.primaryLight : colors.surface,
    borderColor: selected ? colors.primary : colors.border,
    borderWidth: selected ? 1.5 : 1,
  }))

  const radioStyle = useAnimatedStyle(() => ({
    transform: [{ scale: radioScale.value }],
  }))

  return (
    <Animated.View style={wrapStyle}>
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={styles.cardEmoji}>{option.emoji}</Text>
          <View style={styles.cardContent}>
            <View style={styles.cardLabelRow}>
              <Text style={styles.cardLabel}>{option.label}</Text>
              {option.highlight && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>⭐ popular</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardSub}>
              {option.sublabel} · {option.timeEst}
            </Text>
            {option.tag && !option.highlight && (
              <Text style={styles.cardTag}>{option.tag}</Text>
            )}
          </View>
          <View style={styles.radioOuter}>
            <Animated.View
              style={[
                styles.radioInner,
                { backgroundColor: selected ? colors.primary : 'transparent' },
                radioStyle,
              ]}
            />
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

export default function GoalScreen() {
  const { dailyGoal, setDailyGoal } = useOnboardingStore()

  const headerOpacity = useSharedValue(0)
  const headerY = useSharedValue(20)
  const ctaOpacity = useSharedValue(0)

  useEffect(() => {
    headerOpacity.value = withDelay(0, withTiming(1, { duration: 300 }))
    headerY.value = withDelay(0, withTiming(0, { duration: 300 }))
    ctaOpacity.value = withDelay(400, withTiming(1, { duration: 300 }))
  }, [])

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }))

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }))

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={headerStyle}>
          <Text style={styles.eyebrow}>SET YOUR GOAL</Text>
          <Text style={styles.headline}>How much do you want{'\n'}to learn each day?</Text>
        </Animated.View>

        <View style={styles.cards}>
          {GOALS.map((option, i) => (
            <GoalCard
              key={option.goal}
              option={option}
              selected={dailyGoal === option.goal}
              onSelect={setDailyGoal}
              delayMs={i * 50 + 100}
            />
          ))}
        </View>

        <View style={styles.dotsRow}>
          <OnboardingProgressDots filled={3} />
        </View>

        <Animated.View style={ctaStyle}>
          <Pressable
            style={styles.cta}
            onPress={() => router.push('/(auth)/onboarding/name')}
          >
            <Text style={styles.ctaText}>looks good</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    color: colors.primary,
    letterSpacing: 0.8,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  headline: {
    fontSize: fontSize.xxl,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 30,
  },
  cards: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
    gap: spacing.xs,
  },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  cardSub: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  cardTag: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 1,
  },
  popularBadge: {
    backgroundColor: colors.amber,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
  },
  dotsRow: {
    alignItems: 'flex-start',
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.surface,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
})
