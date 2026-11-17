import Dexie, { type EntityTable } from 'dexie'

import type { ExamState, UserProgress } from '../domain'

export type StoredAttempt = {
  id: string
  mode: 'exam' | 'training'
  status: ExamState['phase']
  startedAt: string
  finishedAt?: string
  score?: number
  passed?: boolean
  payload: ExamState
}

const db = new Dexie('pdr-trainer') as Dexie & {
  progress: EntityTable<UserProgress, 'questionId'>
  attempts: EntityTable<StoredAttempt, 'id'>
}

db.version(1).stores({
  progress: 'questionId, status, nextReviewAt',
  attempts: 'id, mode, status, startedAt',
})

export { db }
