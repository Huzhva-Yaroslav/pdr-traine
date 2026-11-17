export type Answer = {
  id: string
  text: string
}

export type Question = {
  id: string
  ticketId: string
  topicId: string
  categories: string[]
  text: string
  answers: Answer[]
  correctAnswerId: string
  images?: string[]
  explanation?: string
  rulesRef?: string
}

export type Topic = {
  id: string
  title: string
  order: number
}

export type ProgressStatus = 'new' | 'learning' | 'mistake' | 'mastered'

export type UserProgress = {
  questionId: string
  status: ProgressStatus
  correctStreak: number
  lastSeenAt?: string
  nextReviewAt?: string
  orphaned?: boolean
  contentHash?: string
}

export type SlotStatus = 'unanswered' | 'skipped' | 'answered'

export type ExamSlot = {
  questionId: string
  answerId: string | null
  status: SlotStatus
  correct: boolean | null
  answeredAt: string | null
}

export type ExamPhase = 'inProgress' | 'finished' | 'timedOut' | 'failed'

export type ExamConfig = {
  questionCount: number
  timeLimitMs: number
  maxMistakes: number
  failFastOnMistakeLimit: boolean
  allowSkip: boolean
  allowReturnToOpen: boolean
  revealVerdictImmediately: boolean
  lockAnswerAfterVerdict: boolean
  minAnswers: number
  maxAnswers: number
}

export type ExamState = {
  id: string
  phase: ExamPhase
  category: string
  questionIds: string[]
  index: number
  slots: ExamSlot[]
  startedAt: string
  finishedAt: string | null
  config: ExamConfig
}

export type ExamEvent =
  | { type: 'Answer'; questionId: string; answerId: string; correct: boolean }
  | { type: 'Skip'; questionId: string }
  | { type: 'GoTo'; index: number }
  | { type: 'Tick' }
  | { type: 'Finish' }

export type ManifestDiff = {
  previousVersion: number
  addedQuestionIds: string[]
  removedQuestionIds: string[]
  changedQuestionIds: string[]
}

export type Manifest = {
  version: number
  generatedAt: string
  questionCount: number
  topicCount: number
  checksums: Record<string, string>
  diff?: ManifestDiff
}

export type Rng = () => number
