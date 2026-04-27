import type { UserProgress } from '@/lib/types'

export function progressForLesson(progress: UserProgress[], lessonId: string) {
  return progress.find((p) => p.lesson_id === lessonId)
}

/** Bar width: completed → 100%; else from mastered / wordGoal. */
export function familyProgressPct(
  p: UserProgress | undefined,
  completed: boolean,
  wordGoal: number
): number {
  if (completed || p?.completed) return 100
  const n = p?.words_mastered?.length ?? 0
  if (n <= 0) return 0
  const goal = Math.max(1, wordGoal)
  return Math.min(95, Math.round((n / goal) * 100))
}

/** Highest lesson `level` the user has fully completed (0 if none). */
export function maxCompletedLessonLevel(
  progress: UserProgress[],
  lessonLevelById: Map<string, number>
): number {
  let m = 0
  for (const row of progress) {
    if (!row.completed) continue
    const lv = lessonLevelById.get(row.lesson_id)
    if (lv != null && lv > m) m = lv
  }
  return m
}

/** Level-1 lessons always reachable; next tier unlocks after any lesson at `maxCompleted` is done. */
export function isLessonUnlocked(lessonLevel: number, maxCompletedLevel: number): boolean {
  const cap = Math.max(maxCompletedLevel + 1, 1)
  return lessonLevel <= cap
}
