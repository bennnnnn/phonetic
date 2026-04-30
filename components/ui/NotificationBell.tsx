import { useState } from 'react'
import {
  View, Text, TouchableOpacity, Modal, FlatList, StyleSheet,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useInAppNotifications } from '@/hooks/useInAppNotifications'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

type Props = {
  onNavigate?: (route: string) => void
}

export function NotificationBell({ onNavigate }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useInAppNotifications()
  const [visible, setVisible] = useState(false)
  const insets = useSafeAreaInsets()

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.bellWrap}
        accessibilityLabel={`${unreadCount} unread notifications`}
      >
        <Ionicons
          name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
          size={20}
          color={unreadCount > 0 ? colors.primary : colors.textMuted}
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <View style={styles.modalHeaderRight}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={() => void markAllAsRead()} hitSlop={8}>
                  <Text style={styles.markAllText}>mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setVisible(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyEmoji}>🔔</Text>
                <Text style={styles.emptyTitle}>No notifications yet</Text>
                <Text style={styles.emptySub}>Friend activity and milestones will appear here.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.notifRow, !item.read && styles.notifRowUnread]}
                onPress={() => {
                  void markAsRead(item.id)
                  if (item.link_route && onNavigate) {
                    setVisible(false)
                    onNavigate(item.link_route)
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.notifLeft}>
                  <Text style={styles.notifEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.notifBody}>
                  <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>{item.title}</Text>
                  {item.body ? <Text style={styles.notifBodyText}>{item.body}</Text> : null}
                  <Text style={styles.notifTime}>{timeAgo(item.created_at)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => void deleteNotification(item.id)}
                  hitSlop={8}
                  style={styles.notifDelete}
                >
                  <Ionicons name="close-outline" size={16} color={colors.textHint} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const styles = StyleSheet.create({
  bellWrap: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },

  modalSafe: { flex: 1, backgroundColor: colors.neutral },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  modalHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },

  markAllText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },

  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 120, gap: spacing.md, paddingHorizontal: spacing.xl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.xs },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptySub:   { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center', lineHeight: 22, maxWidth: 280 },

  notifRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    gap: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  notifRowUnread: { backgroundColor: colors.primaryLight },
  notifLeft: { marginTop: 2 },
  notifEmoji: { fontSize: 22 },
  notifBody: { flex: 1, gap: 3 },
  notifTitle: { fontSize: fontSize.sm, fontWeight: '500', color: colors.text },
  notifTitleUnread: { fontWeight: '700' },
  notifBodyText: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
  notifTime: { fontSize: 10, color: colors.textHint, marginTop: 2 },
  notifDelete: { padding: 4 },
})
