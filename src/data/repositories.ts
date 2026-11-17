import { applyProgress, correctCount, examPassed } from '../domain'
import type { ExamState, Question, UserProgress } from '../domain'
import { db, type StoredAttempt } from './db'

export async function listProgress(): Promise<UserProgress[]> {
  return db.progress.toArray()
}

export async function saveProgress(rows: UserProgress[]): Promise<void> {
  await db.progress.bulkPut(rows)
}

export async function recordAnswer(
  question: Question,
  correct: boolean,
  now: Date,
): Promise<UserProgress> {
  await requestPersistentStorage()
  const previous = await db.progress.get(question.id)
  const next = applyProgress(previous, question, correct, now)
  await db.progress.put(next)
  return next
}

export async function saveExam(state: ExamState): Promise<void> {
  const row: StoredAttempt = {
    id: state.id,
    mode: 'exam',
    status: state.phase,
    startedAt: state.startedAt,
    payload: state,
    score: correctCount(state.slots),
    passed: examPassed(state),
  }
  if (state.finishedAt) row.finishedAt = state.finishedAt
  await db.attempts.put(row)
}

export async function findOpenExam(): Promise<ExamState | undefined> {
  const rows = await db.attempts.where('status').equals('inProgress').toArray()
  return rows.find((row) => row.mode === 'exam')?.payload
}

export async function listAttempts(): Promise<StoredAttempt[]> {
  return db.attempts.orderBy('startedAt').reverse().toArray()
}

export async function exportProgressJson(): Promise<string> {
  const [progress, attempts] = await Promise.all([listProgress(), db.attempts.toArray()])
  return JSON.stringify({ progress, attempts }, null, 2)
}

export async function importProgressJson(raw: string): Promise<void> {
  const parsed = JSON.parse(raw) as { progress?: UserProgress[]; attempts?: StoredAttempt[] }
  const progress = parsed.progress
  const attempts = parsed.attempts
  if (!Array.isArray(progress) || !Array.isArray(attempts)) {
    throw new Error('INVALID_BACKUP')
  }
  await db.transaction('rw', db.progress, db.attempts, async () => {
    await db.progress.clear()
    await db.attempts.clear()
    await db.progress.bulkPut(progress)
    await db.attempts.bulkPut(attempts)
  })
}

async function requestPersistentStorage(): Promise<void> {
  if (navigator.storage?.persist) {
    await navigator.storage.persist()
  }
}

