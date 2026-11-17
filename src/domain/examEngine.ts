import type { ExamConfig, ExamEvent, ExamSlot, ExamState } from './types'

export function startExam(input: {
  id: string
  questionIds: string[]
  category: string
  now: Date
  config: ExamConfig
}): ExamState {
  return {
    id: input.id,
    phase: 'inProgress',
    category: input.category,
    questionIds: [...input.questionIds],
    index: 0,
    slots: input.questionIds.map((questionId) => ({
      questionId,
      answerId: null,
      status: 'unanswered',
      correct: null,
      answeredAt: null,
    })),
    startedAt: input.now.toISOString(),
    finishedAt: null,
    config: input.config,
  }
}

export function remainingMs(state: ExamState, now: Date): number {
  return state.config.timeLimitMs - (now.getTime() - Date.parse(state.startedAt))
}

export function mistakeCount(slots: ExamSlot[]): number {
  return slots.filter((slot) => slot.correct === false).length
}

export function correctCount(slots: ExamSlot[]): number {
  return slots.filter((slot) => slot.correct === true).length
}

export function examPassed(state: ExamState): boolean {
  return (
    state.phase === 'finished' &&
    mistakeCount(state.slots) <= state.config.maxMistakes &&
    state.slots.every((slot) => slot.status === 'answered')
  )
}

export function reduceExam(state: ExamState, event: ExamEvent, now: Date): ExamState {
  if (event.type !== 'Tick' && state.phase !== 'inProgress') return state
  if (state.phase === 'inProgress' && remainingMs(state, now) <= 0) {
    return finish(state, 'timedOut', now)
  }
  if (state.phase !== 'inProgress') return state

  switch (event.type) {
    case 'Tick':
      return state
    case 'Answer':
      return answer(state, event, now)
    case 'Skip':
      return skip(state, event, now)
    case 'GoTo':
      return goTo(state, event.index)
    case 'Finish':
      return finishEarly(state, now)
    default:
      return assertNever(event)
  }
}

function answer(
  state: ExamState,
  event: Extract<ExamEvent, { type: 'Answer' }>,
  now: Date,
): ExamState {
  let found = false
  const slots = state.slots.map((slot) => {
    if (slot.questionId !== event.questionId) return slot
    found = true
    if (slot.status === 'answered') return slot
    return {
      questionId: slot.questionId,
      answerId: event.answerId,
      status: 'answered' as const,
      correct: event.correct,
      answeredAt: now.toISOString(),
    }
  })
  if (!found) return state

  const mistakes = mistakeCount(slots)
  const failed = state.config.failFastOnMistakeLimit && mistakes > state.config.maxMistakes
  const complete = slots.every((slot) => slot.status === 'answered')
  if (failed) return { ...state, slots, phase: 'failed', finishedAt: now.toISOString() }
  if (complete) return { ...state, slots, phase: 'finished', finishedAt: now.toISOString() }
  return { ...state, slots }
}

function skip(
  state: ExamState,
  event: Extract<ExamEvent, { type: 'Skip' }>,
  now: Date,
): ExamState {
  if (!state.config.allowSkip) return state
  const slots = state.slots.map((slot) => {
    if (slot.questionId !== event.questionId || slot.status === 'answered') return slot
    return {
      questionId: slot.questionId,
      answerId: null,
      status: 'skipped' as const,
      correct: null,
      answeredAt: now.toISOString(),
    }
  })
  return { ...state, slots, index: nextOpenIndex(state.questionIds, slots, state.index) }
}

function goTo(state: ExamState, index: number): ExamState {
  if (!state.config.allowReturnToOpen) return state
  if (index < 0 || index >= state.questionIds.length) return state
  return { ...state, index }
}

function finishEarly(state: ExamState, now: Date): ExamState {
  const passed =
    mistakeCount(state.slots) <= state.config.maxMistakes &&
    state.slots.every((slot) => slot.status === 'answered')
  return finish(state, passed ? 'finished' : 'failed', now)
}

function finish(state: ExamState, phase: 'finished' | 'timedOut' | 'failed', now: Date): ExamState {
  return { ...state, phase, finishedAt: now.toISOString() }
}

function nextOpenIndex(questionIds: string[], slots: ExamSlot[], current: number): number {
  const open = (index: number) => {
    const id = questionIds[index]
    const slot = slots.find((item) => item.questionId === id)
    return slot?.status !== 'answered'
  }
  for (let offset = 1; offset <= questionIds.length; offset += 1) {
    const index = (current + offset) % questionIds.length
    if (open(index)) return index
  }
  return current
}

function assertNever(value: never): never {
  throw new Error(`Unexpected exam event: ${JSON.stringify(value)}`)
}
