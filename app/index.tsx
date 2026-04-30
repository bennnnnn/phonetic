import { Redirect } from 'expo-router'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuthStore } from '@/store/authStore'
import { colors } from '@/lib/tokens'

export default function Index() {
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)

  if (loading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (session) {
    return <Redirect href="/(tabs)/home" />
  }

  // Show animated splash, which auto-advances to onboarding
  return <Redirect href="/(auth)/splash" />
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
})
