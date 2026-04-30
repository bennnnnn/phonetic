import * as Haptics from 'expo-haptics'

let hapticsEnabled = true

export function setHapticsEnabled(v: boolean) {
  hapticsEnabled = v
}

export const haptics = {
  tap: () => {
    if (!hapticsEnabled) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  },
  interact: () => {
    if (!hapticsEnabled) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  },
  success: () => {
    if (!hapticsEnabled) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  },
  error: () => {
    if (!hapticsEnabled) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  },
  warning: () => {
    if (!hapticsEnabled) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  },
  celebrate: async () => {
    if (!hapticsEnabled) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    await new Promise(r => setTimeout(r, 100))
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await new Promise(r => setTimeout(r, 80))
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  },
  streak: async () => {
    if (!hapticsEnabled) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await new Promise(r => setTimeout(r, 120))
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  },
}
