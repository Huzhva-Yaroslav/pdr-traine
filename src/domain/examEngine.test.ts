import { describe, expect, it } from 'vitest'

import { defaultExamConfig } from './examConfig'
import {
  examPassed,
  mistakeCount,
  reduceExam,
  remainingMs,
  startExam,
} from './examEngine'

const now = new Date('2026-01-01T00:00:00.000Z')
const ids = Array.from({ length: 20 }, (_, index) => `q${index + 1}`)

function exam() {
  return startExam({
    id: 'attempt-1',
    questionIds: ids,
    category: 'B',
    now,
    config: defaultExamConfig,
  })
}

function answerAt(state: ReturnType<typeof exam>, questionId: string, correct: boolean, at: Date) {
  return reduceExam(
    state,
    { type: 'Answer', questionId, answerId: `${questionId}-a`, correct },
    at,
  )
}

describe('exam engine', () => {
  it('starts an in-progress attempt from the provided question ids', () => {
    const state = exam()
    expect(state.phase).toBe('inProgress')
    expect(state.slots).toHaveLength(20)
    expect(state.slots.every((slot) => slot.status === 'unanswered')).toBe(true)
  })

  it('keeps the attempt open after exactly two mistakes', () => {
    let state = exam()
    state = answerAt(state, 'q1', false, now)
    state = answerAt(state, 'q2', false, now)
    expect(mistakeCount(state.slots)).toBe(2)
    expect(state.phase).toBe('inProgress')
  })

  it('fails the attempt on the third mistake', () => {
    let state = exam()
    state = answerAt(state, 'q1', false, now)
    state = answerAt(state, 'q2', false, now)
    state = answerAt(state, 'q3', false, now)
    expect(state.phase).toBe('failed')
    expect(examPassed(state)).toBe(false)
    const after = answerAt(state, 'q4', true, now)
    expect(after.slots.find((slot) => slot.questionId === 'q4')?.status).toBe('unanswered')
  })

  it('ignores a second answer to the same question', () => {
    const once = answerAt(exam(), 'q1', false, now)
    const twice = answerAt(once, 'q1', true, now)
    expect(twice.slots[0]?.correct).toBe(false)
    expect(mistakeCount(twice.slots)).toBe(1)
  })

  it('ignores an unknown question id', () => {
    const state = answerAt(exam(), 'missing', true, now)
    expect(state.slots.every((slot) => slot.status === 'unanswered')).toBe(true)
  })

  it('lets the candidate skip and return to an open question', () => {
    const skipped = reduceExam(exam(), { type: 'Skip', questionId: 'q1' }, now)
    expect(skipped.slots[0]?.status).toBe('skipped')
    expect(skipped.index).toBe(1)
    const back = reduceExam(skipped, { type: 'GoTo', index: 0 }, now)
    const answered = answerAt(back, 'q1', true, now)
    expect(answered.slots[0]?.status).toBe('answered')
  })

  it('does not change an answered question when visiting it again', () => {
    const answered = answerAt(exam(), 'q1', true, now)
    const viewed = reduceExam(answered, { type: 'GoTo', index: 0 }, now)
    expect(viewed.index).toBe(0)
    expect(viewed.slots[0]?.correct).toBe(true)
  })

  it('times out from the start timestamp even if ticks were missed', () => {
    const later = new Date(now.getTime() + defaultExamConfig.timeLimitMs)
    const state = reduceExam(exam(), { type: 'Tick' }, later)
    expect(state.phase).toBe('timedOut')
    expect(remainingMs(exam(), later)).toBe(0)
    const ignored = answerAt(state, 'q1', true, later)
    expect(ignored.phase).toBe('timedOut')
    expect(ignored.slots[0]?.status).toBe('unanswered')
  })

  it('passes only when every question is answered within the mistake limit', () => {
    let state = exam()
    for (const id of ids) {
      state = answerAt(state, id, true, now)
    }
    expect(state.phase).toBe('finished')
    expect(examPassed(state)).toBe(true)
  })

  it('rejects a finish while questions are still open', () => {
    const state = reduceExam(exam(), { type: 'Finish' }, now)
    expect(state.phase).toBe('failed')
    expect(examPassed(state)).toBe(false)
  })

  it('ignores a goto outside the ticket', () => {
    const state = reduceExam(exam(), { type: 'GoTo', index: 40 }, now)
    expect(state.index).toBe(0)
  })
})
