import type { UserProgress } from '../lib/types'
import { countCompletedLessonsRolling7Days, countCompletedLessonsTotal } from '../lib/lessonRollingStats'

const base = (overrides: Partial<UserProgress>): UserProgress => ({
  user_id: 'u',
  lesson_id: 'l',
  completed: true,
  score: 90,
  xp_earned: 10,
  completed_at: new Date().toISOString(),
  words_mastered: [],
  words_skipped: [],
  ...overrides,
})

describe('lessonRollingStats', () => {
  beforeAll(() => jest.useFakeTimers())
  afterAll(() => jest.useRealTimers())

  it('countCompletedLessonsTotal counts completed rows', () => {
    const p: UserProgress[] = [
      base({ lesson_id: 'a', completed: true }),
      base({ lesson_id: 'b', completed: false }),
    ]
    expect(countCompletedLessonsTotal(p)).toBe(1)
  })

  it('rolling 7-day includes recent completed_at only', () => {
    const now = new Date('2026-06-01T12:00:00.000Z')
    jest.setSystemTime(now)

    const old = base({
      lesson_id: 'old',
      completed_at: new Date('2026-05-01T12:00:00.000Z').toISOString(),
    })
    const recent = base({
      lesson_id: 'recent',
      completed_at: new Date('2026-05-31T12:00:00.000Z').toISOString(),
    })

    expect(countCompletedLessonsRolling7Days([old, recent])).toBe(1)
  })

  it('excludes rows with null completed_at', () => {
    const row = base({ lesson_id: 'null-date', completed_at: null as unknown as string })
    expect(countCompletedLessonsRolling7Days([row])).toBe(0)
  })

  it('excludes rows with invalid date strings', () => {
    const row = base({ lesson_id: 'bad-date', completed_at: 'not-a-date' })
    expect(countCompletedLessonsRolling7Days([row])).toBe(0)
  })

  it('includes a lesson completed exactly at the 7-day boundary', () => {
    const now = new Date('2026-06-01T12:00:00.000Z')
    jest.setSystemTime(now)
    const boundary = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const row = base({ lesson_id: 'boundary', completed_at: boundary.toISOString() })
    expect(countCompletedLessonsRolling7Days([row])).toBe(1)
  })

  it('excludes a lesson completed one millisecond before the 7-day boundary', () => {
    const now = new Date('2026-06-01T12:00:00.000Z')
    jest.setSystemTime(now)
    const justOver = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 - 1)
    const row = base({ lesson_id: 'just-over', completed_at: justOver.toISOString() })
    expect(countCompletedLessonsRolling7Days([row])).toBe(0)
  })

  it('excludes incomplete rows regardless of completed_at', () => {
    const row = base({ lesson_id: 'incomplete', completed: false, completed_at: new Date().toISOString() })
    expect(countCompletedLessonsRolling7Days([row])).toBe(0)
    expect(countCompletedLessonsTotal([row])).toBe(0)
  })

  it('handles an empty array', () => {
    expect(countCompletedLessonsRolling7Days([])).toBe(0)
    expect(countCompletedLessonsTotal([])).toBe(0)
  })
})
