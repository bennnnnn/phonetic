/**
 * Duolingo-style onboarding question layout.
 *
 * Structure (top → bottom):
 *   ─ thin animated progress bar
 *   ─ optional back chevron
 *   ─ big bouncing emoji illustration
 *   ─ bold question text
 *   ─ staggered option cards (emoji · label · sublabel · checkmark)
 *   ─ CONTINUE button (disabled until a card is selected)
 */
import { useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay,
  interpolateColor,
} from 'react-native-reanimated'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

export type QuestionOption = {
  id: string
  emoji: string
  label: string
  sublabel?: string
}

type Props = {
  /** 0–1 fraction; drives the top progress bar */
  progress: number
  question: string
  /** Large emoji displayed as the "illustration" — omit to hide */
  illustration?: string
  options: QuestionOption[]
  selected: string | null
  onSelect: (id: string) => void
  onContinue: () => void
  onBack?: () => void
  continueLabel?: string
}

// ─── Progress bar ────────────────────────────────────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  const width = useSharedValue(0)
  useEffect(() => {
    width.value = withTiming(progress, { duration: 500 })
  }, [progress])
  const barStyle = useAnimatedStyle(() => ({
    flex: width.value,
  }))
  const gapStyle = useAnimatedStyle(() => ({
    flex: Math.max(1 - width.value, 0),
  }))
  return (
    <View style={pb.track}>
      <Animated.View style={[pb.fill, barStyle]} />
      <Animated.View style={[pb.gap, gapStyle]} />
    </View>
  )
}
const pb = StyleSheet.create({
  track: { flex: 1, height: 8, borderRadius: 999, backgroundColor: colors.primaryLight, flexDirection: 'row', overflow: 'hidden' },
  fill:  { backgroundColor: colors.primary },
  gap:   { backgroundColor: 'transparent' },
})

// ─── Illustration emoji ───────────────────────────────────────────────────────

function Illustration({ emoji }: { emoji: string }) {
  const scale = useSharedValue(0.4)
  const op    = useSharedValue(0)
  const bounce = useSharedValue(20)
  useEffect(() => {
    scale.value  = withSpring(1, { damping: 12, stiffness: 180 })
    op.value     = withTiming(1, { duration: 260 })
    bounce.value = withSpring(0, { damping: 14, stiffness: 140 })
  }, [])
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: bounce.value }],
    opacity: op.value,
  }))
  return (
    <Animated.View style={[il.wrap, style]}>
      <Text style={il.emoji}>{emoji}</Text>
    </Animated.View>
  )
}
const il = StyleSheet.create({
  wrap:  { alignItems: 'center', marginBottom: spacing.sm },
  emoji: { fontSize: 72 },
})

// ─── Option card ─────────────────────────────────────────────────────────────

function OptionCard({
  option, selected, onPress, delayMs,
}: {
  option: QuestionOption
  selected: boolean
  onPress: () => void
  delayMs: number
}) {
  const tx     = useSharedValue(48)
  const op     = useSharedValue(0)
  const scale  = useSharedValue(1)
  const border = useSharedValue(selected ? 1 : 0)

  useEffect(() => {
    tx.value = withDelay(delayMs, withSpring(0, { damping: 18, stiffness: 180 }))
    op.value = withDelay(delayMs, withTiming(1, { duration: 200 }))
  }, [])

  useEffect(() => {
    border.value = withTiming(selected ? 1 : 0, { duration: 180 })
    if (selected) {
      scale.value = withSpring(0.96, { damping: 10, stiffness: 400 })
      setTimeout(() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }) }, 120)
    }
  }, [selected])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { scale: scale.value }],
    opacity: op.value,
    backgroundColor: interpolateColor(border.value, [0, 1], [colors.surface, colors.primaryLight]),
    borderColor: interpolateColor(border.value, [0, 1], [colors.border, colors.primary]),
  }))

  const checkBg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(border.value, [0, 1], ['transparent', colors.primary]),
    borderColor: interpolateColor(border.value, [0, 1], [colors.border, colors.primary]),
  }))

  return (
    <Pressable onPress={onPress} style={oc.pressable}>
      <Animated.View style={[oc.card, containerStyle]}>
        {/* Left: emoji box */}
        <View style={oc.emojiBox}>
          <Text style={oc.emoji}>{option.emoji}</Text>
        </View>

        {/* Center: label + sublabel */}
        <View style={oc.textWrap}>
          <Text style={oc.label}>{option.label}</Text>
          {option.sublabel ? (
            <Text style={oc.sublabel}>{option.sublabel}</Text>
          ) : null}
        </View>

        {/* Right: checkmark circle */}
        <Animated.View style={[oc.check, checkBg]}>
          {selected && <Text style={oc.checkMark}>✓</Text>}
        </Animated.View>
      </Animated.View>
    </Pressable>
  )
}
const oc = StyleSheet.create({
  pressable: { marginBottom: spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.lg, borderWidth: 2,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    gap: spacing.md,
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  emojiBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: colors.neutral,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji:   { fontSize: 26 },
  textWrap: { flex: 1 },
  label:    { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  sublabel: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  check: {
    width: 26, height: 26, borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
})

// ─── Continue button ──────────────────────────────────────────────────────────

function ContinueBtn({ enabled, onPress, label = 'CONTINUE' }: { enabled: boolean; onPress: () => void; label?: string }) {
  const scale = useSharedValue(enabled ? 1 : 0.92)
  const op    = useSharedValue(enabled ? 1 : 0.4)

  useEffect(() => {
    scale.value = withSpring(enabled ? 1 : 0.92, { damping: 12, stiffness: 200 })
    op.value    = withTiming(enabled ? 1 : 0.4,  { duration: 200 })
    if (enabled) {
      // celebratory micro-bounce
      scale.value = withSpring(1.04, { damping: 10, stiffness: 300 })
      setTimeout(() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }) }, 130)
    }
  }, [enabled])

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: op.value }))

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        style={[cb.btn, enabled ? cb.active : cb.disabled]}
        onPress={onPress}
        disabled={!enabled}
        activeOpacity={0.85}
      >
        <Text style={cb.text}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
const cb = StyleSheet.create({
  btn:      { borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  active:   { backgroundColor: colors.primary },
  disabled: { backgroundColor: colors.border },
  text:     { color: '#fff', fontSize: fontSize.lg, fontWeight: '700', letterSpacing: 0.6 },
})

// ─── Main exported component ──────────────────────────────────────────────────

export function QuestionScreen({
  progress,
  question,
  illustration,
  options,
  selected,
  onSelect,
  onContinue,
  onBack,
  continueLabel,
}: Props) {
  const insets = useSafeAreaInsets()

  const questionY  = useSharedValue(16)
  const questionOp = useSharedValue(0)
  useEffect(() => {
    questionY.value  = withDelay(80, withSpring(0, { damping: 18, stiffness: 180 }))
    questionOp.value = withDelay(80, withTiming(1, { duration: 240 }))
  }, [])
  const questionStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: questionY.value }],
    opacity: questionOp.value,
  }))

  return (
    <View style={[qs.root, { paddingTop: insets.top + spacing.sm }]}>
      {/* ── Top bar ───────────────────────────────────────── */}
      <View style={qs.topBar}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={qs.backBtn} hitSlop={12}>
            <Text style={qs.backChevron}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={qs.backPlaceholder} />
        )}
        <ProgressBar progress={progress} />
        <View style={qs.backPlaceholder} />
      </View>

      {/* ── Scrollable body ───────────────────────────────── */}
      <ScrollView
        style={qs.scroll}
        contentContainerStyle={qs.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {illustration ? <Illustration emoji={illustration} /> : null}

        <Animated.Text style={[qs.question, questionStyle]}>
          {question}
        </Animated.Text>

        <View style={qs.options}>
          {options.map((opt, i) => (
            <OptionCard
              key={opt.id}
              option={opt}
              selected={selected === opt.id}
              onPress={() => onSelect(opt.id)}
              delayMs={160 + i * 70}
            />
          ))}
        </View>
      </ScrollView>

      {/* ── Footer ────────────────────────────────────────── */}
      <View style={[qs.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <ContinueBtn enabled={!!selected} onPress={onContinue} label={continueLabel} />
      </View>
    </View>
  )
}

const qs = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, gap: spacing.md,
    paddingBottom: spacing.md,
  },
  backBtn:         { padding: 4 },
  backChevron:     { fontSize: 28, color: colors.textMuted, lineHeight: 32 },
  backPlaceholder: { width: 32 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

  question: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 34,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  options: { paddingBottom: spacing.lg },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.neutral,
  },
})
