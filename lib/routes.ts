export const ROUTES = {
  HOME: '/(tabs)/home',
  PROGRESS: '/(tabs)/progress',
  LEAGUES: '/(tabs)/leagues',
  PROFILE: '/(tabs)/profile',
  LESSON: (id: string) => `/lesson/${id}`,
  SENTENCES: (id: string) => `/sentences/${id}`,
  QUIZ: (id: string) => `/quiz/${id}`,
  COMPLETE: (id: string) => `/complete/${id}`,
  LOGIN: '/(auth)/login',
  SIGNUP: '/(auth)/signup',
  ONBOARDING: '/(auth)/onboarding',
}
