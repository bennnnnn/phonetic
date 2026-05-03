/**
 * Onboarding step 2/4 — native language picker.
 * Same language list as profile settings, with live search.
 */
import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming,
} from 'react-native-reanimated'
import { LANGUAGES, type Language } from '@/data/languages'
import { useSettingsStore } from '@/store/settingsStore'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

// ─── Progress bar (identical pattern to other onboarding screens) ────────────

function ProgressBar() {
  const w = useSharedValue(0)
  useEffect(() => { w.value = withTiming(2 / 4, { duration: 450 }) }, [])
  const fill = useAnimatedStyle(() => ({ flex: w.value }))
  const gap  = useAnimatedStyle(() => ({ flex: Math.max(1 - w.value, 0) }))
  return (
    <View style={pb.track}>
      <Animated.View style={[pb.fill, fill]} />
      <Animated.View style={[pb.gap,  gap ]} />
    </View>
  )
}
const pb = StyleSheet.create({
  track: { flex: 1, height: 8, borderRadius: 999, backgroundColor: colors.primaryLight, flexDirection: 'row', overflow: 'hidden' },
  fill:  { backgroundColor: colors.primary },
  gap:   { backgroundColor: 'transparent' },
})

// ─── Language row ─────────────────────────────────────────────────────────────

const LangRow = ({ item, selected, onPress }: { item: Language; selected: boolean; onPress: () => void }) => {
  const bg = useSharedValue(selected ? 1 : 0)

  useEffect(() => {
    bg.value = withTiming(selected ? 1 : 0, { duration: 160 })
  }, [selected])

  const rowStyle = useAnimatedStyle(() => ({
    backgroundColor: bg.value === 1 ? colors.primaryLight : colors.surface,
    borderColor:     bg.value === 1 ? colors.primary      : colors.border,
  }))

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[row.card, rowStyle]}>
        <Text style={row.flag}>{item.flag}</Text>
        <Text style={[row.label, selected && row.labelSelected]}>{item.label}</Text>
        {selected && (
          <View style={row.check}>
            <Text style={row.checkMark}>✓</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  )
}

const row = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: spacing.md,
    borderRadius: radius.md, borderWidth: 1.5,
    marginBottom: spacing.sm, gap: spacing.md,
  },
  flag:          { fontSize: 26, width: 34 },
  label:         { flex: 1, fontSize: fontSize.lg, color: colors.text, fontWeight: '500' },
  labelSelected: { color: colors.primaryDark, fontWeight: '700' },
  check: {
    width: 26, height: 26, borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
})

// ─── Continue button ──────────────────────────────────────────────────────────

function ContinueBtn({ enabled, onPress }: { enabled: boolean; onPress: () => void }) {
  const op    = useSharedValue(enabled ? 1 : 0.4)
  const scale = useSharedValue(1)
  useEffect(() => {
    op.value = withTiming(enabled ? 1 : 0.4, { duration: 200 })
    if (enabled) {
      scale.value = withSpring(1.03, { damping: 10, stiffness: 300 })
      setTimeout(() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }) }, 130)
    }
  }, [enabled])
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ scale: scale.value }] }))
  return (
    <Animated.View style={style}>
      <TouchableOpacity
        style={[btn.base, enabled ? btn.active : btn.inactive]}
        onPress={onPress}
        disabled={!enabled}
        activeOpacity={0.85}
      >
        <Text style={btn.label}>CONTINUE</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
const btn = StyleSheet.create({
  base:   { borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  active: { backgroundColor: colors.primary },
  inactive:{ backgroundColor: colors.border },
  label:  { color: '#fff', fontSize: fontSize.lg, fontWeight: '700', letterSpacing: 0.6 },
})

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingLanguage() {
  const insets = useSafeAreaInsets()
  const setNativeLanguage = useSettingsStore((s) => s.setNativeLanguage)

  const [query,    setQuery]    = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return LANGUAGES
    return LANGUAGES.filter((l) => l.label.toLowerCase().includes(q))
  }, [query])

  const handleSelect = useCallback((code: string) => {
    setSelected((prev) => (prev === code ? null : code))
  }, [])

  function handleContinue() {
    if (selected) setNativeLanguage(selected)
    router.push('/(auth)/onboarding/accent')
  }

  const renderItem = useCallback(({ item }: { item: Language }) => (
    <LangRow
      item={item}
      selected={selected === item.code}
      onPress={() => handleSelect(item.code)}
    />
  ), [selected, handleSelect])

  const keyExtractor = useCallback((item: Language) => item.code, [])

  return (
    <View style={[sc.root, { paddingTop: insets.top + spacing.sm }]}>
      {/* ── Top bar ───────────────────────────────────── */}
      <View style={sc.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={sc.backBtn} hitSlop={12}>
          <Text style={sc.backChevron}>‹</Text>
        </TouchableOpacity>
        <ProgressBar />
        <View style={sc.backPlaceholder} />
      </View>

      {/* ── Header ────────────────────────────────────── */}
      <View style={sc.header}>
        <Text style={sc.question}>What's your native language?</Text>
      </View>

      {/* ── Search ────────────────────────────────────── */}
      <View style={sc.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textHint} style={sc.searchIcon} />
        <TextInput
          style={sc.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search languages…"
          placeholderTextColor={colors.textHint}
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {/* ── Language list ──────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={sc.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <Text style={sc.empty}>No languages found for "{query}"</Text>
        }
      />

      {/* ── Footer ────────────────────────────────────── */}
      <View style={[sc.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <ContinueBtn enabled={!!selected} onPress={handleContinue} />
      </View>
    </View>
  )
}

const sc = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn:         { padding: 4 },
  backChevron:     { fontSize: 28, color: colors.textMuted, lineHeight: 32 },
  backPlaceholder: { width: 32 },

  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  question: {
    fontSize: 26, fontWeight: '700', color: colors.text,
    lineHeight: 34, textAlign: 'center',
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: colors.neutral, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    gap: spacing.sm,
  },
  searchIcon:  { marginRight: 2 },
  searchInput: {
    flex: 1, fontSize: fontSize.md, color: colors.text,
    padding: 0,
  },

  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },

  empty: {
    textAlign: 'center', color: colors.textHint,
    fontSize: fontSize.md, marginTop: spacing.xl,
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.neutral,
    backgroundColor: colors.surface,
  },
})
