import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, Pressable, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withDelay, withTiming, withSpring,
} from 'react-native-reanimated'
import { useLesson } from '@/hooks/useLesson'
import { usePronunciation } from '@/hooks/usePronunciation'
import AudioButton from '@/components/lesson/AudioButton'
import { haptics } from '@/lib/haptics'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import type { Word } from '@/lib/types'

// ── Single word row ───────────────────────────────────────────────────────────

function WordRow({ word, index }: { word: Word; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const { state: ps, startRecording, stopRecording, reset } = usePronunciation(word.text)

  // Staggered slide-in
  const tx = useSharedValue(32)
  const op = useSharedValue(0)
  useEffect(() => {
    tx.value = withDelay(index * 55, withSpring(0, { damping: 18, stiffness: 220 }))
    op.value = withDelay(index * 55, withTiming(1, { duration: 240 }))
    return () => reset()
  }, [])
  const anim = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateX: tx.value }] }))

  const isIdle = ps === 'idle', isRec = ps === 'recording'
  const isProc = ps === 'processing', isOk = ps === 'correct', isBad = ps === 'wrong'

  return (
    <Animated.View style={[styles.row, anim]}>
      {/* Top line: word + controls */}
      <View style={styles.rowMain}>
        {/* Word + phoneme */}
        <Pressable style={styles.wordBlock} onPress={() => setExpanded(e => !e)}>
          <Text style={styles.word} adjustsFontSizeToFit numberOfLines={1}>
            <Text style={styles.con}>{word.consonant}</Text>
            <Text style={styles.pat}>{word.pattern}</Text>
          </Text>
          <Text style={styles.phoneme}>{word.phoneme}</Text>
        </Pressable>

        {/* Controls */}
        <View style={styles.controls}>
          <AudioButton
            audioUrl={word.audio_url}
            fallbackText={word.text}
            size="sm"
          />

          <Pressable
            onPressIn={isIdle ? startRecording : undefined}
            onPressOut={isRec ? stopRecording : undefined}
            disabled={isProc}
            style={[
              styles.micBtn,
              isRec  && styles.micRec,
              isOk   && styles.micOk,
              isBad  && styles.micBad,
            ]}
            accessibilityLabel={isRec ? 'Release to check' : 'Hold to say the word'}
          >
            {isProc
              ? <ActivityIndicator size="small" color={colors.textMuted} />
              : isOk  ? <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              : isBad ? <Ionicons name="close-circle"     size={16} color={colors.error} />
              : isRec ? <View style={styles.recDot} />
              :         <Ionicons name="mic-outline"      size={16} color={colors.textMuted} />
            }
            <Text style={[
              styles.micLabel,
              isRec  && { color: colors.error },
              isOk   && { color: colors.primary },
              isBad  && { color: colors.error },
            ]}>
              {isProc  ? 'checking'
               : isOk  ? 'great!'
               : isBad ? 'try again'
               : isRec ? 'release…'
               :         'say it'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setExpanded(e => !e)}
            style={styles.expandBtn}
            accessibilityLabel={expanded ? 'Hide definition' : 'Show definition'}
          >
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      {/* Expanded definition */}
      {expanded && (
        <View style={styles.defRow}>
          <Text style={styles.definition}>{word.definition}</Text>
        </View>
      )}
    </Animated.View>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ReviewScreen() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { lesson, loading, error } = useLesson(id ?? '')

  const words: Word[] = lesson?.word_family?.words ?? []
  const familyTitle = lesson?.word_family?.pattern
    ? `${lesson.word_family.pattern} family`
    : (lesson?.title ?? '')
  const rule = lesson?.word_family?.rule ?? ''

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !lesson) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <Text style={{ color: colors.error, marginBottom: 12 }}>{error ?? 'Not found'}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{familyTitle}</Text>
          <Text style={styles.headerSub}>{words.length} words · tap any row to expand</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ done</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Pattern rule card */}
        {rule ? (
          <View style={styles.ruleCard}>
            <Ionicons name="bulb-outline" size={16} color={colors.primary} />
            <Text style={styles.ruleText}>{rule}</Text>
          </View>
        ) : null}

        {/* Word rows */}
        {words.map((word, i) => (
          <WordRow key={word.id} word={word} index={i} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  backBtn: { padding: 4, marginRight: 2 },
  headerTitle: { fontSize: fontSize.xl, fontWeight: '600', color: colors.text, fontFamily: 'Georgia' },
  headerSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  badge: {
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingVertical: 4, paddingHorizontal: 10,
  },
  badgeText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },

  list: { padding: spacing.lg, gap: spacing.sm },

  ruleCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 3, borderLeftColor: colors.primary,
    marginBottom: spacing.xs,
  },
  ruleText: { flex: 1, fontSize: fontSize.md, color: colors.text, lineHeight: 20 },

  // Word row
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowMain: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  wordBlock: { flex: 1, gap: 1 },
  word: {
    fontFamily: 'Georgia', fontSize: 26, lineHeight: 32,
  },
  con: { color: colors.consonant },
  pat: { color: colors.pattern },
  phoneme: { fontSize: fontSize.sm, color: colors.textMuted },

  controls: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },

  micBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.neutral, borderRadius: radius.md,
    paddingVertical: 6, paddingHorizontal: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  micRec:  { borderColor: colors.error, backgroundColor: '#FFF0EE' },
  micOk:   { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  micBad:  { borderColor: colors.error, backgroundColor: colors.errorLight },
  micLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '500' },
  recDot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.error },

  expandBtn: {
    padding: 6,
    backgroundColor: colors.neutral,
    borderRadius: radius.sm,
  },

  defRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  definition: { fontSize: fontSize.md, color: colors.text, lineHeight: 20 },
})
