# Skill: Create a New Screen

Read this before building any Expo Router screen.

---

## File Location
```
/app/[route]/index.tsx        → standard screen
/app/[route]/[id].tsx         → dynamic route screen
/app/(group)/[route].tsx      → grouped route
```

## Step-by-Step

### 1. Create the screen file
```typescript
import { View, ScrollView, StyleSheet } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { colors, spacing } from '@/lib/tokens'

export default function ExampleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <>
      <Stack.Screen options={{ title: 'Screen Title', headerShown: true }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* content */}
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
})
```

### 2. Add route constant
In `/lib/routes.ts`:
```typescript
export const ROUTES = {
  // ...existing
  EXAMPLE: (id: string) => `/example/${id}`,
}
```

### 3. Always handle 3 states
```typescript
// Loading
if (loading) return <ScreenSkeleton />

// Error
if (error) return <ErrorState message={error.message} onRetry={refetch} />

// Empty
if (!data) return <EmptyState message="Nothing here yet" />

// Happy path
return <YourContent />
```

### 4. Use existing components
- `<ScreenSkeleton />` from `/components/ui/Skeleton`
- `<ErrorState />` from `/components/ui/ErrorState`
- `<EmptyState />` from `/components/ui/EmptyState`
- If these don't exist yet, create them as part of this task.

### 5. Navigation
```typescript
import { router } from 'expo-router'
import { ROUTES } from '@/lib/routes'

// Push
router.push(ROUTES.LESSON('lesson-123'))

// Replace (no back)
router.replace(ROUTES.HOME)

// Back
router.back()
```

### 6. Accessibility
Every screen needs:
```typescript
<View accessible accessibilityRole="none" accessibilityLabel="Screen name screen">
```
Every button needs `accessibilityLabel` and `accessibilityHint`.

---

## Rules
- Use `ScrollView` as root unless it is a fixed/game layout
- No hardcoded colors or spacing — always use tokens
- No `useEffect` for navigation — use event handlers
- Params must be typed with generics: `useLocalSearchParams<{ id: string }>()`
- Header config always via `<Stack.Screen options={...} />`
