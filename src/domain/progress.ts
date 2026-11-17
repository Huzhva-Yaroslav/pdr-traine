import { leitnerIntervalsMs, masteryStreak } from './examConfig'
import { contentHash } from './hash'
import type { Question, UserProgress } from './types'

export function applyProgress(
  previous: UserProgress | undefined,
  question: Question,
  correct: boolean,
  now: Date,
): UserProgress {
  const hash = contentHash(question)
  const seenAt = now.toISOString()
  if (!correct) {
    return {
      questionId: question.id,
      status: 'mistake',
      correctStreak: 0,
      lastSeenAt: seenAt,
      contentHash: hash,
    }
  }

  const restart = !previous || previous.status === 'new' || previous.status === 'mistake'
  const streak = restart ? 1 : previous.correctStreak + 1
  const status = streak >= masteryStreak ? 'mastered' : 'learning'
  const delay = status === 'mastered' ? leitnerIntervalsMs.mastered : leitnerIntervalsMs.learning
  return {
    questionId: question.id,
    status,
    correctStreak: streak,
    lastSeenAt: seenAt,
    nextReviewAt: new Date(now.getTime() + delay).toISOString(),
    contentHash: hash,
  }
}

export function reconcileProgress(
  questions: Question[],
  rows: UserProgress[],
): UserProgress[] {
  const hashes = new Map(questions.map((question) => [question.id, contentHash(question)]))
  return rows.flatMap((row) => {
    const hash = hashes.get(row.questionId)
    if (!hash) {
      return [{ ...row, orphaned: true }]
    }
    if (row.contentHash && row.contentHash !== hash) {
      return [
        {
          questionId: row.questionId,
          status: 'new' as const,
          correctStreak: 0,
          contentHash: hash,
        },
      ]
    }
    const next: UserProgress = { ...row, contentHash: hash }
    if (row.orphaned) {
      next.orphaned = false
    }
    return [next]
  })
}
