import { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

/** Convert '#RRGGBB' + hex alpha (0x00-0xFF) to 'rgba(r, g, b, a)'. */
function hexToRgba(hex: string, alphaHex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const a = parseInt(alphaHex, 16) / 255
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`
}

export type ChapterData = {
  id: string; name: string; subtitle: string; wordCount: number
  accentColor: string; completed: number; total: number
  comingSoon: boolean
}

type Props = {
  item: ChapterData
  expanded?: boolean
  onPress?: () => void
}

export default function ChapterHeader({ item, expanded, onPress }: Props) {
  const pct = item.total > 0 ? item.completed / item.total : 0
  const chevronRot = useSharedValue(expanded ? 1 : 0)

  useEffect(() => {
    chevronRot.value = withSpring(expanded ? 1 : 0, { damping: 14, stiffness: 200 })
  }, [expanded])

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRot.value * 180}deg` }],
  }))

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={item.comingSoon || !onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.card, item.comingSoon && styles.cardSoon]}>
        <View style={[styles.icon, { backgroundColor: hexToRgba(item.accentColor, '18') }]}>
          <Text style={styles.iconCount}>{item.wordCount}</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={[styles.name, item.comingSoon && styles.nameMuted]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.meta}>
              {item.comingSoon ? (
                <Text style={styles.soonText}>Soon</Text>
              ) : item.total > 0 ? (
                <Text style={[styles.count, { color: item.accentColor }]}>
                  {item.completed}/{item.total}
                </Text>
              ) : null}
              {!item.comingSoon && (
                <Animated.View style={chevronStyle}>
                  <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
                </Animated.View>
              )}
            </View>
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
          {!item.comingSoon && item.total > 0 && (
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct * 100}%` as `${number}%`, backgroundColor: item.accentColor }]} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    height: 68,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.xs, paddingHorizontal: spacing.md, gap: spacing.sm,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
  },
  cardSoon: { opacity: 0.4 },
  icon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  emoji: { fontSize: 20 },
  iconCount: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },
  body: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  nameMuted: { color: colors.textMuted },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  count: { fontSize: fontSize.sm, fontWeight: '700' },
  subtitle: { fontSize: fontSize.xs, color: colors.textMuted },
  track: { height: 3, borderRadius: 1.5, backgroundColor: colors.neutral, marginTop: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 1.5 },
  soonText: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '500' },
})
