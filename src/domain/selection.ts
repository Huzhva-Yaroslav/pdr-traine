import type { Question, Rng, UserProgress } from './types'

export function selectByTicket(questions: Question[], ticketId: string): Question[] {
  return questions.filter((question) => question.ticketId === ticketId)
}

export function selectByTopic(questions: Question[], topicId: string): Question[] {
  return questions.filter((question) => question.topicId === topicId)
}

export function selectMistakes(questions: Question[], progress: UserProgress[]): Question[] {
  const mistakeIds = new Set(
    progress
      .filter((row) => row.status === 'mistake' && row.orphaned !== true)
      .map((row) => row.questionId),
  )
  return questions.filter((question) => mistakeIds.has(question.id))
}

export function selectDue(
  questions: Question[],
  progress: UserProgress[],
  now: Date,
): Question[] {
  const dueIds = new Set(
    progress
      .filter((row) => {
        if (row.orphaned === true || !row.nextReviewAt) return false
        return Date.parse(row.nextReviewAt) <= now.getTime()
      })
      .map((row) => row.questionId),
  )
  return questions.filter((question) => dueIds.has(question.id))
}

export function selectRandom(questions: Question[], count: number, rng: Rng): Question[] {
  const pool = [...questions]
  const picked: Question[] = []
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(rng() * pool.length)
    const [question] = pool.splice(index, 1)
    if (question) picked.push(question)
  }
  return picked
}

export function shuffleAnswers(question: Question, rng: Rng): Question {
  const answers = [...question.answers]
  for (let index = answers.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1))
    const current = answers[index]
    const next = answers[swapIndex]
    if (!current || !next) continue
    answers[index] = next
    answers[swapIndex] = current
  }
  return { ...question, answers }
}

export class NotEnoughQuestionsError extends Error {
  constructor() {
    super('NOT_ENOUGH_QUESTIONS')
    this.name = 'NotEnoughQuestionsError'
  }
}

export function buildExamQuestions(
  questions: Question[],
  category: string,
  count: number,
  rng: Rng,
): Question[] {
  const pool = questions.filter((question) => question.categories.includes(category))
  if (pool.length < count) {
    throw new NotEnoughQuestionsError()
  }
  return selectRandom(pool, count, rng)
}
