import { useEffect, memo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay, withRepeat, withSequence,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '@/lib/tokens'
import { NODE_SIZE, NODE_STEP, DOT_SIZE, WAVE, PALETTE } from '@/lib/pathLayout'

type Props = {
  pattern: string
  index: number
  left: number
  top: number
  done: boolean
  unlocked: boolean
  isCurrent: boolean
  stars: number
  expanded: boolean
  onPress: () => void
}

export default memo(function LessonNode({
  pattern, index, left, top, done, unlocked, isCurrent, stars, expanded, onPress,
}: Props) {
  const pressed   = useSharedValue(0)
  const cascadeY  = useSharedValue(-28)
  const cascadeOp = useSharedValue(0)
  const glowScale = useSharedValue(1)
  const palette   = done
    ? { bg: colors.primary, shadow: colors.primaryDark }
    : unlocked
      ? PALETTE[index % PALETTE.length]!
      : { bg: '#C5C3BC', shadow: '#9C9A92' }

  useEffect(() => {
    if (expanded) {
      cascadeY.value  = -28
      cascadeOp.value = 0
      cascadeY.value  = withDelay(index * 55, withSpring(0, { damping: 14, stiffness: 180 }))
      cascadeOp.value = withDelay(index * 55, withTiming(1, { duration: 220 }))
    } else {
      cascadeY.value  = withTiming(-28, { duration: 160 })
      cascadeOp.value = withTiming(0, { duration: 160 })
    }
  }, [expanded])

  useEffect(() => {
    if (isCurrent) {
      glowScale.value = withRepeat(
        withSequence(withSpring(1.18, { damping: 8 }), withSpring(1, { damping: 8 })),
        -1, false,
      )
    }
  }, [isCurrent])

  const cascadeStyle = useAnimatedStyle(() => ({
    opacity: cascadeOp.value,
    transform: [{ translateY: cascadeY.value }],
  }))
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(pressed.value * 4, { damping: 12, stiffness: 400 }) }],
  }))
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: withSpring(isCurrent ? 0.35 : 0),
  }))

  return (
    <Animated.View style={[styles.outer, { left, top }, cascadeStyle]}>
      <Animated.View style={[styles.glow, { backgroundColor: palette.bg }, glowStyle]} pointerEvents="none" />
      <Pressable
        onPressIn={() => { if (unlocked || done) pressed.value = 1 }}
        onPressOut={() => { pressed.value = 0 }}
        onPress={onPress}
      >
        <View style={[styles.shadow, { backgroundColor: palette.shadow }]} />
        <Animated.View style={[
          styles.body, { backgroundColor: palette.bg },
          !unlocked && !done && styles.bodyLocked, pressStyle,
        ]}>
          {!unlocked && !done && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={11} color="#fff" />
            </View>
          )}
          {done && (
            <View style={styles.doneBadge}>
              <Ionicons name="checkmark" size={11} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.pattern, !unlocked && !done && styles.patternMuted]}
            adjustsFontSizeToFit numberOfLines={1}>
            {pattern.replace(/^-/, '')}
          </Text>
          <View style={styles.starsRow}>
            {[0, 1, 2].map((i) => (
              <Ionicons key={i}
                name={i < stars ? 'star' : 'star-outline'}
                size={11}
                color={i < stars ? '#FFD700' : 'rgba(255,255,255,0.4)'}
              />
            ))}
          </View>
        </Animated.View>
      </Pressable>
      {isCurrent && (
        <View style={styles.tooltip}>
          <View style={styles.tooltipBubble}>
            <Text style={styles.tooltipText}>{stars > 0 ? 'continue →' : 'start →'}</Text>
          </View>
          <View style={styles.tooltipArrow} />
        </View>
      )}
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  outer: { position: 'absolute', width: NODE_SIZE },
  glow: {
    position: 'absolute', width: NODE_SIZE + 24, height: NODE_SIZE + 24,
    borderRadius: (NODE_SIZE + 24) / 2, top: -12, left: -12,
  },
  shadow: { position: 'absolute', top: 5, left: 0, right: 0, bottom: -5, borderRadius: NODE_SIZE / 2 },
  body: {
    width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2,
    alignItems: 'center', justifyContent: 'center', gap: 4, padding: 10,
  },
  bodyLocked: { opacity: 0.6 },
  lockBadge: {
    position: 'absolute', top: 7, right: 7, width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.30)', alignItems: 'center', justifyContent: 'center',
  },
  doneBadge: {
    position: 'absolute', top: 7, right: 7, width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  pattern: { fontFamily: 'Georgia', fontSize: 30, fontWeight: '700', color: '#fff', textAlign: 'center' },
  patternMuted: { color: 'rgba(255,255,255,0.55)' },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  tooltip: { alignItems: 'center', marginTop: 6 },
  tooltipBubble: {
    backgroundColor: colors.text, borderRadius: 999,
    paddingVertical: 4, paddingHorizontal: 12,
  },
  tooltipText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  tooltipArrow: {
    width: 8, height: 6,
    borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 6, borderBottomWidth: 0,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.text,
  },
})
