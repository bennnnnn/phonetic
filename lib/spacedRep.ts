/**
 * Spaced repetition schedule for word review.
 *
 * Uses a simple expanding-interval model:
 *   Review 1: next day
 *   Review 2: 3 days
 *   Review 3: 7 days
 *   Review 4: 14 days
 *   Review 5+: 30 days
 *
 * Intervals grow per word mastered count, so frequently-encountered
 * words get longer gaps.
 */

/** Get the next review date based on how many times a word/group has been reviewed. */
export function nextReviewDate(repetitions: number): Date {
  const now = Date.now()
  const intervals = [1, 3, 7, 14, 30] // days — index 0 = first review
  const idx = Math.min(repetitions, intervals.length - 1)
  const days = intervals[idx]!
  const ms = days * 24 * 60 * 60 * 1000
  return new Date(now + ms)
}

/** Return true if the item is due for review (next_review_at is in the past or null). */
export function isDueForReview(nextReviewAt: string | Date | null | undefined): boolean {
  if (!nextReviewAt) return false // never reviewed? not "due" — treat as new
  return new Date(nextReviewAt).getTime() <= Date.now()
}
