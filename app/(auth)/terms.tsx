import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, radius } from '@/lib/tokens'

const LAST_UPDATED = 'April 2025'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By downloading or using PhonicsFlow you agree to be bound by these Terms of Service. If you do not agree, please do not use the app.',
  },
  {
    title: '2. What PhonicsFlow Is',
    body: 'PhonicsFlow is an educational app that teaches English phonics patterns. It is designed for personal, non-commercial use. We do not guarantee any specific learning outcomes.',
  },
  {
    title: '3. User Accounts',
    body: 'You must be at least 13 years old to create an account. You are responsible for keeping your login credentials secure. You may not share your account or use the app on behalf of a third party without their consent.',
  },
  {
    title: '4. Free and Pro Plans',
    body: 'PhonicsFlow offers a free tier with limited lessons and a Pro subscription that unlocks all content. Subscription fees are charged through the App Store or Google Play. Refunds are handled according to the respective platform\'s refund policy.',
  },
  {
    title: '5. Prohibited Conduct',
    body: 'You agree not to: (a) reverse-engineer or decompile the app; (b) distribute or resell content; (c) attempt to access other users\' data; (d) use automated tools to scrape or interact with the service; or (e) violate any applicable law or regulation.',
  },
  {
    title: '6. Intellectual Property',
    body: 'All content in PhonicsFlow — including lesson text, audio, illustrations, and code — is owned by PhonicsFlow or its licensors. You may not reproduce or redistribute it without written permission.',
  },
  {
    title: '7. Disclaimer of Warranties',
    body: 'The app is provided "as is" without warranties of any kind. We do not warrant that the service will be uninterrupted, error-free, or free of viruses.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'To the fullest extent permitted by law, PhonicsFlow shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.',
  },
  {
    title: '9. Changes to These Terms',
    body: 'We may update these Terms from time to time. Continued use of the app after changes constitutes acceptance of the updated Terms. We will notify you of significant changes via the app or email.',
  },
  {
    title: '10. Contact',
    body: 'Questions about these Terms? Reach us at support@phonicsflow.app.',
  },
]

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.meta}>Last updated: {LAST_UPDATED}</Text>

        <Text style={styles.intro}>
          These Terms of Service govern your use of the PhonicsFlow mobile application.
          Please read them carefully before creating an account.
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
