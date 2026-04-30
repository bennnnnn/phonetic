import { create } from 'zustand'

type LessonStore = {
  lessonId: string | null
  wordsMastered: string[]
  wordsSkipped: string[]
  quizScore: number
  quizTotal: number
  groupNeedsRefresh: boolean
  completedGroups: string[]
  startLesson: (lessonId: string) => void
  masterWord: (wordId: string) => void
  skipWord: (wordId: string) => void
  setQuizResult: (score: number, total: number) => void
  addCompletedGroup: (groupId: string) => void
  flagGroupRefresh: () => void
  resetLesson: () => void
}

export const useLessonStore = create<LessonStore>((set) => ({
  lessonId: null,
  wordsMastered: [],
  wordsSkipped: [],
  quizScore: 0,
  quizTotal: 0,
  groupNeedsRefresh: false,
  completedGroups: [],
  startLesson: (lessonId) => set({ lessonId, wordsMastered: [], wordsSkipped: [], quizScore: 0, quizTotal: 0 }),
  masterWord: (wordId) => set((s) => ({ wordsMastered: [...s.wordsMastered, wordId] })),
  skipWord: (wordId) => set((s) => ({ wordsSkipped: [...s.wordsSkipped, wordId] })),
  setQuizResult: (score, total) => set({ quizScore: score, quizTotal: total }),
  addCompletedGroup: (groupId) => set((s) => ({ completedGroups: [...s.completedGroups, groupId] })),
  flagGroupRefresh: () => set({ groupNeedsRefresh: true }),
  resetLesson: () => set({ lessonId: null, wordsMastered: [], wordsSkipped: [], quizScore: 0, quizTotal: 0, groupNeedsRefresh: false }),
}))
