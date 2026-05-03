import { AppState, Platform } from 'react-native'
import { useCallback } from 'react'

function parseTime(timeStr: string): { hour: number; minute: number } {
  const [timePart = '8:00', meridiem = 'AM'] = timeStr.split(' ')
  const [hourStr = '8', minuteStr = '0'] = timePart.split(':')
  let hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr, 10)
  if (meridiem === 'PM' && hour !== 12) hour += 12
  if (meridiem === 'AM' && hour === 12) hour = 0
  return { hour, minute }
}

export async function tryRegisterPushToken(): Promise<string | null> {
  try {
    const { default: Constants } = await import('expo-constants')
    const Notif = await import('expo-notifications')
    if (!Constants.isDevice) {
      console.warn('[Push] Push tokens only work on physical devices')
      return null
    }
    const { status: existingStatus } = await Notif.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notif.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      console.warn('[Push] Permission not granted')
      return null
    }
    const tokenData = await Notif.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })
    return tokenData.data
  } catch (err) {
    console.warn('[Push] Token registration failed', err)
    return null
  }
}

async function trySchedule(timeStr: string): Promise<void> {
  try {
    const Notif = await import('expo-notifications')
    await Notif.cancelAllScheduledNotificationsAsync()
    const { hour, minute } = parseTime(timeStr)
    await Notif.scheduleNotificationAsync({
      content: {
        title: 'Time to practice! 📚',
        body: 'Your daily phonics lesson is waiting.',
      },
      trigger: {
        type: Notif.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    })
  } catch {
    // Silently skip in Expo Go or if permissions aren't granted
  }
}

async function tryCancel(): Promise<void> {
  try {
    const Notif = await import('expo-notifications')
    await Notif.cancelAllScheduledNotificationsAsync()
  } catch {}
}

async function tryRequestPermission(): Promise<boolean> {
  try {
    const Notif = await import('expo-notifications')
    const { status } = await Notif.requestPermissionsAsync()
    return status === 'granted'
  } catch {
    return false
  }
}

export function useNotifications() {
  const requestPermission = useCallback(() => tryRequestPermission(), [])
  const scheduleReminder  = useCallback((t: string) => trySchedule(t), [])
  const cancelAll         = useCallback(() => tryCancel(), [])
  const registerPush      = useCallback(() => tryRegisterPushToken(), [])
  return { requestPermission, scheduleReminder, cancelAll, registerPush }
}
