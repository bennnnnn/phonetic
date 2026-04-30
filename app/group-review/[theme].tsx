import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useGroupLesson } from '@/hooks/useGroupLesson'
import WordRow from '@/components/review/WordRow'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { WORD_THEMES, IRREGULAR_VERB_GROUPS, HOMOPHONE_GROUPS } from '@/lib/practiceThemes'
import ErrorState from '@/components/ui/ErrorState'
import type { Word } from '@/lib/types'

export default function GroupReviewScreen() {
  const insets = useSafeAreaInsets()
  const { theme } = useLocalSearchParams<{ theme: string }>()
  const { words, loading, error } = useGroupLesson(theme ?? '')

  const themeData = WORD_THEMES[theme] ?? IRREGULAR_VERB_GROUPS[theme] ?? HOMOPHONE_GROUPS[theme]
  const title = `${themeData?.emoji ?? '🗂'} ${theme}`

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
      </SafeAreaView>
    )
  }

  if (error || !words.length) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ErrorState message={error ?? 'Not found'} />
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
          <Text style={styles.headerTitle}>{title}</Text>
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
        {words.map((word, i) => (
          <WordRow key={word.id} word={word as Word} index={i} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
})
