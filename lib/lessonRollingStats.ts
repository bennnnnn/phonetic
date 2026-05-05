import type { UserProgress } from '@/lib/types'

/** Rolling calendar window: last 168 hours from first completed_at vs now comparison. */
const ROLLING_MS = 7 * 24 * 60 * 60 * 1000

function completedAtMs(p: UserProgress): number | null {
  if (!p.completed_at) return null
  const t = new Date(p.completed_at).getTime()
  return Number.isFinite(t) ? t : null
}

/** Completed lessons whose completed_at is within the last 7 days (rolling). */
export function countCompletedLessonsRolling7Days(progress: UserProgress[]): number {
  const cutoff = Date.now() - ROLLING_MS
  let n = 0
  for (const row of progress) {
    if (!row.completed) continue
    const t = completedAtMs(row)
    if (t !== null && t >= cutoff) n++
  }
  return n
}

export function countCompletedLessonsTotal(progress: UserProgress[]): number {
  return progress.filter((p) => p.completed).length
}
