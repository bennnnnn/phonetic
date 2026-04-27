import { useMemo, useCallback, useEffect, useRef, memo } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity, Pressable,
  StyleSheet, Alert, RefreshControl,
  useWindowDimensions,
} from 'react-native'
import { Stack, router, useFocusEffect } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay, withRepeat, withSequence,
} from 'react-native-reanimated'
import { useGroupProgress } from '@/hooks/useGroupProgress'
import { ROUTES } from '@/lib/routes'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { GROUP_NODES } from '@/lib/practiceThemes'
import { NODE_SIZE, NODE_GAP, NODE_STEP, INITIAL_TOP, DOT_SIZE, WAVE, PALETTE, buildDots } from '@/lib/pathLayout'

// ── Group node ────────────────────────────────────────────────────────────────

type GroupNodeProps = {
  id: string; emoji: string; name: string
  index: number; left: number; top: number
  done: boolean; unlocked: boolean; isCurrent: boolean
  onPress: () => void
}

const GroupNode = memo(function GroupNode({
  emoji, name, index, left, top, done, unlocked, isCurrent, onPress,
}: GroupNodeProps) {
  const pressed   = useSharedValue(0)
  const opacity   = useSharedValue(0)
  const glowScale = useSharedValue(1)

  const palette = done
    ? { bg: colors.primary, shadow: colors.primaryDark }
    : unlocked ? PALETTE[index % PALETTE.length]! : { bg: '#C5C3BC', shadow: '#9C9A92' }

  useEffect(() => {
    opacity.value = withDelay(index * 60, withTiming(1, { duration: 280 }))
    if (isCurrent) {
      glowScale.value = withRepeat(
        withSequence(withSpring(1.18, { damping: 8 }), withSpring(1, { damping: 8 })),
        -1, false,
      )
    }
  }, [isCurrent])

  const entryStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(pressed.value * 4, { damping: 12, stiffness: 400 }) }],
  }))
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: withSpring(isCurrent ? 0.35 : 0),
  }))

  return (
    <Animated.View style={[styles.nodeOuter, { left, top }, entryStyle]}>
      <Animated.View style={[styles.glowRing, { backgroundColor: palette.bg }, glowStyle]} pointerEvents="none" />
      <Pressable
        onPressIn={() => { if (unlocked || done) pressed.value = 1 }}
        onPressOut={() => { pressed.value = 0 }}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={done ? `Review ${name}` : unlocked ? `Start ${name}` : `${name} is locked`}
      >
        <View style={[styles.nodeShadow, { backgroundColor: palette.shadow }]} />
        <Animated.View style={[
          styles.nodeBody, { backgroundColor: palette.bg },
          !unlocked && !done && styles.nodeBodyLocked, pressStyle,
        ]}>
          {!unlocked && !done && (
            <View style={styles.lockBadge} pointerEvents="none">
              <Ionicons name="lock-closed" size={11} color="#fff" />
            </View>
          )}
          {done && (
            <View style={styles.doneBadge} pointerEvents="none">
              <Ionicons name="checkmark" size={11} color={colors.primary} />
            </View>
          )}
          <Text style={styles.groupEmoji}>{emoji}</Text>
          <Text style={[styles.groupName, !unlocked && !done && styles.groupNameMuted]}
            adjustsFontSizeToFit numberOfLines={1}>{name}</Text>
        </Animated.View>
      </Pressable>
      {isCurrent && (
        <View style={styles.tooltip}>
          <View style={styles.tooltipBubble}>
            <Text style={styles.tooltipText}>start →</Text>
          </View>
          <View style={styles.tooltipArrow} />
        </View>
      )}
    </Animated.View>
  )
})

// ── Screen ────────────────────────────────────────────────────────────────────

export default function VocabularyPathScreen() {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const { completedGroups, refetch: refetchGroups } = useGroupProgress()
  const scrollRef           = useRef<ScrollView>(null)
  const lastAutoScrolledFor = useRef<string | null>(null)

  const unlockedGroupNames = useMemo(() => {
    const set = new Set<string>()
    GROUP_NODES.forEach((g, i) => {
      if (i === 0 || completedGroups.includes(GROUP_NODES[i - 1]!.id)) set.add(g.id)
    })
    return set
  }, [completedGroups])

  const heroGroup = useMemo(
    () => GROUP_NODES.find((g) => !completedGroups.includes(g.id)) ?? null,
    [completedGroups],
  )

  const availableWidth = width - spacing.lg * 2 - NODE_SIZE
  const groupNodes = useMemo(() =>
    GROUP_NODES.map((g, i) => ({
      ...g, index: i,
      left: Math.round(availableWidth * WAVE[i % WAVE.length]!) + spacing.lg,
      top:  INITIAL_TOP + i * NODE_STEP,
    })),
  [availableWidth])

  const dots = useMemo(() => buildDots(groupNodes), [groupNodes])

  const totalHeight = groupNodes.length
    ? groupNodes[groupNodes.length - 1]!.top + NODE_SIZE + NODE_GAP + insets.bottom + spacing.xxl
    : 300

  useEffect(() => {
    if (!heroGroup || !groupNodes.length) return
    if (lastAutoScrolledFor.current === heroGroup.id) return
    const heroNode = groupNodes.find((n) => n.id === heroGroup.id)
    if (!heroNode) return
    lastAutoScrolledFor.current = heroGroup.id
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, heroNode.top - 100), animated: true })
    }, 500)
    return () => clearTimeout(t)
  }, [heroGroup?.id, groupNodes])

  useFocusEffect(useCallback(() => {
    void refetchGroups()
  }, [refetchGroups]))

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vocabulary</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => void refetchGroups()} />
        }
      >
        <View style={[styles.pathContainer, { height: totalHeight }]}>
          {dots.map((d) => (
            <View key={d.key} style={[styles.dot, { left: d.x, top: d.y, opacity: d.opacity }]} />
          ))}
          {groupNodes.map(({ id, emoji, name, index, left, top }) => {
            const done      = completedGroups.includes(id)
            const unlocked  = unlockedGroupNames.has(id)
            const isCurrent = id === heroGroup?.id
            return (
              <GroupNode
                key={id}
                id={id} emoji={emoji} name={name}
                index={index} left={left} top={top}
                done={done} unlocked={unlocked || done} isCurrent={isCurrent}
                onPress={() => {
                  if (!unlocked && !done) {
                    Alert.alert('Locked', 'Complete the previous topic to unlock this one.')
                    return
                  }
                  router.push(ROUTES.GROUP_LESSON(id))
                }}
              />
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.neutral },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  backBtn:      { padding: spacing.xs },
  headerTitle:  { flex: 1, textAlign: 'center', fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  headerSpacer: { width: 32 },
  scroll: { flex: 1 },
  pathContainer: { position: 'relative' },
  dot: {
    position: 'absolute',
    width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.textHint,
  },
  nodeOuter: { position: 'absolute', width: NODE_SIZE },
  glowRing: {
    position: 'absolute',
    width: NODE_SIZE + 24, height: NODE_SIZE + 24,
    borderRadius: (NODE_SIZE + 24) / 2,
    top: -12, left: -12,
  },
  nodeShadow: {
    position: 'absolute',
    top: 5, left: 0, right: 0, bottom: -5, borderRadius: NODE_SIZE / 2,
  },
  nodeBody: {
    width: NODE_SIZE, height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
    gap: 4, padding: 10,
  },
  nodeBodyLocked: { opacity: 0.6 },
  lockBadge: {
    position: 'absolute', top: 7, right: 7,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.30)',
    alignItems: 'center', justifyContent: 'center',
  },
  doneBadge: {
    position: 'absolute', top: 7, right: 7,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  groupEmoji:     { fontSize: 32, lineHeight: 38 },
  groupName:      { fontSize: 13, fontWeight: '700', color: '#fff', textAlign: 'center' },
  groupNameMuted: { color: 'rgba(255,255,255,0.55)' },
  tooltip: { alignItems: 'center', marginTop: 6 },
  tooltipBubble: {
    backgroundColor: colors.text, borderRadius: radius.full,
    paddingVertical: 4, paddingHorizontal: 12,
  },
  tooltipText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  tooltipArrow: {
    width: 8, height: 6,
    borderLeftWidth: 4, borderRightWidth: 4,
    borderTopWidth: 6, borderBottomWidth: 0,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: colors.text,
  },
})
