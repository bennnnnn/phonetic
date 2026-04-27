import { useCallback } from 'react'

// NOTE: expo-notifications' push-token auto-registration crashes Expo Go.
// Local notification scheduling is wired up here and will activate in a
// production / custom dev-client build. All functions are safe no-ops until then.

function parseTime(timeStr: string): { hour: number; minute: number } {
  const [timePart = '8:00', meridiem = 'AM'] = timeStr.split(' ')
  const [hourStr = '8', minuteStr = '0'] = timePart.split(':')
  let hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr, 10)
  if (meridiem === 'PM' && hour !== 12) hour += 12
  if (meridiem === 'AM' && hour === 12) hour = 0
  return { hour, minute }
}

async function trySchedule(timeStr: string): Promise<void> {
  try {
    // Dynamic import so the module is never evaluated at startup
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
  return { requestPermission, scheduleReminder, cancelAll }
}
