import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, Pressable, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay,
} from 'react-native-reanimated'
import * as Speech from 'expo-speech'
import { supabase } from '@/lib/supabase'
import { usePronunciation } from '@/hooks/usePronunciation'
import { useTranslation, prefetchTranslations } from '@/hooks/useTranslation'
import { languageByCode } from '@/lib/languages'
import AudioButton from '@/components/lesson/AudioButton'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { WORD_THEMES, WORD_EMOJI, SPEECH_LOCALES } from '@/lib/practiceThemes'
import type { PracticeWord } from '@/hooks/usePracticeWords'

// Module-level mastery cache — survives remounts, cleared on app restart
const masteryCache = new Map<string, Set<string>>()

// ── Translation pill ──────────────────────────────────────────────────────────

function TranslationPill({ word, langCode }: { word: string; langCode: string | null | undefined }) {
  const { translation, loading } = useTranslation(word, langCode)
  const lang = languageByCode(langCode ?? '')
  const [speaking, setSpeaking] = useState(false)

  if (!langCode || langCode === 'en' || !lang) return null

  const speakNative = () => {
    if (!translation) return
    Speech.stop()
    setSpeaking(true)
    Speech.speak(translation, {
      language: SPEECH_LOCALES[langCode] ?? langCode,
      rate: 0.82,
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    })
  }

  return (
    <View style={styles.translationPill}>
      <Text style={styles.translationFlag}>{lang.flag}</Text>
      {loading
        ? <ActivityIndicator size="small" color={colors.textHint} style={{ marginLeft: 4 }} />
        : <Text style={styles.translationText} numberOfLines={1}>{translation ?? '—'}</Text>
      }
      {translation && (
        <TouchableOpacity onPress={speakNative} style={{ padding: 4 }}>
          <Ionicons
            name={speaking ? 'volume-high' : 'volume-medium-outline'}
            size={15}
            color={speaking ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

// ── Word card — slides in from right on mount ─────────────────────────────────

function WordCard({ word, nativeLang }: { word: PracticeWord; nativeLang: string | null | undefined }) {
  const emoji = WORD_EMOJI[word.text.toLowerCase()]
  const { state, startRecording, stopRecording } = usePronunciation(word.text)

  const isIdle      = state === 'idle'
  const isRecording = state === 'recording'
  const isProcessing = state === 'processing'
  const isCorrect   = state === 'correct'
  const isWrong     = state === 'wrong'

  const slideX = useSharedValue(40)
  const opacity = useSharedValue(0)
  useEffect(() => {
    slideX.value = withSpring(0, { damping: 16, stiffness: 200 })
    opacity.value = withTiming(1, { duration: 200 })
  }, [])
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: slideX.value }],
  }))

  return (
    <Animated.View style={[styles.card, animStyle]}>
      <View style={styles.emojiRow}>
        {emoji
          ? <Text style={styles.emoji}>{emoji}</Text>
          : <View style={styles.patternFallback}>
              <Text style={styles.patternFallbackText}>{word.familyPattern}</Text>
            </View>
        }
      </View>

      <View style={styles.wordRow}>
        <Text style={styles.wordText} adjustsFontSizeToFit numberOfLines={1}>
          <Text style={styles.consonant}>{word.consonant}</Text>
          <Text style={styles.pattern}>{word.pattern}</Text>
        </Text>
        <Text style={styles.phoneme}>{word.phoneme}</Text>
      </View>

      <TranslationPill word={word.text} langCode={nativeLang} />
      <Text style={styles.definition} numberOfLines={2}>{word.definition}</Text>

      <View style={styles.actionsRow}>
        <View style={styles.hearBtn}>
          <AudioButton audioUrl={word.audio_url} fallbackText={word.text} size="sm" accessibilityLabel={`Hear ${word.text}`} />
          <Text style={styles.hearLabel}>hear it</Text>
        </View>
        <Pressable
          onPressIn={isIdle ? startRecording : undefined}
          onPressOut={isRecording ? stopRecording : undefined}
          disabled={isProcessing}
          style={[
            styles.micBtn,
            isRecording  && styles.micBtnRecording,
            isCorrect    && styles.micBtnCorrect,
            isWrong      && styles.micBtnWrong,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isRecording ? 'Release to check' : 'Hold to say the word'}
        >
          {isProcessing
            ? <ActivityIndicator size="small" color={colors.textMuted} />
            : isCorrect  ? <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            : isWrong    ? <Ionicons name="close-circle" size={16} color={colors.accent} />
            : isRecording? <View style={styles.recDot} />
            : <Ionicons name="mic-outline" size={16} color={colors.textMuted} />
          }
          <Text style={[
            styles.micLabel,
            isRecording && { color: colors.error },
            isCorrect   && { color: colors.primary },
            isWrong     && { color: colors.accent },
          ]}>
            {isProcessing ? 'checking…' : isCorrect ? 'great!' : isWrong ? 'try again' : isRecording ? 'release…' : 'say it'}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  )
}

// ── Done card ─────────────────────────────────────────────────────────────────

function DoneCard({ total, onShuffle }: { total: number; onShuffle: () => void }) {
  const scale = useSharedValue(0.85)
  const op    = useSharedValue(0)
  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 140 })
    op.value    = withTiming(1, { duration: 220 })
  }, [])
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ scale: scale.value }] }))

  return (
    <Animated.View style={[styles.doneCard, style]}>
      <Text style={{ fontSize: 52 }}>🎉</Text>
      <Text style={styles.doneTitle}>All {total} done!</Text>
      <Text style={styles.doneSub}>Great session. Keep it up.</Text>
      <TouchableOpacity style={styles.shuffleBtn} onPress={onShuffle}>
        <Ionicons name="shuffle" size={15} color={colors.primary} />
        <Text style={styles.shuffleBtnText}>shuffle again</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  theme: string
  allWords: PracticeWord[]
  nativeLang: string
  userId: string | null
  onBack?: () => void
}

export default function ThemePractice({ theme, allWords, nativeLang, userId, onBack }: Props) {
  const insets = useSafeAreaInsets()

  const [knownIds, setKnownIds] = useState<Set<string>>(
    userId ? new Set(masteryCache.get(userId) ?? []) : new Set()
  )
  const [cardIndex, setCardIndex] = useState(0)
  const lastTheme = useRef('')

  // Load mastery from DB on first mount for this user
  useEffect(() => {
    if (!userId || masteryCache.has(userId)) return
    supabase
      .from('user_progress')
      .select('words_mastered')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (!data) return
        const ids = new Set<string>()
        for (const row of data) {
          for (const id of (row.words_mastered as string[]) ?? []) ids.add(id)
        }
        masteryCache.set(userId, ids)
        setKnownIds(new Set(ids))
      })
  }, [userId])

  // Reset + prefetch when theme changes
  useEffect(() => {
    if (theme === lastTheme.current) return
    lastTheme.current = theme
    const cached = userId ? (masteryCache.get(userId) ?? new Set()) : new Set<string>()
    setKnownIds(new Set(cached))
    setCardIndex(0)
  }, [theme, userId])

  // Prefetch translations when words or lang are ready
  useEffect(() => {
    if (!allWords.length) return
    const themeSet = new Set(WORD_THEMES[theme]?.words ?? [])
    const words = allWords.filter((w) => themeSet.has(w.text.toLowerCase()))
    prefetchTranslations(words.map((w) => w.text), nativeLang)
  }, [theme, nativeLang, allWords.length])

  // Filtered word list for current theme, minus known
  const themeSet = new Set(WORD_THEMES[theme]?.words ?? [])
  const filteredWords = allWords
    .filter((w) => themeSet.has(w.text.toLowerCase()))
    .filter((w) => !knownIds.has(w.id))

  const totalInTheme = allWords.filter((w) => themeSet.has(w.text.toLowerCase())).length
  const currentWord  = filteredWords[cardIndex % Math.max(filteredWords.length, 1)] ?? null
  const isDone       = filteredWords.length === 0 && totalInTheme > 0

  const handleKnow = async () => {
    if (!currentWord) return
    haptics.success()
    soundEngine.play('wordRevealed')

    // Update local state + module cache
    const updatedIds = new Set([...knownIds, currentWord.id])
    setKnownIds(updatedIds)
    if (userId) {
      const cached = masteryCache.get(userId) ?? new Set<string>()
      cached.add(currentWord.id)
      masteryCache.set(userId, cached)
    }

    // Persist to DB — best-effort
    if (userId && currentWord.lessonId) {
      try {
        const { data } = await supabase
          .from('user_progress')
          .select('words_mastered')
          .eq('user_id', userId)
          .eq('lesson_id', currentWord.lessonId)
          .single()
        const existing: string[] = data?.words_mastered ?? []
        if (!existing.includes(currentWord.id)) {
          await supabase.from('user_progress').upsert(
            { user_id: userId, lesson_id: currentWord.lessonId, words_mastered: [...existing, currentWord.id] },
            { onConflict: 'user_id,lesson_id' },
          )
        }
      } catch { /* silent */ }
    }
  }

  const handleReview = () => {
    haptics.tap()
    setCardIndex((i) => i + 1)
  }

  const handleShuffle = () => {
    setKnownIds(new Set())
    setCardIndex(0)
  }

  const themeData = WORD_THEMES[theme]

  return (
    <View style={styles.container}>
      {onBack && (
        <View style={styles.practiceHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Back to groups">
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.practiceHeaderEmoji}>{themeData?.emoji}</Text>
          <Text style={styles.practiceHeaderTitle}>{theme}</Text>
          <Text style={styles.practiceHeaderCount}>
            {filteredWords.length} left
          </Text>
        </View>
      )}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {isDone ? (
          <DoneCard total={totalInTheme} onShuffle={handleShuffle} />
        ) : currentWord ? (
          <WordCard key={currentWord.id} word={currentWord} nativeLang={nativeLang} />
        ) : allWords.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No words yet — complete a lesson first.</Text>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No words match this theme yet.</Text>
          </View>
        )}
      </ScrollView>

      {!isDone && currentWord && (
        <View style={[styles.bottomBtns, { paddingBottom: insets.bottom + 6 }]}>
          <TouchableOpacity style={styles.reviewBtn} onPress={handleReview}>
            <Text style={styles.reviewBtnText}>still learning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.knowBtn} onPress={() => void handleKnow()}>
            <Ionicons name="checkmark" size={15} color="#fff" />
            <Text style={styles.knowBtnText}>got it</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  practiceHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  practiceHeaderEmoji: { fontSize: 18 },
  practiceHeaderTitle: { flex: 1, fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  practiceHeaderCount: { fontSize: fontSize.sm, color: colors.textMuted },

  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.xxl,
    padding: spacing.lg, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  emojiRow: { alignItems: 'center' },
  emoji: { fontSize: 52, lineHeight: 60 },
  patternFallback: {
    width: 60, height: 60, borderRadius: 15,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  patternFallbackText: { fontFamily: 'Georgia', fontSize: 20, color: colors.primary },

  wordRow: { alignItems: 'center', gap: 2 },
  wordText: { fontFamily: 'Georgia', fontSize: 40, lineHeight: 48 },
  consonant: { color: colors.consonant },
  pattern:   { color: colors.pattern },
  phoneme:   { fontSize: fontSize.md, color: colors.textMuted },

  translationPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primaryLight, borderRadius: radius.lg,
    paddingVertical: 6, paddingHorizontal: 12, gap: 6,
  },
  translationFlag: { fontSize: 16 },
  translationText: { fontSize: fontSize.md, color: colors.primaryDeep, fontWeight: '700', flex: 1 },

  definition: { fontSize: fontSize.md, color: colors.text, lineHeight: 20 },

  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 2 },
  hearBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.neutral, borderRadius: radius.md,
    paddingVertical: 9, paddingHorizontal: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  hearLabel: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  micBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.neutral, borderRadius: radius.md,
    paddingVertical: 9, paddingHorizontal: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  micBtnRecording: { borderColor: colors.error,   backgroundColor: '#FFF0EE' },
  micBtnCorrect:   { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  micBtnWrong:     { borderColor: colors.accent,  backgroundColor: colors.accentLight },
  micLabel: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  recDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.error },

  bottomBtns: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md,
    backgroundColor: colors.neutral,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
  },
  reviewBtn: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    paddingVertical: 13, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  reviewBtnText: { fontSize: fontSize.md, color: colors.textMuted, fontWeight: '500' },
  knowBtn: {
    flex: 1, backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 13, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  knowBtnText: { fontSize: fontSize.md, color: '#fff', fontWeight: '700' },

  doneCard: {
    backgroundColor: colors.surface, borderRadius: radius.xxl,
    padding: spacing.xl, alignItems: 'center', gap: spacing.md,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  doneTitle: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, textAlign: 'center' },
  doneSub:   { fontSize: fontSize.md, color: colors.textMuted },
  shuffleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, marginTop: 4,
  },
  shuffleBtnText: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600' },

  empty: { alignItems: 'center', padding: spacing.xl },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center' },
})
