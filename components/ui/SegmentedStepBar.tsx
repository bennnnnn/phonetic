import { View, StyleSheet } from 'react-native'
import { colors, radius } from '@/lib/tokens'

type Step = 1 | 2 | 3 | 4

export default function SegmentedStepBar({ current }: { current: Step }) {
  return (
    <View style={styles.row}>
      {([1, 2, 3, 4] as const).map((s) => (
        <View
          key={s}
          style={[styles.segment, s <= current ? styles.segmentActive : styles.segmentInactive]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, alignSelf: 'stretch', maxWidth: 200 },
  segment: { flex: 1, height: 4, borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.primary },
  segmentInactive: { backgroundColor: colors.border },
})
