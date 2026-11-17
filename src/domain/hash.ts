import type { Question } from './types'

export function contentHash(question: Question): string {
  const payload = [
    question.text,
    ...question.answers.map((answer) => `${answer.id}:${answer.text}`),
    question.correctAnswerId,
  ].join('|')
  let hash = 5381
  for (let index = 0; index < payload.length; index += 1) {
    hash = (hash * 33) ^ payload.charCodeAt(index)
  }
  return (hash >>> 0).toString(16)
}
