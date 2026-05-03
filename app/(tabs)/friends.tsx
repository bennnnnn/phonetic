import { useCallback, memo } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Share, Platform,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '@/hooks/useProfile'
import { useFriends, type Friend } from '@/hooks/useFriends'
import { useReferralCode } from '@/hooks/useReferralCode'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

function xpDiff(friendXp: number, myXp: number): string {
  const diff = friendXp - myXp
  if (diff === 0) return 'Same XP as you'
  if (diff > 0)   return `${diff} XP ahead of you`
  return `${Math.abs(diff)} XP behind you`
}

// ── Friend card ───────────────────────────────────────────────────────────────

const FriendCard = memo(function FriendCard({
  friend, myXp,
}: {
  friend: Friend; myXp: number
}) {
  const diff    = friend.total_xp - myXp
  const diffStr = xpDiff(friend.total_xp, myXp)
  const diffPositive = diff >= 0

  return (
    <View style={styles.friendCard}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>{initials(friend.display_name)}</Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName} numberOfLines={1}>{friend.display_name}</Text>
        <View style={styles.friendStats}>
          <Text style={styles.friendStat}>🔥 {friend.streak_days}d</Text>
          <View style={styles.friendStatDot} />
          <Text style={styles.friendStat}>⚡ {friend.total_xp} XP</Text>
        </View>
        <Text style={[styles.friendDiff, diffPositive ? styles.friendDiffAhead : styles.friendDiffBehind]}>
          {diffStr}
        </Text>
      </View>
    </View>
  )
})

// ── Invite card (always shown at top) ────────────────────────────────────────

function InviteCard({ onShare }: { onShare: () => void }) {
  return (
    <TouchableOpacity style={ic.card} onPress={onShare} activeOpacity={0.85}>
      <View style={ic.left}>
        <Text style={ic.emoji}>🔗</Text>
      </View>
      <View style={ic.mid}>
        <Text style={ic.title}>Invite friends to PhonicsFlow</Text>
        <Text style={ic.sub}>Share your personal invite link — they'll appear here when they join</Text>
      </View>
      <View style={ic.btn}>
        <Ionicons name="share-outline" size={16} color="#fff" />
        <Text style={ic.btnText}>Share</Text>
      </View>
    </TouchableOpacity>
  )
}
const ic = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.lg, padding: spacing.md,
    marginHorizontal: spacing.lg, marginTop: spacing.md,
  },
  left:    { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emoji:   { fontSize: 22 },
  mid:     { flex: 1, gap: 2 },
  title:   { fontSize: fontSize.md, fontWeight: '700', color: '#fff' },
  sub:     { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.75)', lineHeight: 16 },
  btn:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: radius.full, paddingVertical: 6, paddingHorizontal: 10 },
  btnText: { fontSize: fontSize.sm, fontWeight: '700', color: '#fff' },
})

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  code, onShare,
}: {
  code: string | null; onShare: () => void
}) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyEmoji}>🤝</Text>
      <Text style={styles.emptyTitle}>Learning is better with friends</Text>
      <Text style={styles.emptySub}>
        Share your invite code and when a friend signs up, you'll see their progress here.
      </Text>

      {code && (
        <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.85}>
          <Ionicons name="share-outline" size={18} color="#fff" />
          <Text style={styles.shareBtnText}>Invite a friend</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.emptyHint}>
        When a friend signs up using your invite link, they'll appear here automatically and you can compare progress.
      </Text>
    </View>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function FriendsScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuthStore()
  const { profile } = useProfile()
  const { friends, loading, error, refetch } = useFriends()
  const { code, share } = useReferralCode()

  const displayName = profile?.display_name ?? (user?.user_metadata?.display_name as string | undefined) ?? 'you'
  const myXp        = profile?.total_xp ?? 0

  useFocusEffect(useCallback(() => { void refetch() }, [refetch]))

  const onShare = () => void share(displayName)

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>

      {/* Invite card — always visible */}
      {code && <InviteCard onShare={onShare} />}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => void refetch()}>
            <Text style={styles.errorRetry}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : friends.length === 0 ? (
        <ScrollView
          contentContainerStyle={[styles.emptyScroll, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          <EmptyState code={code} onShare={onShare} />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => void refetch()} />
          }
        >
          <Text style={styles.listEyebrow}>{friends.length} friend{friends.length !== 1 ? 's' : ''} on PhonicsFlow</Text>

          {friends.map((f) => (
            <FriendCard key={f.id} friend={f} myXp={myXp} />
          ))}

        </ScrollView>
      )}
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg },
  errorText:   { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center' },
  errorRetry:  { fontSize: fontSize.md, color: colors.primary, fontWeight: '700' },

  // Empty state
  emptyScroll: { flexGrow: 1 },
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, gap: spacing.md,
  },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.sm },
  emptyTitle: {
    fontSize: fontSize.xxl, fontWeight: '700', color: colors.text,
    textAlign: 'center', lineHeight: 30,
  },
  emptySub: {
    fontSize: fontSize.md, color: colors.textMuted,
    textAlign: 'center', lineHeight: 22,
  },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.xl,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
  },
  shareBtnText: { fontSize: fontSize.lg, fontWeight: '700', color: '#fff' },
  emptyHint: {
    fontSize: fontSize.sm, color: colors.textHint,
    textAlign: 'center', lineHeight: 20, marginTop: spacing.xs,
  },

  // Friends list
  scroll:      { flex: 1 },
  listContent: { padding: spacing.lg, gap: spacing.sm },
  listEyebrow: {
    fontSize: 10, fontWeight: '600', color: colors.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.xs,
  },

  friendCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  friendAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  friendAvatarText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primary },
  friendInfo:  { flex: 1, gap: 3 },
  friendName:  { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  friendStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  friendStat:  { fontSize: fontSize.sm, color: colors.textMuted },
  friendStatDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.border },
  friendDiff:     { fontSize: fontSize.xs, fontWeight: '600' },
  friendDiffAhead:  { color: colors.error },
  friendDiffBehind: { color: colors.primary },

})
