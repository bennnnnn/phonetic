import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize } from '@/lib/tokens'

const LAST_UPDATED = 'April 2025'

const SECTIONS = [
  {
    title: '1. What We Collect',
    body: `We collect information you provide directly:
• Account info: email address and display name
• Learning preferences: daily goal, accent, native language
• Progress data: lessons completed, words mastered, XP earned
• Device info: OS version and device type (for bug reporting only)

We do not collect your contacts, location, photos, or any sensitive personal data.`,
  },
  {
    title: '2. How We Use Your Data',
    body: `Your data is used solely to:
• Provide personalised lessons and track your progress
• Send optional daily reminder notifications (only if you enable them)
• Improve the app through anonymised, aggregated analytics
• Respond to support requests

We do not sell your data to third parties.`,
  },
  {
    title: '3. Data Storage and Security',
    body: 'Your data is stored securely using Supabase, a trusted cloud database provider. All data in transit is encrypted via TLS. Access to your data is restricted to your account using industry-standard row-level security policies.',
  },
  {
    title: '4. Friends and Referrals',
    body: 'If you use our invite link feature, your display name and aggregate progress (XP, streak) may be visible to friends you are connected with inside the app. You can see and manage your friend connections from the Friends tab.',
  },
  {
    title: '5. Notifications',
    body: 'If you enable daily reminders, we use the device\'s local notification system to send them. We do not use third-party push notification services for reminder delivery. You can disable notifications at any time from the app settings or your device settings.',
  },
  {
    title: '6. Children\'s Privacy',
    body: 'PhonicsFlow is not directed at children under 13. We do not knowingly collect personal data from children under 13. If you believe a child has provided us personal data, please contact us at support@phonicsflow.app and we will delete it promptly.',
  },
  {
    title: '7. Your Rights',
    body: `Depending on your jurisdiction, you may have the right to:
• Access a copy of the personal data we hold about you
• Correct inaccurate data
• Request deletion of your account and data
• Object to or restrict processing of your data

To exercise these rights, email support@phonicsflow.app. We will respond within 30 days.`,
  },
  {
    title: '8. Third-Party Services',
    body: 'We use the following third-party services: Supabase (database), Google Cloud (text-to-speech for lesson audio and related features), RevenueCat (subscription management). Each has its own privacy policy. We only share the minimum data required for these services to function.',
  },
  {
    title: '9. Data Retention',
    body: 'We retain your data as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where we are required to retain it by law.',
  },
  {
    title: '10. Changes to This Policy',
    body: 'We may update this Privacy Policy periodically. We will notify you of significant changes via the app or email. Continued use after changes constitutes acceptance of the updated policy.',
  },
  {
    title: '11. Contact Us',
    body: 'For privacy-related questions or to exercise your rights, contact us at:\nsupport@phonicsflow.app',
  },
]

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.meta}>Last updated: {LAST_UPDATED}</Text>

        <Text style={styles.intro}>
          PhonicsFlow is committed to protecting your privacy. This policy explains what
          information we collect, how we use it, and your rights regarding your data.
        </Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  meta:  { fontSize: fontSize.sm, color: colors.textHint },
  intro: { fontSize: fontSize.md, color: colors.textMuted, lineHeight: 22 },
  section: { gap: spacing.xs },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  sectionBody:  { fontSize: fontSize.md, color: colors.textMuted, lineHeight: 22 },
})
