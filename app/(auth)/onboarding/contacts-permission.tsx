import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Contacts from 'expo-contacts'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

async function readAndMatchContacts(): Promise<number> {
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.Emails],
  })

  const emails: string[] = []
  for (const contact of data) {
    for (const e of contact.emails ?? []) {
      if (e.email) emails.push(e.email.toLowerCase())
    }
  }

  if (emails.length === 0) return 0

  // Server-side match against auth.users — no raw emails leak back to client
  const { data: matches, error } = await supabase.rpc('find_users_by_emails', {
    p_emails: emails,
  })

  if (error || !matches || matches.length === 0) return 0

  const { user } = useAuthStore.getState()
  if (!user) return 0

  // Insert a friendship row for every matched user (ignore duplicates)
  const rows = matches.map((m: { user_id: string }) => ({
    referrer_id: user.id,
    referred_id: m.user_id,
  }))

  await supabase.from('friendships').upsert(rows, { ignoreDuplicates: true })

  return matches.length
}

export default function ContactsPermissionScreen() {
  const insets  = useSafeAreaInsets()
  const [busy, setBusy] = useState(false)

  const proceed = () => router.push('/(auth)/onboarding/notifications-permission')

  const handleEnable = async () => {
    setBusy(true)
    try {
      const { status } = await Contacts.requestPermissionsAsync()
      if (status === 'granted') {
        await readAndMatchContacts()
      }
    } catch {
      // Non-fatal — permission denied or read error; just continue
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
