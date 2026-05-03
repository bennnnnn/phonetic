import { useState, useEffect, useRef } from 'react'
import {
  View, Text, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withDelay, withTiming, withSpring,
} from 'react-native-reanimated'
import AudioButton from '@/components/lesson/AudioButton'
import { transcribeAudio } from '@/lib/whisper'
import { haptics } from '@/lib/haptics'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { WORD_PRONUNCIATIONS } from '@/data/vocabThemes'
import { WORD_EXAMPLES } from '@/data/examples'
import type { Word } from '@/lib/types'

type Props = {
  word: Word
  index: number
}

export default function WordRow({ word, index }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [pronState, setPronState] = useState<'idle' | 'recording' | 'processing' | 'correct' | 'wrong'>('idle')
  const recRef = useRef<Audio.Recording | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef(0)
  const mountedRef = useRef(true)
  const isProverb = word.id.startsWith('proverb:')

  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  const handlePronResult = (matched: boolean) => {
    clearTimer()
    if (matched) {
      setPronState('correct')
      haptics.success()
      setTimeout(() => { if (mountedRef.current) setPronState('idle') }, 1500)
    } else {
      setPronState('wrong')
      haptics.error()
      setTimeout(() => { if (mountedRef.current) setPronState('idle') }, 1500)
    }
  }

  const stopRecording = async () => {
    clearTimer()
    const rec = recRef.current
    if (!rec) return

    const elapsed = Date.now() - startTimeRef.current
    if (elapsed < 400) { setPronState('idle'); return }

    setPronState('processing')
    try {
      await rec.stopAndUnloadAsync()
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true })

      const uri = rec.getURI()
      if (!uri) { setPronState('idle'); return }

      const transcript = await transcribeAudio(uri)
      const target = word.text.toLowerCase().trim()
      const words = transcript.split(/\s+/).map((w) => w.replace(/[^a-z'-]/g, ''))
      const matched = words.some((w) => w === target || w.startsWith(target) || target.startsWith(w))
      handlePronResult(matched)
    } catch {
      handlePronResult(false)
    }
  }

  const startRecording = async () => {
    if (pronState !== 'idle') return
    try {
      const { granted } = await Audio.requestPermissionsAsync()
      if (!granted) return
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      )
      recRef.current = recording
      startTimeRef.current = Date.now()
      setPronState('recording')
      timerRef.current = setTimeout(() => void stopRecording(), 5000)
    } catch {
      // silent fail
    }
  }

  // Staggered slide-in
  const tx = useSharedValue(32)
  const op = useSharedValue(0)
  useEffect(() => {
    tx.value = withDelay(index * 55, withSpring(0, { damping: 18, stiffness: 220 }))
    op.value = withDelay(index * 55, withTiming(1, { duration: 240 }))
  }, [])
  const anim = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateX: tx.value }] }))

  const pronunciation = word.pronunciation || WORD_PRONUNCIATIONS[word.text.toLowerCase()] || word.phoneme

  return (
    <Animated.View style={[styles.row, anim]}>
      <View style={[styles.rowMain, isProverb && { alignItems: 'flex-start' }]}>
        <Pressable style={styles.wordBlock} onPress={() => setExpanded(e => !e)}>
          {isProverb ? (
            <Text style={[styles.word, { fontSize: 16, lineHeight: 22 }]} numberOfLines={0}>
              {word.text}
            </Text>
          ) : (
            <Text style={styles.word} adjustsFontSizeToFit numberOfLines={1}>
              <Text style={styles.con}>{word.consonant}</Text>
              <Text style={styles.pat}>{word.pattern}</Text>
            </Text>
          )}
          {!isProverb && pronunciation !== word.text && pronunciation !== word.pattern && (
            <Text style={styles.pronunciation}>{pronunciation}</Text>
          )}
        </Pressable>

        <View style={styles.controls}>
          <AudioButton
            audioUrl={word.audio_url}
            fallbackText={word.text}
            size="sm"
          />

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

      {expanded && (
        <View style={styles.defRow}>
          <View style={styles.defTextBlock}>
            {word.definition ? (
              <Text style={isProverb ? styles.defHint : styles.definition}>
                {'  •  '}{word.definition}
              </Text>
            ) : null}
            {(() => {
              const key = word.text.toLowerCase()
              const examples = WORD_EXAMPLES[key]
              if (!examples) return null
              const example = examples[0]
              // Highlight the word in the example
              const regex = new RegExp(`\\b(${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
              const parts = example.split(regex)
              return (
                <Text style={styles.exampleText}>
                  {'  •  '}
                  {parts.map((part, i) =>
                    part.toLowerCase() === key
                      ? <Text key={i} style={styles.highlightedWord}>{part}</Text>
                      : <Text key={i}>{part}</Text>
                  )}
                </Text>
              )
            })()}
          </View>
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
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
  pronunciation: { fontSize: fontSize.sm, color: colors.textMuted },

  controls: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },

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
    flexDirection: 'row', gap: spacing.sm,
  },
  defTextBlock: { flex: 1, gap: 4 },
  definition: { fontSize: fontSize.md, color: colors.text, lineHeight: 20 },
  defHint: { fontSize: fontSize.md, color: colors.textHint, fontStyle: 'italic' },
  exampleText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    lineHeight: 20,
  },
  highlightedWord: {
    color: colors.primary,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
})
