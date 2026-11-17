import type { Question } from './types'

export function gradeAnswer(question: Question, answerId: string): boolean {
  return question.correctAnswerId === answerId
}
