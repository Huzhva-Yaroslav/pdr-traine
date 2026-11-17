import type { ExamConfig } from './types'

export const defaultExamConfig: ExamConfig = {
  questionCount: 20,
  timeLimitMs: 20 * 60 * 1000,
  maxMistakes: 2,
  failFastOnMistakeLimit: true,
  allowSkip: true,
  allowReturnToOpen: true,
  revealVerdictImmediately: true,
  lockAnswerAfterVerdict: true,
  minAnswers: 2,
  maxAnswers: 5,
}

export const masteryStreak = 3
export const trainingSessionSize = 10

export const leitnerIntervalsMs = {
  learning: 24 * 60 * 60 * 1000,
  mastered: 7 * 24 * 60 * 60 * 1000,
} as const
