import * as Haptics from 'expo-haptics'

export const haptics = {
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  interact: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  celebrate: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    await new Promise(r => setTimeout(r, 100))
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await new Promise(r => setTimeout(r, 80))
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  },
  streak: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await new Promise(r => setTimeout(r, 120))
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  },
}
