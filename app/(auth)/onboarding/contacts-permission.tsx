import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '@/store/authStore'
import { matchContactsAfterPermissionPrompt } from '@/lib/contactsFriends'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

export default function ContactsPermissionScreen() {
  const insets  = useSafeAreaInsets()
  const [busy, setBusy] = useState(false)

  const proceed = () => router.push('/(auth)/onboarding/notifications-permission')

  const handleEnable = async () => {
    setBusy(true)
    try {
      const { user } = useAuthStore.getState()
      if (user) await matchContactsAfterPermissionPrompt(user.id)
    } catch (err) {
      console.warn('[contacts-permission] matching failed:', err)
    } finally {
      setBusy(false)
      proceed()
    }
  }

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
      <View style={styles.body}>
        <Text style={styles.icon}>👥</Text>
        <Text style={styles.headline}>Find your friends</Text>
        <Text style={styles.sub}>
          Allow access to your contacts so you can find friends already on PhonicsFlow and invite others.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, busy && styles.primaryBtnBusy]}
          onPress={handleEnable}
          activeOpacity={0.86}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Allow contacts access</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={proceed} activeOpacity={0.7} disabled={busy}>
          <Text style={styles.skipText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },

  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },

  icon:     { fontSize: 72 },
  headline: { fontSize: 28, fontWeight: '700', color: colors.text, textAlign: 'center', letterSpacing: -0.4 },
  sub:      { fontSize: fontSize.lg, color: colors.textMuted, textAlign: 'center', lineHeight: 26 },

  footer: { gap: spacing.md, paddingBottom: spacing.md },

  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryBtnBusy: { opacity: 0.7 },
  primaryBtnText: { color: '#fff', fontSize: fontSize.xl, fontWeight: '700' },

  skipText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.md,
    paddingVertical: spacing.sm,
  },
})
