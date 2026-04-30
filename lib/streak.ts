import { supabase } from '@/lib/supabase'
import { pushNotification } from '@/lib/notifications'

/**
 * Recalculate and save the user's streak from their actual completion history.
 *
 * Always derives the ground truth from the DB — never increments a counter.
 * This means calling it multiple times concurrently is safe (idempotent).
 *
 * Streak = number of consecutive calendar days ending today (or yesterday
 * if the user hasn't completed anything yet today).
 */
export async function updateStreak(userId: string) {
  const now    = new Date()
  const todayMs = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const cutoff  = new Date(todayMs - 365 * 86400000).toISOString()

  const [{ data: progressRows }, { data: groupRows }] = await Promise.all([
    supabase
      .from('user_progress')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_at', cutoff),
    supabase
      .from('group_progress')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_at', cutoff),
  ])

  const allDates = [
    ...(progressRows ?? []).map((r) => r.completed_at),
    ...(groupRows   ?? []).map((r) => r.completed_at),
  ].filter(Boolean) as string[]

  if (allDates.length === 0) {
    await supabase.from('user_profiles').update({ streak_days: 0 }).eq('id', userId)
    return
  }

  // Build a Set of unique UTC day timestamps
  const daySet = new Set(
    allDates.map((d) => {
      const dt = new Date(d)
      return Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())
    })
  )

  const yesterdayMs = todayMs - 86400000

  // No completion today or yesterday → streak is 0
  if (!daySet.has(todayMs) && !daySet.has(yesterdayMs)) {
    await supabase.from('user_profiles').update({ streak_days: 0 }).eq('id', userId)
    return
  }

  // Count consecutive days backwards from today (or yesterday)
  const startMs = daySet.has(todayMs) ? todayMs : yesterdayMs
  let streak  = 0
  let checkMs = startMs
  while (daySet.has(checkMs)) {
    streak++
    checkMs -= 86400000
  }

  await supabase.from('user_profiles').update({ streak_days: streak }).eq('id', userId)

  // Milestone notifications
  if (streak === 7 || streak === 100 || (streak > 0 && streak % 30 === 0)) {
    await pushNotification({
      userId,
      type: 'streak_milestone',
      title: `${streak}-day streak! 🔥`,
      body: `You've been learning for ${streak} days straight. Keep it up!`,
      emoji: '🔥',
      linkRoute: '/(tabs)/progress',
    }).catch(() => {})
  }
}
