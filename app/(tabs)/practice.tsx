import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, Pressable, ScrollView,
  StyleSheet, ActivityIndicator, Alert, useWindowDimensions,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay,
} from 'react-native-reanimated'
import * as Speech from 'expo-speech'
import { usePracticeWords, type PracticeWord } from '@/hooks/usePracticeWords'
import { prefetchTranslations } from '@/hooks/useTranslation'
import { useProfile } from '@/hooks/useProfile'
import { useTranslation } from '@/hooks/useTranslation'
import { usePronunciation } from '@/hooks/usePronunciation'
import { LANGUAGES, languageByCode } from '@/lib/languages'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import AudioButton from '@/components/lesson/AudioButton'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

// ─── Data ─────────────────────────────────────────────────────────────────────

const SPEECH_LOCALES: Record<string, string> = {
  es: 'es-ES', fr: 'fr-FR', ar: 'ar-SA', am: 'am-ET',
  pt: 'pt-BR', zh: 'zh-CN', hi: 'hi-IN', tr: 'tr-TR',
  ko: 'ko-KR', ja: 'ja-JP', de: 'de-DE', it: 'it-IT',
  ru: 'ru-RU', id: 'id-ID', sw: 'sw-KE', so: 'so-SO',
}

const WORD_THEMES: Record<string, { words: string[]; emoji: string; desc: string }> = {
  'Travel':   { emoji: '✈️', desc: 'train · boat · trip', words: ['train','trip','flight','boat','ship','float','track','plain','skate','brake'] },
  'Food':     { emoji: '🍕', desc: 'cake · snack · chip', words: ['cake','bake','plate','snack','chip','dip','sip','grain','flake'] },
  'Nature':   { emoji: '🌿', desc: 'rain · snow · grow',  words: ['lake','snow','rain','grow','glow','flow','blow','snake','crow','strain','plain'] },
  'Feelings': { emoji: '💫', desc: 'bright · right · might', words: ['delight','fright','pain','might','bright','right','sight'] },
  'Actions':  { emoji: '⚡', desc: 'shake · skip · flip', words: ['shake','skip','flip','grip','slip','crack','spell','make','take','wake','show','know','attack'] },
  'Home':     { emoji: '🏠', desc: 'bell · well · coat',  words: ['bell','well','shell','bank','rack','coat','cell','blank','stack'] },
  'People':   { emoji: '👥', desc: 'mate · frank · rank', words: ['mate','frank','knight','rank','thank'] },
}

const WORD_EMOJI: Record<string, string> = {
  bake:'🎂', cake:'🍰', lake:'🏞️', snake:'🐍', rake:'🌾', make:'🔨',
  take:'✋', wake:'⏰', shake:'🤝', flake:'❄️', brake:'🚗', fake:'🎭',
  gate:'🚪', late:'⏱️', mate:'🤝', plate:'🍽️', skate:'⛸️', state:'🏛️',
  light:'💡', night:'🌙', right:'✅', sight:'👁️', fight:'🥊', might:'💪',
  bright:'☀️', flight:'✈️', knight:'♟️', fright:'😱', delight:'😊',
  back:'⬅️', black:'⬛', crack:'💥', hack:'💻', pack:'📦', rack:'🏋️',
  sack:'👜', stack:'📚', track:'🛤️', snack:'🍎', attack:'⚔️', knack:'🎯',
  bell:'🔔', cell:'📱', sell:'💰', tell:'💬', well:'💧', yell:'📣',
  spell:'✨', shell:'🐚', smell:'👃', dwell:'🏡', swell:'🌊', fell:'🍂',
  bank:'🏦', rank:'🏆', tank:'🛢️', blank:'📄', crank:'🔧', drank:'🥤',
  plank:'🪵', prank:'🃏', thank:'🙏', frank:'😐',
  dip:'🤿', sip:'☕', chip:'🍟', flip:'🔄', grip:'🤜',
  ship:'🚢', skip:'⏭️', slip:'🍌', trip:'✈️',
  blow:'💨', crow:'🐦', flow:'🌊', glow:'✨', grow:'🌱', know:'🧠',
  show:'🎬', slow:'🐢', snow:'❄️',
  rain:'🌧️', train:'🚂', drain:'🚿', gain:'📈', grain:'🌾',
  pain:'😣', plain:'🏔️', stain:'💧', strain:'😤',
  boat:'⛵', coat:'🧥', float:'🏊', goat:'🐐', throat:'😮',
}

// Palette for theme selection cards
const PALETTE = [
  { bg: '#FF9500', shadow: '#B86D00' },
  { bg: '#5856D6', shadow: '#332F9F' },
  { bg: '#34C759', shadow: '#1E8034' },
  { bg: '#FF3B30', shadow: '#B82820' },
  { bg: '#007AFF', shadow: '#0050B3' },
  { bg: '#AF52DE', shadow: '#7B2FAF' },
  { bg: '#FF6B35', shadow: '#B84510' },
  { bg: '#32ADE6', shadow: '#1B79B8' },
]

// ─── Language picker ──────────────────────────────────────────────────────────

function LanguageButton({ nativeLang, onPress }: { nativeLang: string; onPress: () => void }) {
  const lang = languageByCode(nativeLang)
  return (
    <TouchableOpacity style={styles.langBtn} onPress={onPress} accessibilityLabel="Change native language">
      <Text style={styles.langFlag}>{lang?.flag ?? '🌐'}</Text>
      <Text style={styles.langLabel} numberOfLines={1}>{lang?.label ?? 'Language'}</Text>
      <Ionicons name="chevron-down" size={12} color={colors.textMuted} />
    </TouchableOpacity>
  )
}

// ─── Theme selection screen ───────────────────────────────────────────────────

function ThemeCard({
  name, meta, wordCount, index, onPress, cardWidth,
}: {
  name: string; meta: { emoji: string; desc: string }; wordCount: number
  index: number; onPress: () => void; cardWidth: number
}) {
  const pressed = useSharedValue(0)
  const entryOpacity = useSharedValue(0)
  const entryY = useSharedValue(24)
  const palette = PALETTE[index % PALETTE.length]

  useEffect(() => {
    const delay = index * 50
    entryOpacity.value = withDelay(delay, withTiming(1, { duration: 260 }))
    entryY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 180 }))
  }, [])

  const entryStyle = useAnimatedStyle(() => ({
    opacity: entryOpacity.value,
    transform: [{ translateY: entryY.value }],
  }))
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(pressed.value * 4, { damping: 12, stiffness: 400 }) }],
  }))

  return (
    <Animated.View style={[{ width: cardWidth, marginBottom: 4 }, entryStyle]}>
      <Pressable
        onPressIn={() => { pressed.value = 1 }}
        onPressOut={() => { pressed.value = 0 }}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Practice ${name} words`}
      >
        <View style={[styles.themeCardShadow, { backgroundColor: palette.shadow }]} />
        <Animated.View style={[styles.themeCard, { backgroundColor: palette.bg }, pressStyle]}>
          <Text style={styles.themeEmoji}>{meta.emoji}</Text>
          <Text style={styles.themeName}>{name}</Text>
          <Text style={styles.themeDesc} numberOfLines={1}>{meta.desc}</Text>
          <Text style={styles.themeCount}>{wordCount} words</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

function SelectionScreen({
  allWords, nativeLang, onSelectTheme, onChangeLang,
}: {
  allWords: PracticeWord[]
  nativeLang: string
  onSelectTheme: (theme: string) => void
  onChangeLang: () => void
}) {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const cardGap = 10
  const cardWidth = (width - spacing.lg * 2 - cardGap) / 2

  const wordSet = useMemo(() => new Set(allWords.map((w) => w.text.toLowerCase())), [allWords])

  const activeThemes = useMemo(() =>
    Object.entries(WORD_THEMES).filter(([, t]) => t.words.some((w) => wordSet.has(w))),
  [wordSet])

  const countForTheme = (themeWords: string[]) =>
    themeWords.filter((w) => wordSet.has(w)).length

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Practice</Text>
        <LanguageButton nativeLang={nativeLang} onPress={onChangeLang} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl + insets.bottom, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.selectHeading}>What do you want to practice?</Text>

        {/* Theme grid */}
        <View style={[styles.grid, { gap: cardGap }]}>
          {activeThemes.map(([name, meta], i) => (
            <ThemeCard
              key={name}
              name={name}
              meta={meta}
              wordCount={countForTheme(meta.words)}
              index={i}
              onPress={() => onSelectTheme(name)}
              cardWidth={cardWidth}
            />
          ))}
        </View>

        {/* All words — full width card */}
        <TouchableOpacity style={styles.allWordsCard} onPress={() => onSelectTheme('all')}>
          <View style={styles.allWordsCardShadow} />
          <View style={styles.allWordsCardBody}>
            <Text style={styles.allWordsEmoji}>📚</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.allWordsTitle}>All words</Text>
              <Text style={styles.allWordsSub}>{allWords.length} words across all topics</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Translation pill ─────────────────────────────────────────────────────────

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

// ─── Practice word card ───────────────────────────────────────────────────────

function WordCard({ word, nativeLang }: { word: PracticeWord; nativeLang: string | null | undefined }) {
  const emoji = WORD_EMOJI[word.text.toLowerCase()]
  const { state, startRecording, stopRecording } = usePronunciation(word.text)

  const isIdle       = state === 'idle'
  const isRecording  = state === 'recording'
  const isProcessing = state === 'processing'
  const isCorrect    = state === 'correct'
  const isWrong      = state === 'wrong'

  // Slide-in when mounted (new word)
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
          style={({ pressed }) => [
            styles.micBtn,
            isRecording  && styles.micBtnRecording,
            isCorrect    && styles.micBtnCorrect,
            isWrong      && styles.micBtnWrong,
            pressed && isIdle && { opacity: 0.7 },
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

function DoneCard({ total, onShuffle }: { total: number; onShuffle: () => void }) {
  return (
    <View style={styles.doneCard}>
      <Text style={{ fontSize: 52 }}>🎉</Text>
      <Text style={styles.doneTitle}>All {total} done!</Text>
      <Text style={styles.doneSub}>Great session. Keep it up.</Text>
      <TouchableOpacity style={styles.shuffleBtn} onPress={onShuffle}>
        <Ionicons name="shuffle" size={15} color={colors.primary} />
        <Text style={styles.shuffleBtnText}>shuffle again</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PracticeScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuthStore()
  const { allWords, loading, error, refetch } = usePracticeWords()
  const { profile, refetch: refetchProfile } = useProfile()
  const nativeLang = profile?.native_language ?? 'es'

  const [mode, setMode] = useState<'select' | 'cards'>('select')
  const [selectedTheme, setSelectedTheme] = useState<string>('all')
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set())
  const [cardIndex, setCardIndex] = useState(0)

  // Persisted mastery — loaded from DB once; never cleared by UI (only by shuffle)
  const persistedRef = useRef<Set<string>>(new Set())

  useFocusEffect(useCallback(() => {
    void refetchProfile()
  }, [refetchProfile]))

  // On mount: load all previously mastered word IDs from every lesson's progress row
  useEffect(() => {
    if (!user) return
    supabase
      .from('user_progress')
      .select('words_mastered')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data) return
        const ids = new Set<string>()
        for (const row of data) {
          for (const id of (row.words_mastered as string[]) ?? []) ids.add(id)
        }
        persistedRef.current = ids
        setKnownIds(new Set(ids))
      })
  }, [user?.id])

  // When a theme is selected, restore persisted mastery and pre-fetch translations
  const handleSelectTheme = (theme: string) => {
    const themeWordSet = theme === 'all'
      ? null
      : new Set(WORD_THEMES[theme]?.words ?? [])
    const wordsForTheme = themeWordSet
      ? allWords.filter((w) => themeWordSet.has(w.text.toLowerCase()))
      : allWords
    prefetchTranslations(wordsForTheme.map((w) => w.text), nativeLang)

    setSelectedTheme(theme)
    setKnownIds(new Set(persistedRef.current))
    setCardIndex(0)
    setMode('cards')
  }

  const handleBack = () => {
    setMode('select')
    setKnownIds(new Set(persistedRef.current))
    setCardIndex(0)
  }

  const saveNativeLanguage = async (code: string) => {
    if (!user) return
    await supabase.from('user_profiles').update({ native_language: code }).eq('id', user.id)
    await refetchProfile()
  }

  const openLangPicker = () => {
    const buttons = LANGUAGES.map((l) => ({
      text: `${l.flag}  ${l.label}`,
      onPress: () => void saveNativeLanguage(l.code),
    }))
    Alert.alert('Native language', 'Used for translations and pronunciation', [
      { text: 'Cancel', style: 'cancel' },
      ...buttons,
    ])
  }

  // ── Selection screen ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Practice</Text>
          <LanguageButton nativeLang={nativeLang} onPress={openLangPicker} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (mode === 'select') {
    return (
      <SelectionScreen
        allWords={allWords}
        nativeLang={nativeLang}
        onSelectTheme={handleSelectTheme}
        onChangeLang={openLangPicker}
      />
    )
  }

  // ── Cards screen ───────────────────────────────────────────────────────────

  const filteredWords = (() => {
    let base = allWords
    if (selectedTheme !== 'all') {
      const set = new Set(WORD_THEMES[selectedTheme]?.words ?? [])
      base = allWords.filter((w) => set.has(w.text.toLowerCase()))
    }
    return base.filter((w) => !knownIds.has(w.id))
  })()

  const currentWord = filteredWords[cardIndex % Math.max(filteredWords.length, 1)] ?? null
  const isDone = filteredWords.length === 0 && allWords.length > 0
  const totalForDone = selectedTheme === 'all'
    ? allWords.length
    : allWords.filter((w) => (WORD_THEMES[selectedTheme]?.words ?? []).includes(w.text.toLowerCase())).length

  const handleKnow = async () => {
    if (!currentWord) return
    haptics.success()
    soundEngine.play('wordRevealed')
    persistedRef.current.add(currentWord.id)
    setKnownIds((prev) => new Set([...prev, currentWord.id]))

    // Persist mastered word to user_progress — best-effort, silent on failure
    if (user && currentWord.lessonId) {
      try {
        const { data: existing } = await supabase
          .from('user_progress')
          .select('words_mastered')
          .eq('user_id', user.id)
          .eq('lesson_id', currentWord.lessonId)
          .single()

        const alreadyMastered: string[] = existing?.words_mastered ?? []
        if (!alreadyMastered.includes(currentWord.id)) {
          await supabase.from('user_progress').upsert(
            {
              user_id: user.id,
              lesson_id: currentWord.lessonId,
              words_mastered: [...alreadyMastered, currentWord.id],
            },
            { onConflict: 'user_id,lesson_id' },
          )
        }
      } catch {
        // practice persistence is best-effort
      }
    }
  }

  const handleReview = () => {
    if (!currentWord) return
    haptics.tap()
    setCardIndex((i) => i + 1)
  }

  const handleShuffle = () => {
    // Shuffle re-shows everything including previously mastered (re-practice session)
    setKnownIds(new Set())
    setCardIndex(0)
    void refetch()
  }

  const themeLabel = selectedTheme === 'all' ? 'All words' : selectedTheme

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} accessibilityLabel="Back to topics">
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{themeLabel}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <LanguageButton nativeLang={nativeLang} onPress={openLangPicker} />
          <Text style={styles.subtitle}>{isDone ? 'done' : `${filteredWords.length}`}</Text>
        </View>
      </View>

      {/* Card area */}
      <View style={styles.cardArea}>
        <ScrollView
          contentContainerStyle={styles.cardScroll}
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={{ alignItems: 'center', gap: spacing.md }}>
              <Text style={{ color: colors.error, fontSize: fontSize.md }}>{error}</Text>
              <TouchableOpacity onPress={() => void refetch()} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>retry</Text>
              </TouchableOpacity>
            </View>
          ) : isDone ? (
            <DoneCard total={totalForDone} onShuffle={handleShuffle} />
          ) : currentWord ? (
            <WordCard key={currentWord.id} word={currentWord} nativeLang={nativeLang} />
          ) : null}
        </ScrollView>
      </View>

      {/* Bottom buttons */}
      {!error && !isDone && currentWord && (
        <View style={[styles.bottomBtns, { paddingBottom: insets.bottom + 6 }]}>
          <TouchableOpacity style={styles.reviewBtn} onPress={handleReview}>
            <Text style={styles.reviewBtnText}>still learning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.knowBtn} onPress={handleKnow}>
            <Ionicons name="checkmark" size={15} color="#fff" />
            <Text style={styles.knowBtnText}>got it</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral },

  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  title: { fontSize: fontSize.xl, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted },
  backBtn: { marginRight: 6, padding: 2 },

  // Language button
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.neutral, borderRadius: radius.full,
    paddingVertical: 4, paddingHorizontal: 10,
    borderWidth: 1, borderColor: colors.border,
    maxWidth: 120,
  },
  langFlag: { fontSize: 14 },
  langLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', flexShrink: 1 },

  // Selection screen
  selectHeading: {
    fontSize: fontSize.xl, fontWeight: '700', color: colors.text,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },

  // Theme card
  themeCardShadow: {
    position: 'absolute', top: 5, left: 0, right: 0, bottom: -5,
    borderRadius: radius.xl,
  },
  themeCard: {
    borderRadius: radius.xl, padding: spacing.md, minHeight: 130,
    justifyContent: 'space-between',
  },
  themeEmoji: { fontSize: 32, lineHeight: 38 },
  themeName: { fontSize: fontSize.lg, fontWeight: '700', color: '#fff', marginTop: 4 },
  themeDesc: { fontSize: 10, color: 'rgba(255,255,255,0.75)' },
  themeCount: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '500', marginTop: 4 },

  // All words card
  allWordsCard: { marginBottom: 4 },
  allWordsCardShadow: {
    position: 'absolute', top: 5, left: 0, right: 0, bottom: -5,
    borderRadius: radius.xl, backgroundColor: colors.primaryDark,
  },
  allWordsCardBody: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  allWordsEmoji: { fontSize: 32 },
  allWordsTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#fff' },
  allWordsSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  // Card area
  cardArea: { flex: 1 },
  cardScroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },

  // Word card
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
  pattern: { color: colors.pattern },
  phoneme: { fontSize: fontSize.md, color: colors.textMuted },

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
  micBtnRecording: { borderColor: colors.error, backgroundColor: '#FFF0EE' },
  micBtnCorrect:   { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  micBtnWrong:     { borderColor: colors.accent, backgroundColor: colors.accentLight },
  micLabel: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  recDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.error },

  retryBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
  },
  retryBtnText: { color: '#fff', fontWeight: '600' },

  bottomBtns: {
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
  doneSub: { fontSize: fontSize.md, color: colors.textMuted },
  shuffleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, marginTop: 4,
  },
  shuffleBtnText: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600' },
})
