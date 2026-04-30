import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

type Props = {
  score: number
  total: number
  onFinish: () => void
  /** Override label, e.g. "finish lesson →" or "finish →" */
  buttonLabel?: string
}

export default function QuizDoneCard({ score, total, onFinish, buttonLabel = 'finish →' }: Props) {
  const donePct = Math.round((score / total) * 100)

  return (
    <View style={styles.card}>
      <Text style={styles.score}>{donePct}%</Text>
      <Text style={styles.detail}>{score}/{total} correct</Text>
      <Text style={styles.message}>
        {score === total
          ? 'Perfect! You nailed it.'
          : score >= total * 0.7
            ? 'Great work! Almost perfect.'
            : "Keep practicing! You'll get it."}
      </Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={onFinish}
        accessibilityRole="button"
        accessibilityLabel="Finish quiz"
      >
        <Text style={styles.btnText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.xxl,
    padding: spacing.xl, alignItems: 'center', justifyContent: 'center',
    gap: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  score:   { fontSize: 72, fontWeight: '800', color: colors.primary },
  detail:  { fontSize: fontSize.lg, color: colors.textMuted },
  message: { fontSize: fontSize.lg, color: colors.text, fontWeight: '600', textAlign: 'center' },
  btn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
    alignItems: 'center', width: '100%',
  },
  btnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },
})
