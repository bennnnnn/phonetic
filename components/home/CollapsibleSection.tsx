import { useEffect } from 'react'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native'

type Props = {
  expanded: boolean
  sectionHeight: number
  children: React.ReactNode
}

export default function CollapsibleSection({ expanded, sectionHeight, children }: Props) {
  const animH = useSharedValue(expanded ? sectionHeight : 0)

  useEffect(() => {
    animH.value = withSpring(expanded ? sectionHeight : 0, {
      damping: 22, stiffness: 160, mass: 1,
    })
  }, [expanded, sectionHeight])

  const style = useAnimatedStyle(() => ({ height: animH.value }))

  return (
    <Animated.View style={[styles.wrap, style]}>
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', position: 'relative' },
})
