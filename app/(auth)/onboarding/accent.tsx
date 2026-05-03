import { useState } from 'react'
import { router } from 'expo-router'
import { QuestionScreen, QuestionOption } from '@/components/onboarding/QuestionScreen'
import { useSettingsStore } from '@/store/settingsStore'

const OPTIONS: QuestionOption[] = [
  {
    id: 'american',
    emoji: '🇺🇸',
    label: 'American English',
    sublabel: 'General American — rhotic, flat vowels',
  },
  {
    id: 'british',
    emoji: '🇬🇧',
    label: 'British English',
    sublabel: 'Received Pronunciation — non-rhotic, crisp consonants',
  },
]

export default function OnboardingAccent() {
  const setAccent = useSettingsStore((s) => s.setAccent)

  // Pre-select american as the default (matches store default)
  const [selected, setSelected] = useState<string>('american')

  function handleContinue() {
    setAccent(selected as 'american' | 'british')
    router.push('/(auth)/onboarding/contacts-permission')
  }

  return (
    <QuestionScreen
      progress={3 / 4}
      illustration=""
      question="Which English accent do you prefer?"
      options={OPTIONS}
      selected={selected}
      onSelect={setSelected}
      onContinue={handleContinue}
      onBack={() => router.back()}
      continueLabel="LOOKS GOOD →"
    />
  )
}
