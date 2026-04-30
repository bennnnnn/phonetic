import { useState, useEffect, useCallback, useRef } from 'react'
import { haptics } from '@/lib/haptics'
import { soundEngine } from '@/lib/sounds'
import type { Word } from '@/lib/types'

export const QUIZ_COUNT = 6
export const CORRECT_DELAY = 1200
export const WRONG_RESET_DELAY = 800

export type OptionState = 'idle' | 'correct' | 'wrong'
export type CardFeedback = 'neutral' | 'correct' | 'wrong'

export type Question = {
  word: Word
  options: Word[]
  correctId: string
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function buildQuestions(words: Word[]): Question[] {
  const pool = shuffle(words).slice(0, Math.min(QUIZ_COUNT, words.length))
  return pool.map((word) => {
    const distractors = shuffle(words.filter((w) => w.id !== word.id)).slice(0, 3)
    const options = shuffle([word, ...distractors])
    return { word, options, correctId: word.id }
  })
}

export function getOptionState(
  wordId: string,
  correctId: string,
  answered: boolean,
  selectedId: string | null,
): OptionState {
  if (!answered) return 'idle'
  if (wordId === selectedId) return wordId === correctId ? 'correct' : 'wrong'
  return 'idle'
}

export function useQuizLogic(words: Word[], onComplete?: (score: number, total: number) => void) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  scoreRef.current = score

  const [answered, setAnswered] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [cardFeedback, setCardFeedback] = useState<CardFeedback>('neutral')

  const questionsLenRef = useRef(0)
  questionsLenRef.current = questions.length

  useEffect(() => {
    if (words.length >= 2) setQuestions(buildQuestions(words))
  }, [words])

  const advanceToNext = useCallback(() => {
    const len = questionsLenRef.current
    setCardFeedback('neutral')
    setCurrentQ((q) => {
      if (q + 1 >= len) return q
      setAnswered(false)
      setSelectedId(null)
      return q + 1
    })
  }, [])

  const handleAnswer = useCallback((wordId: string) => {
    if (answered || !questions[currentQ]) return
    setAnswered(true)
    setSelectedId(wordId)
    const correct = wordId === questions[currentQ].correctId
    setCardFeedback(correct ? 'correct' : 'wrong')

    if (correct) {
      haptics.success()
      soundEngine.play('correct')
      const newScore = score + 1
      setScore(newScore)
      const isLast = currentQ >= questions.length - 1
      if (isLast) {
        setTimeout(() => {
          setDone(true)
          onComplete?.(newScore, questions.length)
        }, CORRECT_DELAY)
      } else {
        setTimeout(advanceToNext, CORRECT_DELAY)
      }
    } else {
      haptics.error()
      soundEngine.play('wrong', 0.6)
      // Reset after a brief pause so user can try again
      setTimeout(() => {
        setAnswered(false)
        setSelectedId(null)
        setCardFeedback('neutral')
      }, WRONG_RESET_DELAY)
    }
    return correct
  }, [answered, currentQ, questions, advanceToNext])

  const reset = useCallback(() => {
    setCurrentQ(0)
    setScore(0)
    setAnswered(false)
    setSelectedId(null)
    setDone(false)
    setCardFeedback('neutral')
  }, [])

  return {
    questions,
    question: questions[currentQ],
    currentQ,
    score,
    scoreRef,
    done,
    answered,
    selectedId,
    cardFeedback,
    handleAnswer,
    advanceToNext,
    reset,
    loading: questions.length === 0,
  }
}
