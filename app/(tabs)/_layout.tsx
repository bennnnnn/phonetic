import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { View, StyleSheet, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/lib/tokens'

type IconName = React.ComponentProps<typeof Ionicons>['name']

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  const tint = focused ? colors.primary : colors.textMuted
  return (
    <View style={styles.iconWrapper}>
      <View style={[styles.tabIndicator, focused && styles.tabIndicatorActive]} />
      <Ionicons name={name} size={22} color={tint} />
    </View>
  )
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8)
  const tabBarHeight = 52 + bottomPad

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 6,
          paddingBottom: bottomPad,
          height: tabBarHeight,
        },
        tabBarLabelStyle: styles.label,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarLabel: 'Progress',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarLabel: 'Friends',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="leagues" options={{ href: null }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
      {/* Practice is now embedded in the Home tab — hidden from nav */}
      <Tabs.Screen name="practice" options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '500' },
  iconWrapper: {
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 2, gap: 4,
  },
  tabIndicator: {
    width: 20, height: 3, borderRadius: 2,
    backgroundColor: colors.border,
  },
  tabIndicatorActive: { backgroundColor: colors.primary },
})
