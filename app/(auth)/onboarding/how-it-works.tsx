import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withSequence, withDelay, withRepeat,
  runOnJS,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { OnboardingProgressDots } from '@/components/onboarding/ProgressDots'
import { haptics } from '@/lib/haptics'

// ── Data ─────────────────────────────────────────────────────────────────────

const PATTERN = 'ake'
const PHONEME = '/eɪk/'

const CONSONANTS = [
  { letter: 'b',  def: 'to cook something in an oven' },
  { letter: 'c',  def: 'a sweet baked treat' },
  { letter: 'l',  def: 'a large body of water' },
  { letter: 't',  def: 'to grab and carry' },
  { letter: 'sn', def: 'a long, slithering reptile' },
  { letter: 'w',  def: 'to stop sleeping' },
  { letter: 'm',  def: 'to create or produce' },
  { letter: 'r',  def: 'a garden tool with tines' },
]

const { width: SCREEN_W } = Dimensions.get('window')

// ── Consonant chip ────────────────────────────────────────────────────────────

function Chip({
  letter, selected, onPress,
}: {
  letter: string; selected: boolean; onPress: () => void
}) {
  const scale = useSharedValue(1)

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.86, { damping: 6, stiffness: 400 }),
      withSpring(1,    { damping: 8, stiffness: 300 }),
    )
    onPress()
  }

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: selected ? colors.primary : colors.surface,
    borderColor: selected ? colors.primary : colors.border,
  }))

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View style={[styles.chip, chipStyle]}>
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {letter}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const [selected, setSelected] = useState<typeof CONSONANTS[number] | null>(null)
  const [tapCount, setTapCount] = useState(0)

  // Word display
  const wordScale    = useSharedValue(1)
  const wordOpacity  = useSharedValue(0)
  const consonantOp  = useSharedValue(0)

  // Definition card
  const defY   = useSharedValue(12)
  const defOp  = useSharedValue(0)

  // CTA
  const ctaOp = useSharedValue(0)

  // Pre-tap: question mark pulses
  const pulseScale = useSharedValue(1)
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 700 }),
        withTiming(1,    { duration: 700 }),
      ), -1, true
    )
    wordOpacity.value = withDelay(300, withTiming(1, { duration: 250 }))
  }, [])

  const handleTap = useCallback((item: typeof CONSONANTS[number]) => {
    pulseScale.value = withSpring(1, { damping: 20 }) // stop pulsing

    // Word pop
    wordScale.value = withSequence(
      withSpring(1.18, { damping: 5, stiffness: 350 }),
      withSpring(1,    { damping: 8, stiffness: 240 }),
    )
    consonantOp.value = withSequence(withTiming(0, { duration: 60 }), withTiming(1, { duration: 180 }))

    // Definition slide in
    defOp.value = withTiming(0, { duration: 80 })
    defY.value  = withTiming(8, { duration: 80 })
    setTimeout(() => {
      defOp.value = withTiming(1, { duration: 220 })
      defY.value  = withSpring(0, { damping: 14, stiffness: 160 })
    }, 100)

    setSelected(item)
    setTapCount((c) => {
      const next = c + 1
      if (next >= 2) {
        ctaOp.value = withDelay(400, withTiming(1, { duration: 300 }))
      }
      return next
    })
    runOnJS(haptics.tap)()
  }, [])

  const wordStyle    = useAnimatedStyle(() => ({
    transform: [{ scale: wordScale.value }],
    opacity: wordOpacity.value,
  }))
  const consonantStyle = useAnimatedStyle(() => ({ opacity: consonantOp.value }))
  const defStyle     = useAnimatedStyle(() => ({
    opacity: defOp.value,
    transform: [{ translateY: defY.value }],
  }))
  const ctaStyle     = useAnimatedStyle(() => ({ opacity: ctaOp.value }))
  const pulseStyle   = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* ── Teal hero ─────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>TAP A LETTER</Text>

        <Animated.View style={[styles.wordWrap, wordStyle]}>
          {selected ? (
            <Animated.Text style={[styles.consonant, consonantStyle]}>
              {selected.letter}
            </Animated.Text>
          ) : (
            <Animated.View style={[styles.blankWrap, pulseStyle]}>
              <Text style={styles.blank}>?</Text>
            </Animated.View>
          )}
          <Text style={styles.patternText}>{PATTERN}</Text>
        </Animated.View>

        <View style={styles.phonemePill}>
          <Text style={styles.phoneme}>{PHONEME}</Text>
        </View>
      </View>

      {/* ── Bottom content ─────────────────────────────────────────────── */}
      <View style={styles.bottom}>
        <Text style={styles.headline}>
          {tapCount === 0
            ? 'One pattern — infinite words.'
            : tapCount === 1
            ? 'See? Tap another.'
            : 'Every consonant, same sound.'}
        </Text>

        {/* Chips grid */}
        <View style={styles.chipsGrid}>
          {CONSONANTS.map((item) => (
            <Chip
              key={item.letter}
              letter={item.letter}
              selected={selected?.letter === item.letter}
              onPress={() => handleTap(item)}
            />
          ))}
        </View>

        {/* Definition */}
        {selected ? (
          <Animated.View style={[styles.defCard, defStyle]}>
            <Text style={styles.defWord}>
              <Text style={styles.defConsonant}>{selected.letter}</Text>
              <Text style={styles.defPattern}>{PATTERN}</Text>
            </Text>
            <Text style={styles.defText}>{selected.def}</Text>
          </Animated.View>
        ) : (
          <View style={styles.defCardPlaceholder} />
        )}

        <View style={styles.dotsRow}>
          <OnboardingProgressDots filled={2} />
        </View>

        <Animated.View style={ctaStyle} pointerEvents={tapCount >= 2 ? 'auto' : 'none'}>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.push('/(auth)/onboarding/goal')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>keep going →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },

  hero: {
    backgroundColor: colors.primary,
    height: Math.round(Dimensions.get('window').height * 0.36),
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  heroEyebrow: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
    letterSpacing: 1.2,
    position: 'absolute',
    top: spacing.lg,
  },

  wordWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  blankWrap: { marginRight: 2 },
  blank:       { fontSize: 72, fontFamily: 'Georgia', color: 'rgba(255,255,255,0.4)' },
  consonant:   { fontSize: 72, fontFamily: 'Georgia', color: '#B4E8D6' },
  patternText: { fontSize: 72, fontFamily: 'Georgia', color: '#fff' },

  phonemePill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  phoneme: { fontSize: fontSize.md, color: '#fff', fontWeight: '500' },

  bottom: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  headline: {
    fontSize: fontSize.xl,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 26,
  },

  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1.5,
    minWidth: 46,
    alignItems: 'center',
  },
  chipText:         { fontSize: fontSize.lg, fontFamily: 'Georgia', color: colors.text },
  chipTextSelected: { color: '#fff' },

  defCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  defCardPlaceholder: { height: 56 },
  defWord: { fontFamily: 'Georgia', fontSize: fontSize.xl },
  defConsonant: { color: colors.consonant },
  defPattern:   { color: colors.primary },
  defText:      { flex: 1, fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 18 },

  dotsRow: { alignItems: 'flex-start', marginTop: 'auto' },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ctaText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '600' },
})
