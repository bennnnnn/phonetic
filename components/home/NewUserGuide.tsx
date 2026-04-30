import { useEffect, useRef } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

type Props = {
  name: string
  onDismiss: () => void
  onAutoTapPhonics: () => void
}

/**
 * NewUserGuide — animated guided tour for first-time users.
 *
 * Shows a semi-transparent backdrop, a small greeting, and a
 * "start here →" tooltip pointing at the Phonics chapter card.
 * Tapping the card or the backdrop dismisses the guide and
 * expands the Phonics chapter.
 */
export function NewUserGuide({ name, onDismiss, onAutoTapPhonics }: Props) {
  const hasMounted = useRef(false)

  // ── Shared values ────────────────────────────────────────────────────
  const backdropOp = useSharedValue(0)

  const greetingOp = useSharedValue(0)
  const greetingY  = useSharedValue(-16)

  const tooltipOp = useSharedValue(0)
  const tooltipY  = useSharedValue(10)

  // Entrance
  useEffect(() => {
    if (hasMounted.current) return
    hasMounted.current = true

    backdropOp.value = withTiming(1, { duration: 400 })

    greetingOp.value = withDelay(350, withTiming(1, { duration: 300 }))
    greetingY.value  = withDelay(350, withSpring(0, { damping: 14, stiffness: 130 }))

    // Tooltip appears after greeting settles
    tooltipOp.value  = withDelay(800, withTiming(1, { duration: 200 }))
    tooltipY.value   = withDelay(800, withSpring(0, { damping: 12, stiffness: 140 }))
  }, [])

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOp.value }))
  const greetingStyle = useAnimatedStyle(() => ({
    opacity: greetingOp.value,
    transform: [{ translateY: greetingY.value }],
  }))
  const tipStyle = useAnimatedStyle(() => ({
    opacity: tooltipOp.value,
    transform: [{ translateY: tooltipY.value }],
  }))

  const handleTap = () => {
    onAutoTapPhonics()
    onDismiss()
  }

  return (
    <>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleTap} />
      </Animated.View>

      {/* Greeting */}
      <Animated.View style={[styles.greeting, greetingStyle]} pointerEvents="none">
        <Text style={styles.greetingText}>
          👋 <Text style={styles.nameText}>{name}</Text>
        </Text>
        <Text style={styles.subText}>start here</Text>
      </Animated.View>

      {/* Tooltip */}
      <Animated.View style={[styles.tooltipWrap, tipStyle]} pointerEvents="none">
        <View style={styles.tooltipBubble}>
          <Text style={styles.tooltipText}>start here →</Text>
        </View>
        <View style={styles.tooltipArrow} />
      </Animated.View>

      {/* Tap target over the actual Phonics card */}
      <Pressable style={styles.tapTarget} onPress={handleTap} />
    </>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(44,44,42,0.40)',
    zIndex: 10,
  },

  greeting: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
    gap: 2,
  },
  greetingText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#fff',
  },
  nameText: {
    color: '#9FE1CB',
  },
  subText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.60)',
    fontWeight: '500',
  },

  // Tooltip pointing at the Phonics chapter card below
  tooltipWrap: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 25,
  },
  tooltipBubble: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  tooltipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  tooltipArrow: {
    width: 10,
    height: 8,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
  },

  // Invisible tap target over the Phonics card
  tapTarget: {
    position: 'absolute',
    width: 300,
    height: 80,
    top: 82,
    borderRadius: radius.xl,
    zIndex: 30,
    alignSelf: 'center',
  },
})
