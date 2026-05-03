import React, { useEffect, type ReactNode } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { OnboardingProgressDots } from '@/components/onboarding/ProgressDots'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'

type Props = {
  icon: string
  eyebrow: string
  headline: string
  body: string
  ctaLabel: string
  dotsFilled: number
  /** Dot count for the extended post-signup flow (default 6). */
  dotsTotal?: number
  onEnable: () => void
  onSkip: () => void
  children?: ReactNode
}

export default function PermissionScreen({
  icon, eyebrow, headline, body, ctaLabel,
  dotsFilled, dotsTotal = 6, onEnable, onSkip, children,
}: Props) {
  const iconY = useSharedValue(-30)
  const iconOp = useSharedValue(0)
  const iconScale = useSharedValue(0)
  const contentY = useSharedValue(30)
  const contentOp = useSharedValue(0)
  const ctaScale = useSharedValue(0.8)
  const ctaOp = useSharedValue(0)
  const skipOp = useSharedValue(0)

  useEffect(() => {
    iconY.value = withSpring(0, { damping: 12, stiffness: 100 })
    iconOp.value = withTiming(1, { duration: 300 })
    iconScale.value = withDelay(100, withSpring(1, { damping: 8, stiffness: 120 }))

    contentY.value = withDelay(200, withSpring(0, { damping: 14, stiffness: 120 }))
    contentOp.value = withDelay(200, withTiming(1, { duration: 300 }))

    ctaScale.value = withDelay(600, withSpring(1, { damping: 12, stiffness: 140 }))
    ctaOp.value = withDelay(600, withTiming(1, { duration: 200 }))

    skipOp.value = withDelay(800, withTiming(1, { duration: 200 }))
  }, [])

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconY.value }, { scale: iconScale.value }],
    opacity: iconOp.value,
  }))

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentY.value }],
    opacity: contentOp.value,
  }))

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
    opacity: ctaOp.value,
  }))

  const skipStyle = useAnimatedStyle(() => ({
    opacity: skipOp.value,
  }))

  const handleEnable = () => {
    haptics.tap()
    soundEngine.play('tap')
    onEnable()
  }

  const handleSkip = () => {
    haptics.tap()
    onSkip()
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Teal hero */}
      <View style={styles.hero}>
        <Animated.View style={[styles.iconRing, iconStyle]}>
          <Text style={styles.iconEmoji}>{icon}</Text>
        </Animated.View>
      </View>

      {/* Bottom content */}
      <View style={styles.bottom}>
        <Animated.View style={[contentStyle, styles.textBlock]}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.body}>{body}</Text>
        </Animated.View>

        {children}

        <View style={styles.dotsRow}>
          <OnboardingProgressDots filled={dotsFilled} total={dotsTotal} variant="light" />
        </View>

        <Animated.View style={ctaStyle}>
          <Pressable style={styles.cta} onPress={handleEnable}>
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={skipStyle}>
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>not now</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  hero: {
    backgroundColor: colors.primary,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 40,
  },
  bottom: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  textBlock: {
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    color: colors.primary,
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  headline: {
    fontSize: fontSize.xxl,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 30,
  },
  body: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    lineHeight: 22,
  },
  dotsRow: {
    alignItems: 'flex-start',
    marginTop: 'auto',
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  skipText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
})
