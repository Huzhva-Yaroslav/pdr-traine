import { describe, expect, it } from 'vitest'

import { gradeAnswer } from './grading'
import { contentHash } from './hash'
import { applyProgress, reconcileProgress } from './progress'
import {
  NotEnoughQuestionsError,
  buildExamQuestions,
  selectDue,
  selectMistakes,
  selectRandom,
} from './selection'
import type { Question } from './types'

const now = new Date('2026-01-01T00:00:00.000Z')

function question(id: string, correct = 'a'): Question {
  return {
    id,
    ticketId: 't1',
    topicId: 'speed',
    categories: ['B'],
    text: `Питання ${id}`,
    answers: [
      { id: 'a', text: 'так' },
      { id: 'b', text: 'ні' },
    ],
    correctAnswerId: correct,
  }
}

describe('progress and selection', () => {
  it('grades only the configured correct answer', () => {
    expect(gradeAnswer(question('q1'), 'a')).toBe(true)
    expect(gradeAnswer(question('q1'), 'b')).toBe(false)
  })

  it('moves a new question through learning to mastered', () => {
    const first = applyProgress(undefined, question('q1'), true, now)
    expect(first.status).toBe('learning')
    expect(first.correctStreak).toBe(1)
    const second = applyProgress(first, question('q1'), true, now)
    const third = applyProgress(second, question('q1'), true, now)
    expect(third.status).toBe('mastered')
    expect(third.correctStreak).toBe(3)
  })

  it('resets the streak after a wrong answer', () => {
    const learned = applyProgress(undefined, question('q1'), true, now)
    const missed = applyProgress(learned, question('q1'), false, now)
    expect(missed.status).toBe('mistake')
    expect(missed.correctStreak).toBe(0)
    const again = applyProgress(missed, question('q1'), true, now)
    expect(again.status).toBe('learning')
    expect(again.correctStreak).toBe(1)
  })

  it('selects only current mistakes and due questions', () => {
    const questions = [question('q1'), question('q2'), question('q3')]
    const progress = [
      applyProgress(undefined, questions[0]!, false, now),
      applyProgress(undefined, questions[1]!, true, now),
    ]
    expect(selectMistakes(questions, progress).map((item) => item.id)).toEqual(['q1'])
    const due = selectDue(
      questions,
      progress.map((row) =>
        row.questionId === 'q2' ? { ...row, nextReviewAt: now.toISOString() } : row,
      ),
      now,
    )
    expect(due.map((item) => item.id)).toEqual(['q2'])
  })

  it('does not repeat questions inside one random draw', () => {
    const questions = [question('q1'), question('q2'), question('q3')]
    let cursor = 0
    const picked = selectRandom(questions, 3, () => {
      cursor += 1
      return cursor % 2 === 0 ? 0.9 : 0
    })
    expect(new Set(picked.map((item) => item.id)).size).toBe(3)
  })

  it('refuses to start an exam when the category is short', () => {
    expect(() => buildExamQuestions([question('q1')], 'B', 20, () => 0)).toThrow(
      NotEnoughQuestionsError,
    )
  })

  it('resets progress when the question content changes and hides deleted questions', () => {
    const original = question('q1')
    const saved = applyProgress(undefined, original, true, now)
    const edited = { ...original, text: 'Нове формулювання' }
    const [reset, orphan] = reconcileProgress(
      [edited],
      [saved, { questionId: 'gone', status: 'mastered', correctStreak: 4 }],
    )
    expect(reset?.status).toBe('new')
    expect(reset?.contentHash).toBe(contentHash(edited))
    expect(orphan?.orphaned).toBe(true)
  })
})
