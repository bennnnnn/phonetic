import { create } from 'zustand'

export type OnboardingDailyGoal = 1 | 2 | 3 | 5

type OnboardingStore = {
  displayName: string
  dailyGoal: OnboardingDailyGoal
  setDisplayName: (v: string) => void
  setDailyGoal: (v: OnboardingDailyGoal) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  displayName: '',
  dailyGoal: 2,
  setDisplayName: (v) => set({ displayName: v }),
  setDailyGoal: (v) => set({ dailyGoal: v }),
  reset: () => set({ displayName: '', dailyGoal: 2 }),
}))

export function goalLabel(lessons: OnboardingDailyGoal): string {
  const map: Record<OnboardingDailyGoal, string> = {
    1: 'Casual · 1 lesson a day',
    2: 'Regular · 2 lessons a day',
    3: 'Serious · 3 lessons a day',
    5: 'Intense · 5 lessons a day',
  }
  return map[lessons]
}
