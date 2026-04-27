import { useState, useEffect } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withDelay, withSpring, withTiming, withSequence,
} from 'react-native-reanimated'
import { useAuthStore } from '@/store/authStore'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useLeagueTier } from '@/hooks/useLeagueTier'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import type { LeagueMember } from '@/lib/types'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'

const TIER_COLORS: Record<string, string> = {
  Teal: '#1D9E75',
  Gold: '#EF9F27',
  Diamond: '#5B8FE0',
  Master: '#9B59B6',
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

// Counts from 0 → value over 700ms
function CountUp({ value, style }: { value: number; style?: object }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    setShown(0)
    const STEPS = 24
    const DURATION = 700
    let step = 0
    const iv = setInterval(() => {
      step++
      setShown(Math.round((value / STEPS) * Math.min(step, STEPS)))
      if (step >= STEPS) clearInterval(iv)
    }, DURATION / STEPS)
    return () => clearInterval(iv)
  }, [value])
  return <Text style={style}>{shown} XP</Text>
}

// ── Podium block — rises from below ──────────────────────────────────────────

function PodiumBlock({
  member, rank, isUser, delayMs,
}: {
  member: LeagueMember; rank: 1 | 2 | 3; isUser: boolean; delayMs: number
}) {
  const HEIGHTS: Record<number, number> = { 1: 72, 2: 56, 3: 44 }
  const WIDTHS:  Record<number, number> = { 1: 72, 2: 60, 3: 60 }
  const BLOCK_COLORS: Record<number, string> = { 1: '#1D9E75', 2: '#5DCAA5', 3: '#9FE1CB' }

  const colY  = useSharedValue(HEIGHTS[rank] + 40)
  const colOp = useSharedValue(0)
  const crownScale = useSharedValue(0)

  useEffect(() => {
    colY.value  = withDelay(delayMs, withSpring(0, { damping: 14, stiffness: 110 }))
    colOp.value = withDelay(delayMs, withTiming(1, { duration: 280 }))
    if (rank === 1) {
      // crown pops in after the block settles
      crownScale.value = withDelay(
        delayMs + 380,
        withSequence(
          withSpring(1.5, { damping: 5, stiffness: 220 }),
          withSpring(1,   { damping: 10, stiffness: 180 }),
        ),
      )
    }
  }, [])

  const colStyle   = useAnimatedStyle(() => ({ opacity: colOp.value, transform: [{ translateY: colY.value }] }))
  const crownStyle = useAnimatedStyle(() => ({ transform: [{ scale: crownScale.value }] }))

  return (
    <Animated.View style={[styles.podiumCol, colStyle]}>
      {rank === 1 && <Animated.Text style={[styles.crown, crownStyle]}>👑</Animated.Text>}
      <View style={[styles.avatarCircle, { borderColor: BLOCK_COLORS[rank] }]}>
        <Text style={styles.avatarCircleText}>{getInitials(member.display_name)}</Text>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>
        {member.display_name.slice(0, 10)}
      </Text>
      <CountUp value={member.weekly_xp} style={styles.podiumXP} />
      <View style={[styles.podiumBlock, {
        height: HEIGHTS[rank], width: WIDTHS[rank], backgroundColor: BLOCK_COLORS[rank],
      }]}>
        <Text style={styles.podiumRank}>{rank}</Text>
      </View>
    </Animated.View>
  )
}

// ── Member row — slides from right ───────────────────────────────────────────

function MemberRow({
  member, isUser, index,
}: {
  member: LeagueMember; isUser: boolean; index: number
}) {
  const tx  = useSharedValue(44)
  const op  = useSharedValue(0)

  useEffect(() => {
    const delay = Math.min(index * 42, 400)
    tx.value = withDelay(delay, withSpring(0, { damping: 16, stiffness: 150 }))
    op.value = withDelay(delay, withTiming(1, { duration: 220 }))
  }, [])

  const rowStyle = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateX: tx.value }],
  }))

  return (
    <>
      {isUser && <View style={styles.divider} />}
      <Animated.View style={rowStyle}>
        <View style={[styles.memberRow, isUser && styles.memberRowUser]}>
          <Text style={styles.rankNum}>#{member.rank || '–'}</Text>
          <View style={[styles.memberAvatar, isUser && styles.memberAvatarUser]}>
            <Text style={[styles.memberAvatarText, isUser && styles.memberAvatarTextUser]}>
              {getInitials(member.display_name)}
            </Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{member.display_name}{isUser && ' (you)'}</Text>
            <Text style={styles.memberStreak}>🔥 {member.streak_days}d streak</Text>
          </View>
          <View style={styles.memberRight}>
            <CountUp value={member.weekly_xp} style={styles.memberXP} />
            {member.movement !== 0 && (
              <View style={[styles.movementBadge, member.movement > 0 ? styles.movementUp : styles.movementDown]}>
                <Text style={[styles.movementText, member.movement > 0 ? styles.movementTextUp : styles.movementTextDown]}>
                  {member.movement > 0 ? '+' : ''}{member.movement}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
      {isUser && <View style={styles.divider} />}
    </>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function LeaguesScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuthStore()
  const { members, loading } = useLeaderboard()
  const { tierName, daysUntilReset } = useLeagueTier()
  const [activeTab, setActiveTab] = useState<'week' | 'alltime' | 'friends'>('week')

  const top3 = members.slice(0, 3)
  const rest  = members.slice(3)
  const podiumOrder = top3.length >= 3
    ? ([top3[1], top3[0], top3[2]] as [LeagueMember, LeagueMember, LeagueMember])
    : null

  const nextTier = tierName === 'Teal' ? 'Gold' : tierName === 'Gold' ? 'Diamond' : 'Master'

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Leaderboard</Text>
          {tierName && (
            <View style={styles.tierBadge}>
              <View style={[styles.tierDot, { backgroundColor: TIER_COLORS[tierName] ?? colors.primary }]} />
              <Text style={styles.tierText}>{tierName} League</Text>
            </View>
          )}
        </View>

        <View style={styles.tabToggle}>
          {(['week', 'alltime', 'friends'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'week' ? 'this week' : tab === 'alltime' ? 'all time' : 'friends'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.resetText}>
          resets in {daysUntilReset} days · top 3 promote to {nextTier} League
        </Text>
      </View>

      {loading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width="100%" height={64} borderRadius={12} style={{ marginBottom: 8 }} />
          ))}
        </View>
      ) : members.length === 0 ? (
        <EmptyState message="No league yet" subtitle="Complete your first lesson to join a league!" />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: spacing.lg + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Podium — 2nd | 1st | 3rd */}
          {podiumOrder && (
            <View style={styles.podium}>
              <PodiumBlock member={podiumOrder[0]} rank={2} isUser={podiumOrder[0].user_id === user?.id} delayMs={80} />
              <PodiumBlock member={podiumOrder[1]} rank={1} isUser={podiumOrder[1].user_id === user?.id} delayMs={0} />
              <PodiumBlock member={podiumOrder[2]} rank={3} isUser={podiumOrder[2].user_id === user?.id} delayMs={160} />
            </View>
          )}

          {/* Remaining rows */}
          <View style={styles.list}>
            {rest.map((m, i) => (
              <MemberRow key={m.id} member={{ ...m, rank: i + 4 }} isUser={m.user_id === user?.id} index={i} />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral },

  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '500', color: colors.text },

  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
  },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierText: { fontSize: fontSize.sm, color: colors.primaryDeep, fontWeight: '600' },

  tabToggle: {
    flexDirection: 'row',
    backgroundColor: colors.neutral,
    borderRadius: radius.md,
    padding: 3,
  },
  tabItem: { flex: 1, paddingVertical: spacing.xs, alignItems: 'center', borderRadius: radius.sm },
  tabItemActive: { backgroundColor: colors.surface },
  tabText: { fontSize: fontSize.sm, color: colors.textMuted },
  tabTextActive: { color: colors.text, fontWeight: '600' },

  resetText: { fontSize: 11, color: colors.textMuted },
  skeletonContainer: { padding: spacing.lg },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.xxl },

  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  podiumCol: { alignItems: 'center', gap: spacing.xs },
  crown: { fontSize: 20 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  avatarCircleText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primary },
  podiumName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, maxWidth: 72 },
  podiumXP: { fontSize: fontSize.xs, color: colors.textMuted },
  podiumBlock: {
    borderTopLeftRadius: 4, borderTopRightRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  podiumRank: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },

  list: { backgroundColor: colors.surface, marginTop: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },
  memberRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  memberRowUser: {
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 1.5, borderRightWidth: 1.5,
    borderColor: colors.primary,
  },
  rankNum: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '700', width: 28 },
  memberAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.neutral,
    alignItems: 'center', justifyContent: 'center',
  },
  memberAvatarUser: { backgroundColor: colors.primary },
  memberAvatarText: { fontSize: fontSize.md, fontWeight: '700', color: colors.textMuted },
  memberAvatarTextUser: { color: '#fff' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  memberStreak: { fontSize: fontSize.xs, color: colors.textMuted },
  memberRight: { alignItems: 'flex-end', gap: 4 },
  memberXP: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  movementBadge: { borderRadius: radius.full, paddingVertical: 2, paddingHorizontal: 6 },
  movementUp: { backgroundColor: colors.primaryLight },
  movementDown: { backgroundColor: colors.errorLight },
  movementText: { fontSize: fontSize.xs, fontWeight: '700' },
  movementTextUp: { color: colors.primary },
  movementTextDown: { color: colors.error },
})
