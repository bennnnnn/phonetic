import type { UserProgress } from '@/lib/types'

export function progressForLesson(progress: UserProgress[], lessonId: string) {
  return progress.find((p) => p.lesson_id === lessonId)
}

/** Parse words_mastered into a string array regardless of storage format (array or JSON string). */
export function wordsMasteredArray(p: UserProgress | undefined): string[] {
  if (!p) return []
  const m = p.words_mastered
  if (Array.isArray(m)) return m
  if (typeof m === 'string') {
    try {
      const parsed = JSON.parse(m)
      return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
  }
  return []
}

/** Safely get the length of words_mastered — could be array or JSON string from DB */
export function wordsMasteredLength(p: UserProgress | undefined): number {
  if (!p) return 0
  const m = p.words_mastered
  if (Array.isArray(m)) return m.length
  if (typeof m === 'string') {
    try { return JSON.parse(m).length } catch { return 0 }
  }
  return 0
}

/** True if words_mastered has at least one entry (any storage format). */
export function hasWordsMastered(p: UserProgress | undefined): boolean {
  return wordsMasteredLength(p) > 0
}

/** Bar width: completed → 100%; else from mastered / wordGoal. */
export function familyProgressPct(
  p: UserProgress | undefined,
  completed: boolean,
  wordGoal: number
): number {
  if (completed || p?.completed) return 100
  const n = wordsMasteredLength(p)
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
