import { defaultExamConfig } from './examConfig'
import type { Manifest, Question, Topic } from './types'

export class BankValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BankValidationError'
  }
}

export function validateBank(questions: Question[], topics: Topic[], manifest: Manifest): void {
  if (manifest.questionCount !== questions.length) {
    throw new BankValidationError('QUESTION_COUNT')
  }
  if (manifest.topicCount !== topics.length) {
    throw new BankValidationError('TOPIC_COUNT')
  }
  const topicIds = new Set(topics.map((topic) => topic.id))
  const seen = new Set<string>()
  const texts = new Set<string>()
  for (const question of questions) {
    if (seen.has(question.id)) throw new BankValidationError('DUPLICATE_ID')
    seen.add(question.id)
    if (texts.has(question.text)) throw new BankValidationError('DUPLICATE_TEXT')
    texts.add(question.text)
    if (!topicIds.has(question.topicId)) throw new BankValidationError('UNKNOWN_TOPIC')
    if (
      question.answers.length < defaultExamConfig.minAnswers ||
      question.answers.length > defaultExamConfig.maxAnswers
    ) {
      throw new BankValidationError('ANSWER_COUNT')
    }
    const correct = question.answers.filter((answer) => answer.id === question.correctAnswerId)
    if (correct.length !== 1) throw new BankValidationError('CORRECT_ANSWER')
    if (question.text.trim() === '' || question.answers.some((answer) => answer.text.trim() === '')) {
      throw new BankValidationError('EMPTY_TEXT')
    }
  }
}
