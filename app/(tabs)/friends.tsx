import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, memo, useMemo, useState, useEffect } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '@/hooks/useProfile'
import { useFriends, type Friend } from '@/hooks/useFriends'
import { useReferralCode } from '@/hooks/useReferralCode'
import { useProgress } from '@/hooks/useProgress'
import { matchContactsAfterPermissionPrompt } from '@/lib/contactsFriends'
import { countCompletedLessonsRolling7Days, countCompletedLessonsTotal } from '@/lib/lessonRollingStats'
import { readFriendXpSnapshot, writeFriendXpSnapshot } from '@/lib/friendXpSnapshot'
import { pushNotification } from '@/lib/notifications'
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

function ordinal(n: number): string {
  const j = n % 10
  const k = n % 100
  if (j === 1 && k !== 11) return `${n}st`
  if (j === 2 && k !== 12) return `${n}nd`
  if (j === 3 && k !== 13) return `${n}rd`
  return `${n}th`
}

function shortName(full: string): string {
  const p = full.trim().split(/\s+/)[0]
  return p || full
}

// ── Friend card ───────────────────────────────────────────────────────────────

const FriendCard = memo(function FriendCard({
  friend, myXp, rank, myLessons7d, myLessonsTotal,
}: {
  friend: Friend
  myXp: number
  rank: number
  myLessons7d: number
  myLessonsTotal: number
}) {
  const diff    = friend.total_xp - myXp
  const diffStr = xpDiff(friend.total_xp, myXp)
  const diffPositive = diff >= 0

  const hasLessonStats =
    friend.lessons_completed_total != null &&
    friend.lessons_completed_last_7d != null

  return (
    <View style={styles.friendCard}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankBadgeText}>{rank}</Text>
      </View>
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
        {hasLessonStats && (
          <Text style={styles.friendLessons} numberOfLines={2}>
            Last 7 days: {friend.lessons_completed_last_7d} lessons · yours {myLessons7d}
            {' · '}
            All-time: {friend.lessons_completed_total} · yours {myLessonsTotal}
          </Text>
        )}
        <Text style={[styles.friendDiff, diffPositive ? styles.friendDiffAhead : styles.friendDiffBehind]}>
          {diffStr}
        </Text>
      </View>
    </View>
  )
})

function LeaderSummary({ text }: { text: string }) {
  return (
    <View style={ls.wrap}>
      <Text style={ls.label}>Your place</Text>
      <Text style={ls.body}>{text}</Text>
    </View>
  )
}

const ls = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  body: { fontSize: fontSize.md, color: colors.text, lineHeight: 22, fontWeight: '600' },
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
        <Text style={ic.sub}>
          Share your link — friends who sign up show up here. You can also scan contacts below anytime.
        </Text>
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

function ScanContactsCard({ busy, onPress }: { busy: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={scan.card}
      onPress={onPress}
      disabled={busy}
      activeOpacity={0.88}
    >
      <View style={scan.iconWrap}>
        {busy ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Ionicons name="people-circle-outline" size={26} color={colors.primary} />
        )}
      </View>
      <View style={scan.mid}>
        <Text style={scan.title}>Find friends from contacts</Text>
        <Text style={scan.sub}>
          Emails are matched securely on our servers — we never message your contacts.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  )
}

const scan = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  iconWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  mid: { flex: 1, gap: 2 },
  title: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  sub: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
})

const FRIEND_AHEAD_NOTIFY_COOLDOWN_MS = 6 * 60 * 60 * 1000

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyEmoji}>🤝</Text>
      <Text style={styles.emptyTitle}>Learning is better with friends</Text>
      <Text style={styles.emptySub}>
        Use the invite link above to bring friends onto PhonicsFlow, or scan your contacts to find people already here.
      </Text>
      <Text style={styles.emptyHint}>
        Friends who join via your link are connected automatically. Contacts are matched privately — we never message anyone on your behalf.
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
  const { progress } = useProgress()
  const { code, share } = useReferralCode()
  const [refreshing, setRefreshing] = useState(false)
  const [contactBusy, setContactBusy] = useState(false)

  const displayName = profile?.display_name ?? (user?.user_metadata?.display_name as string | undefined) ?? 'you'
  const myXp        = profile?.total_xp ?? 0

  const myLessons7d    = useMemo(() => countCompletedLessonsRolling7Days(progress), [progress])
  const myLessonsTotal = useMemo(() => countCompletedLessonsTotal(progress), [progress])

  const leaderSummaryText = useMemo(() => {
    if (!user) return null
    type Row = { display_name: string; total_xp: number; isMe: boolean }
    const rows: Row[] = [
      ...friends.map((f) => ({ display_name: f.display_name, total_xp: f.total_xp, isMe: false })),
      { display_name: displayName, total_xp: myXp, isMe: true },
    ]
    rows.sort((a, b) => {
      if (b.total_xp !== a.total_xp) return b.total_xp - a.total_xp
      return a.display_name.localeCompare(b.display_name, undefined, { sensitivity: 'base' })
    })
    const total = rows.length
    if (total <= 1) {
      return "You're on your own — invite friends to compare XP and streaks."
    }
    const myRank = rows.findIndex((r) => r.isMe) + 1
    const leader = rows[0]!
    if (leader.isMe) {
      return `You're 1st of ${total} — you're leading on XP.`
    }
    const gap = leader.total_xp - myXp
    return `You're ${ordinal(myRank)} of ${total} · ${gap} XP behind ${shortName(leader.display_name)}.`
  }, [user, friends, displayName, myXp])

  useEffect(() => {
    if (!user || loading) return
    void (async () => {
      try {
        const prev = await readFriendXpSnapshot(user.id)
        if (prev && friends.length > 0) {
          for (const f of friends) {
            const px = prev.friends[f.id]
            if (px === undefined) continue
            if (px <= prev.myXp && f.total_xp > myXp) {
              const dk = `@phonicsflow/friendAheadNotif:${user.id}:${f.id}`
              const raw = await AsyncStorage.getItem(dk)
              const last = raw ? Number(raw) : 0
              const fresh =
                !Number.isFinite(last) ||
                Date.now() - last > FRIEND_AHEAD_NOTIFY_COOLDOWN_MS
              if (!fresh) continue
              await pushNotification({
                userId: user.id,
                type: 'friend_pull_ahead',
                title: `${shortName(f.display_name)} moved ahead of you on XP`,
                body: `They're at ${f.total_xp} XP. Catch up from the Friends tab.`,
                emoji: '🏃',
                linkRoute: '/(tabs)/friends',
              })
              await AsyncStorage.setItem(dk, String(Date.now()))
            }
          }
        }
        await writeFriendXpSnapshot(user.id, friends, myXp)
      } catch (err) {
        console.warn('[friends] XP snapshot/notification failed:', err)
      }
    })()
  }, [user?.id, loading, friends, myXp])

  useFocusEffect(useCallback(() => { void refetch() }, [refetch]))

  const onShare = () => void share(displayName)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  const onScanContacts = useCallback(async () => {
    if (!user) return
    setContactBusy(true)
    try {
      const { matched, granted } = await matchContactsAfterPermissionPrompt(user.id)
      if (!granted) {
        Alert.alert(
          'Contacts',
          'Allow contacts access to match people already on PhonicsFlow. You can enable it in system Settings.',
        )
        return
      }
      await refetch()
      Alert.alert(
        matched > 0 ? 'Friends linked' : 'No new matches',
        matched > 0
          ? `Linked ${matched} contact${matched === 1 ? '' : 's'} who already use the app.`
          : 'No contacts matched an account yet. Try inviting with your personal link.',
      )
    } finally {
      setContactBusy(false)
    }
  }, [user?.id, refetch])

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>

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
          {user && code ? <InviteCard onShare={onShare} /> : null}
          {user && <ScanContactsCard busy={contactBusy} onPress={() => void onScanContacts()} />}
          <EmptyState />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {user && code ? <InviteCard onShare={onShare} /> : null}
          {user && <ScanContactsCard busy={contactBusy} onPress={() => void onScanContacts()} />}
          {leaderSummaryText && <LeaderSummary text={leaderSummaryText} />}
          <View style={styles.listContent}>
            <Text style={styles.listEyebrow}>
              {friends.length} friend{friends.length !== 1 ? 's' : ''} · sorted by XP
            </Text>
            {friends.map((f, i) => (
              <FriendCard
                key={f.id}
                friend={f}
                myXp={myXp}
                rank={i + 1}
                myLessons7d={myLessons7d}
                myLessonsTotal={myLessonsTotal}
              />
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
  emptyHint: {
    fontSize: fontSize.sm, color: colors.textHint,
    textAlign: 'center', lineHeight: 20, marginTop: spacing.xs,
  },

  // Friends list
  scroll:      { flex: 1 },
  listContent: { padding: spacing.lg, gap: spacing.sm, paddingTop: spacing.sm },
  listEyebrow: {
    fontSize: 10, fontWeight: '600', color: colors.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginTop: spacing.sm,
  },

  rankBadge: {
    width: 28, minWidth: 28,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.borderLight,
  },
  rankBadgeText: { fontSize: fontSize.md, fontWeight: '800', color: colors.primary },

  friendCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
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
  friendLessons: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
  friendDiff:     { fontSize: fontSize.xs, fontWeight: '600' },
  friendDiffAhead:  { color: colors.error },
  friendDiffBehind: { color: colors.primary },

})
