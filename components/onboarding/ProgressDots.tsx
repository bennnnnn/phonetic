import { View, StyleSheet } from 'react-native'
import { colors, radius } from '@/lib/tokens'

/** `filled` = number of segments filled with primary (1–4). */
export function OnboardingProgressDots({ filled, total = 4 }: { filled: number; total?: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.seg, i < filled ? styles.done : styles.pending]} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
  done: { backgroundColor: colors.primary },
  pending: { backgroundColor: colors.primaryLight },
})
