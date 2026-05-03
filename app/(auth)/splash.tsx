import { useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

const { width: SW } = Dimensions.get('window')
const AUTO_ADVANCE_MS = 2800

function navigate() {
  router.replace('/(auth)/welcome')
}

export default function SplashScreen() {
  // Logo card
  const logoScale = useSharedValue(0.3)
  const logoOpacity = useSharedValue(0)
  const logoRotate = useSharedValue(-12)

  // App name + tagline
  const titleY = useSharedValue(20)
  const titleOpacity = useSharedValue(0)

  // Progress dots
  const dot1W = useSharedValue(6)
  const dot2W = useSharedValue(6)
  const dot3W = useSharedValue(6)
  const dot1Op = useSharedValue(0.35)
  const dot2Op = useSharedValue(0.35)
  const dot3Op = useSharedValue(0.35)

  // Exit animation
  const exitScale = useSharedValue(1)
  const exitOpacity = useSharedValue(1)

  const exit = useCallback(() => {
    exitScale.value = withTiming(1.08, { duration: 300 })
    exitOpacity.value = withTiming(0, { duration: 280 }, () => {
      runOnJS(navigate)()
    })
  }, [])

  useEffect(() => {
    // Logo scales in with rotation
    logoScale.value = withSpring(1, { damping: 10, stiffness: 100 })
    logoOpacity.value = withTiming(1, { duration: 400 })
    logoRotate.value = withSpring(0, { damping: 10, stiffness: 100 })

    // Title slides up
    titleY.value = withDelay(250, withSpring(0, { damping: 14, stiffness: 120 }))
    titleOpacity.value = withDelay(250, withTiming(1, { duration: 350 }))

    // Dot 1 activates
    dot1W.value = withDelay(600, withSpring(18, { damping: 12, stiffness: 140 }))
    dot1Op.value = withDelay(600, withTiming(1, { duration: 200 }))

    // Dot 2 activates
    dot2W.value = withDelay(1100, withSpring(18, { damping: 12, stiffness: 140 }))
    dot2Op.value = withDelay(1100, withTiming(1, { duration: 200 }))

    // Dot 3 activates, then exit
    dot3W.value = withDelay(1600, withSpring(18, { damping: 12, stiffness: 140 }))
    dot3Op.value = withDelay(1600, withTiming(1, { duration: 200 }))

    const t = setTimeout(() => {
      runOnJS(exit)()
    }, AUTO_ADVANCE_MS)

    return () => clearTimeout(t)
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
    opacity: logoOpacity.value,
  }))

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }))

  const dot1Style = useAnimatedStyle(() => ({
    width: dot1W.value,
    opacity: dot1Op.value,
  }))

  const dot2Style = useAnimatedStyle(() => ({
    width: dot2W.value,
    opacity: dot2Op.value,
  }))

  const dot3Style = useAnimatedStyle(() => ({
    width: dot3W.value,
    opacity: dot3Op.value,
  }))

  const exitStyle = useAnimatedStyle(() => ({
    transform: [{ scale: exitScale.value }],
    opacity: exitOpacity.value,
  }))

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.center, exitStyle]}>
        {/* Logo card — scales in with slight rotation */}
        <Animated.View style={[styles.logoCard, logoStyle]}>
          <Text style={styles.logoText}>Pf</Text>
        </Animated.View>

        {/* App name + tagline */}
        <Animated.View style={[styles.titles, titleStyle]}>
          <Text style={styles.appName}>PhonicsFlow</Text>
          <Text style={styles.tagline}>hack the english code</Text>
        </Animated.View>

        {/* Progress dots that expand sequentially */}
        <View style={styles.dots}>
          <Animated.View style={[styles.dot, dot1Style, styles.dotActive]} />
          <Animated.View style={[styles.dot, dot2Style, styles.dotActive]} />
          <Animated.View style={[styles.dot, dot3Style, styles.dotActive]} />
        </View>
      </Animated.View>

      {/* Home indicator */}
      <View style={styles.indicator} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  logoCard: {
    width: 80,
    height: 80,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  logoText: {
    fontFamily: 'Georgia',
    fontSize: 32,
    fontWeight: '500',
    color: colors.primary,
  },
  titles: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 26,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 5,
    fontSize: fontSize.md,
    color: '#9FE1CB',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  dot: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9FE1CB',
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  indicator: {
    alignSelf: 'center',
    width: 90,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: spacing.md,
  },
})
