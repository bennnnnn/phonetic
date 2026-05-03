import { useState } from 'react'
import { router } from 'expo-router'
import { QuestionScreen, QuestionOption } from '@/components/onboarding/QuestionScreen'
import { useSettingsStore } from '@/store/settingsStore'

const OPTIONS: QuestionOption[] = [
  { id: '5',  emoji: '🌱', label: '5 minutes a day',  sublabel: 'Casual · just getting started'   },
  { id: '10', emoji: '⚡', label: '10 minutes a day', sublabel: 'Regular · build a solid habit'    },
  { id: '15', emoji: '🔥', label: '15 minutes a day', sublabel: 'Serious · see real progress fast' },
  { id: '25', emoji: '🚀', label: '25 minutes a day', sublabel: 'Intense · go all in'              },
]

export default function OnboardingGoal() {
  const [selected, setSelected] = useState<string | null>(null)
  const setDailyGoalMinutes = useSettingsStore((s) => s.setDailyGoalMinutes)

  function handleContinue() {
    if (selected) {
      setDailyGoalMinutes(parseInt(selected, 10) as 5 | 10 | 15 | 25)
    }
    router.push('/(auth)/onboarding/language')
  }

  return (
    <QuestionScreen
      progress={1 / 4}
      question="How much time can you practice each day?"
      options={OPTIONS}
      selected={selected}
      onSelect={setSelected}
      onContinue={handleContinue}
      onBack={() => router.back()}
    />
  )
}
