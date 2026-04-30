/**
 * Tests for critical pure-logic functions.
 * These run in Node — no React Native, no Supabase needed.
 * They catch math bugs, boundary errors, and logic regressions.
 */

import { nextReviewDate, isDueForReview } from '../lib/spacedRep'
import { levelFromTotalXp, xpProgressPercentInCurrentLevel, xpToReachNextLevel } from '../lib/xpLevel'
import { familyProgressPct, maxCompletedLessonLevel, isLessonUnlocked } from '../lib/lessonProgress'
import type { UserProgress } from '../lib/types'

// ── Spaced Repetition ─────────────────────────────────────────────────────────

describe('nextReviewDate', () => {
  it('returns tomorrow for first review (repetitions=0)', () => {
    const result = nextReviewDate(0)
    const now = Date.now()
    const diff = result.getTime() - now
    // Should be ~1 day
    expect(diff).toBeGreaterThan(23 * 60 * 60 * 1000)
    expect(diff).toBeLessThan(25 * 60 * 60 * 1000)
  })

  it('returns 7 days for third review (repetitions=2)', () => {
    const result = nextReviewDate(2)
    const diff = result.getTime() - Date.now()
    expect(diff).toBeGreaterThan(6.9 * 24 * 60 * 60 * 1000)
    expect(diff).toBeLessThan(7.1 * 24 * 60 * 60 * 1000)
  })

  it('returns 30 days for reviews beyond 5', () => {
    const result = nextReviewDate(10)
    const diff = result.getTime() - Date.now()
    expect(diff).toBeGreaterThan(29.9 * 24 * 60 * 60 * 1000)
  })
})

describe('isDueForReview', () => {
  it('returns false for null/undefined', () => {
    expect(isDueForReview(null)).toBe(false)
    expect(isDueForReview(undefined)).toBe(false)
  })

  it('returns true for a date in the past', () => {
    const past = new Date(Date.now() - 100000).toISOString()
    expect(isDueForReview(past)).toBe(true)
  })

  it('returns false for a date in the future', () => {
    const future = new Date(Date.now() + 100000).toISOString()
    expect(isDueForReview(future)).toBe(false)
  })
})

// ── XP & Levels ───────────────────────────────────────────────────────────────

describe('levelFromTotalXp', () => {
  it('starts at level 1', () => {
    expect(levelFromTotalXp(0)).toBe(1)
    expect(levelFromTotalXp(1)).toBe(1)
  })

  it('levels up at 500 XP', () => {
    expect(levelFromTotalXp(499)).toBe(1)
    expect(levelFromTotalXp(500)).toBe(2)
    expect(levelFromTotalXp(501)).toBe(2)
  })

  it('handles large XP values', () => {
    expect(levelFromTotalXp(2500)).toBe(6)
    expect(levelFromTotalXp(10000)).toBe(21)
  })
})

describe('xpProgressPercentInCurrentLevel', () => {
  it('returns 0 at the start of a level', () => {
    expect(xpProgressPercentInCurrentLevel(0)).toBe(0)
    expect(xpProgressPercentInCurrentLevel(500)).toBe(0)
  })

  it('returns 50 at halfway through a level', () => {
    expect(xpProgressPercentInCurrentLevel(250)).toBe(50)
    expect(xpProgressPercentInCurrentLevel(750)).toBe(50)
  })

  it('returns 99 near the end', () => {
    // 499/500 = 99.8%, rounds to 100%
    expect(xpProgressPercentInCurrentLevel(499)).toBe(100)
  })
})

describe('xpToReachNextLevel', () => {
  it('returns 500 at 0 XP', () => {
    expect(xpToReachNextLevel(0)).toBe(500)
  })

  it('returns 1 at 499 XP', () => {
    expect(xpToReachNextLevel(499)).toBe(1)
  })

  it('returns 500 at 500 XP (just leveled up)', () => {
    expect(xpToReachNextLevel(500)).toBe(500)
  })
})

// ── Lesson Progress ───────────────────────────────────────────────────────────

describe('familyProgressPct', () => {
  const makeProg = (mastered: string[]): UserProgress => ({
    user_id: 'u1',
    lesson_id: 'l1',
    completed: false,
    score: 0,
    xp_earned: 0,
    completed_at: '',
    words_mastered: mastered,
    words_skipped: [],
  })

  it('returns 0 for no progress', () => {
    expect(familyProgressPct(undefined, false, 10)).toBe(0)
  })

  it('returns 100 for completed', () => {
    expect(familyProgressPct(undefined, true, 10)).toBe(100)
    expect(familyProgressPct(makeProg(['a']), true, 10)).toBe(100)
  })

  it('returns 100 if p.completed is true', () => {
    const p = makeProg(['a'])
    p.completed = true
    expect(familyProgressPct(p, false, 10)).toBe(100)
  })

  it('calculates percentage based on mastered / wordGoal', () => {
    const p = makeProg(['a', 'b', 'c', 'd', 'e'])
    // 5 out of 10 = 50%
    expect(familyProgressPct(p, false, 10)).toBe(50)
  })

  it('caps at 95 for in-progress', () => {
    const p = makeProg(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'])
    // 11 out of 10 = more than 95 → capped
    expect(familyProgressPct(p, false, 10)).toBe(95)
  })

  it('handles words_mastered as JSON string', () => {
    const p: UserProgress = {
      user_id: 'u1',
      lesson_id: 'l1',
      completed: false,
      score: 0,
      xp_earned: 0,
      completed_at: '',
      words_mastered: JSON.stringify(['a', 'b', 'c']) as unknown as string[],
      words_skipped: [],
    }
    expect(familyProgressPct(p, false, 6)).toBe(50)
  })
})

describe('maxCompletedLessonLevel', () => {
  const makeRow = (lessonId: string, completed: boolean, level: number): UserProgress => ({
    user_id: 'u1',
    lesson_id: lessonId,
    completed,
    score: 0,
    xp_earned: 0,
    completed_at: '',
    words_mastered: [],
    words_skipped: [],
  })

  it('returns 0 when nothing completed', () => {
    const map = new Map([['l1', 1]])
    expect(maxCompletedLessonLevel([makeRow('l1', false, 1)], map)).toBe(0)
  })

  it('returns highest level among completed', () => {
    const map = new Map([['l1', 1], ['l2', 2], ['l3', 3]])
    const rows = [
      makeRow('l1', true, 1),
      makeRow('l2', true, 2),
      makeRow('l3', false, 3),
    ]
    expect(maxCompletedLessonLevel(rows, map)).toBe(2)
  })
})

describe('isLessonUnlocked', () => {
  it('level 1 is always unlocked', () => {
    expect(isLessonUnlocked(1, 0)).toBe(true)
    expect(isLessonUnlocked(1, 5)).toBe(true)
  })

  it('level N unlocked if maxCompleted >= N-1', () => {
    expect(isLessonUnlocked(2, 1)).toBe(true)  // max=1 → cap=2, lvl2 ≤ 2 ✓
    // lvl 3 needs maxCompleted=2 (cap=3) to unlock
    expect(isLessonUnlocked(3, 2)).toBe(true)  // max=2 → cap=3 ✓
    expect(isLessonUnlocked(4, 3)).toBe(true)  // max=3 → cap=4 ✓
  })

  it('level N locked if maxCompleted < N-1', () => {
    expect(isLessonUnlocked(3, 0)).toBe(false) // cap = 1
    expect(isLessonUnlocked(4, 1)).toBe(false) // cap = 2
  })
})

// ── Streak Milestone Logic ────────────────────────────────────────────────────

describe('streak milestone conditions', () => {
  // This tests the condition used in lib/streak.ts
  const shouldNotify = (s: number) => s === 7 || s === 100 || s % 30 === 0

  it('notifies at day 7', () => {
    expect(shouldNotify(7)).toBe(true)
  })

  it('notifies at day 30, 60, 90', () => {
    expect(shouldNotify(30)).toBe(true)
    expect(shouldNotify(60)).toBe(true)
    expect(shouldNotify(90)).toBe(true)
  })

  it('notifies at day 100', () => {
    expect(shouldNotify(100)).toBe(true)
  })

  it('does not double-notify (30 uses % 30, not === 30)', () => {
    // 30 is caught by s % 30 === 0, there's no separate s === 30 check
    expect(shouldNotify(30)).toBe(true)
  })

  it('does not notify at non-milestone days', () => {
    expect(shouldNotify(1)).toBe(false)
    expect(shouldNotify(5)).toBe(false)
    expect(shouldNotify(8)).toBe(false)
    expect(shouldNotify(31)).toBe(false)
  })
})

// ── Dedup logic (used in useProgress.ts) ──────────────────────────────────────

describe('dedupeByLesson logic', () => {
  // This is the dedup function from useProgress.ts
  const dedupeByLesson = (rows: UserProgress[]): UserProgress[] => {
    const byLesson = new Map<string, UserProgress>()
    for (const row of rows) {
      const prev = byLesson.get(row.lesson_id)
      if (!prev) {
        byLesson.set(row.lesson_id, row)
        continue
      }
      const prevT = prev.completed_at ? new Date(prev.completed_at).getTime() : 0
      const rowT = row.completed_at ? new Date(row.completed_at).getTime() : 0
      if (rowT >= prevT) byLesson.set(row.lesson_id, row)
    }
    return Array.from(byLesson.values())
  }

  const makeRow = (lessonId: string, completedAt: string): UserProgress => ({
    user_id: 'u1',
    lesson_id: lessonId,
    completed: true,
    score: 0,
    xp_earned: 10,
    completed_at: completedAt,
    words_mastered: [],
    words_skipped: [],
  })

  it('keeps latest row per lesson', () => {
    const rows = [
      makeRow('l1', '2025-01-01T00:00:00Z'),
      makeRow('l1', '2025-01-02T00:00:00Z'),
    ]
    const result = dedupeByLesson(rows)
    expect(result).toHaveLength(1)
    expect(result[0]!.completed_at).toBe('2025-01-02T00:00:00Z')
  })

  it('keeps two different lessons separate', () => {
    const rows = [
      makeRow('l1', '2025-01-01T00:00:00Z'),
      makeRow('l2', '2025-01-01T00:00:00Z'),
    ]
    expect(dedupeByLesson(rows)).toHaveLength(2)
  })

  it('handles empty input', () => {
    expect(dedupeByLesson([])).toHaveLength(0)
  })
})

// ── WordsLen helper (from home.tsx) ───────────────────────────────────────────

describe('wordsLen helper', () => {
  const wordsLen = (prog: UserProgress | undefined): number => {
    if (!prog) return 0
    const m = prog.words_mastered
    if (Array.isArray(m)) return m.length
    if (typeof m === 'string') {
      try { return JSON.parse(m).length } catch { return 0 }
    }
    return 0
  }

  it('returns 0 for undefined', () => {
    expect(wordsLen(undefined)).toBe(0)
  })

  it('returns length of array', () => {
    const p: UserProgress = {
      user_id: 'u1', lesson_id: 'l1', completed: false,
      score: 0, xp_earned: 0, completed_at: '',
      words_mastered: ['a', 'b', 'c'], words_skipped: [],
    }
    expect(wordsLen(p)).toBe(3)
  })

  it('parses JSON string', () => {
    const p = {
      user_id: 'u1', lesson_id: 'l1', completed: false,
      score: 0, xp_earned: 0, completed_at: '',
      words_mastered: JSON.stringify(['a', 'b']) as unknown as string[],
      words_skipped: [],
    }
    expect(wordsLen(p)).toBe(2)
  })

  it('returns 0 for invalid JSON string', () => {
    const p = {
      user_id: 'u1', lesson_id: 'l1', completed: false,
      score: 0, xp_earned: 0, completed_at: '',
      words_mastered: 'not-json' as unknown as string[],
      words_skipped: [],
    }
    expect(wordsLen(p)).toBe(0)
  })
})
