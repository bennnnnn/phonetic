import { supabase } from '@/lib/supabase'

type NotificationType =
  | 'friend_joined'
  | 'friend_pull_ahead'
  | 'level_up'
  | 'streak_milestone'
  | 'referral_milestone'
  | 'lesson_complete'
  | 'group_complete'
  | 'pro_activated'
  | 'free_month_earned'

type Input = {
  userId: string
  type: NotificationType
  title: string
  body?: string
  emoji?: string
  linkRoute?: string
}

/**
 * Register for push notifications and store the push token.
 * Call once on app launch.
 * Returns the push token or null if registration fails.
 */
export async function registerPushToken(): Promise<string | null> {
  const { tryRegisterPushToken } = await import('@/hooks/useNotifications')
  return tryRegisterPushToken()
}

/**
 * Insert a notification into the in-app feed for the given user.
 * Best-effort — silently fails if something goes wrong.
 */
export async function pushNotification(input: Input) {
  try {
    await supabase.from('notifications').insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? '',
      emoji: input.emoji ?? '📌',
      link_route: input.linkRoute ?? null,
      read: false,
    })
  } catch {
    // silent fail
  }
}
