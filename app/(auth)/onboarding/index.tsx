import React, { useEffect } from 'react'
import {
  Pressable,
  SafeAreaView,
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
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { OnboardingProgressDots } from '@/components/onboarding/ProgressDots'

const PILLS = [
  { consonant: 'b', pattern: 'ake' },
  { consonant: 'c', pattern: 'ake' },
  { consonant: 'l', pattern: 'ake' },
  { consonant: 'sn', pattern: 'ake' },
]

const STAGGER_MS = 80

function WordPill({
  consonant,
  pattern,
  delayMs,
}: {
  consonant: string
  pattern: string
  delayMs: number
}) {
  const translateY = useSharedValue(40)
  const opacity = useSharedValue(0)

  useEffect(() => {
    translateY.value = withDelay(
      delayMs,
      withSpring(0, { damping: 14, stiffness: 120 })
    )
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 200 }))
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  return (
    <Animated.View style={[styles.pill, style]}>
      <Text style={styles.pillConsonant}>{consonant}</Text>
      <Text style={styles.pillPattern}>{pattern}</Text>
    </Animated.View>
  )
}

export default function OnboardingIndex() {
  const heroY = useSharedValue(-80)
  const heroOpacity = useSharedValue(0)

  const bottomOpacity = useSharedValue(0)
  const bottomY = useSharedValue(30)

  const ctaScale = useSharedValue(0.8)
  const ctaOpacity = useSharedValue(0)

  const skipOpacity = useSharedValue(0)

  useEffect(() => {
    heroY.value = withSpring(0, { damping: 14, stiffness: 100 })
    heroOpacity.value = withTiming(1, { duration: 300 })

    bottomOpacity.value = withDelay(300, withTiming(1, { duration: 300 }))
    bottomY.value = withDelay(300, withTiming(0, { duration: 300 }))

    ctaScale.value = withDelay(600, withSpring(1, { damping: 12, stiffness: 140 }))
    ctaOpacity.value = withDelay(600, withTiming(1, { duration: 200 }))

    skipOpacity.value = withDelay(400, withTiming(1, { duration: 200 }))
  }, [])

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: heroY.value }],
    opacity: heroOpacity.value,
  }))

  const bottomStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
    transform: [{ translateY: bottomY.value }],
  }))

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
    opacity: ctaOpacity.value,
  }))

  const skipStyle = useAnimatedStyle(() => ({
    opacity: skipOpacity.value,
  }))

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.skipRow, skipStyle]}>
        <Pressable onPress={() => router.replace('/(auth)/signup')}>
          <Text style={styles.skipText}>skip</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.hero}>
        <Animated.View style={[styles.heroInner, heroStyle]}>
          <Text style={styles.heroPattern}>
            <Text style={styles.underscore}>_</Text>
            <Text style={styles.patternAke}>ake</Text>
          </Text>
        </Animated.View>

        <View style={styles.pillRow}>
          {PILLS.map((p, i) => (
            <WordPill
              key={p.consonant}
              consonant={p.consonant}
              pattern={p.pattern}
              delayMs={i * STAGGER_MS}
            />
          ))}
        </View>
      </View>

      <Animated.View style={[styles.bottom, bottomStyle]}>
        <Text style={styles.eyebrow}>PHONICSFLOW</Text>
        <Text style={styles.headline}>English spelling isn't random. There's a code.</Text>
        <Text style={styles.body}>
          Learn the hidden patterns once and you'll be able to read and pronounce
          any English word — forever.
        </Text>

        <View style={styles.dotsRow}>
          <OnboardingProgressDots filled={1} />
        </View>

        <Animated.View style={ctaStyle}>
          <Pressable
            style={styles.cta}
            onPress={() => router.push('/(auth)/onboarding/how-it-works')}
          >
            <Text style={styles.ctaText}>show me how it works</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  skipRow: {
    position: 'absolute',
    top: 56,
    right: spacing.lg,
    zIndex: 10,
  },
  skipText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  hero: {
    backgroundColor: colors.primaryLight,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  heroInner: {
    alignItems: 'center',
  },
  heroPattern: {
    fontSize: 64,
    fontFamily: 'Georgia',
  },
  underscore: {
    color: colors.consonant,
  },
  patternAke: {
    color: colors.pattern,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryMid,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillConsonant: {
    fontSize: fontSize.lg,
    color: colors.consonant,
    fontFamily: 'Georgia',
  },
  pillPattern: {
    fontSize: fontSize.lg,
    color: colors.pattern,
    fontFamily: 'Georgia',
  },
  bottom: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    color: colors.primary,
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  headline: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 30,
  },
  body: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  dotsRow: {
    marginTop: spacing.sm,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ctaText: {
    color: colors.surface,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
})
