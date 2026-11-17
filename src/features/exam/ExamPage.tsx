import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useBank } from '../../app/BankProvider'
import { Screen } from '../../app/Screen'
import { useSettings } from '../../app/settingsStore'
import { findOpenExam, recordAnswer, saveExam } from '../../data/repositories'
import {
  NotEnoughQuestionsError,
  buildExamQuestions,
  correctCount,
  defaultExamConfig,
  examPassed,
  gradeAnswer,
  mistakeCount,
  reduceExam,
  remainingMs,
  shuffleAnswers,
  startExam,
} from '../../domain'
import type { ExamState, Question } from '../../domain'
import { QuestionCard } from '../questions/ui/QuestionCard'
import { Button } from '../../shared/ui/Button'
import { QuestionNavigator } from './QuestionNavigator'

export function ExamPage() {
  const { t } = useTranslation()
  const bank = useBank()
  const category = useSettings((state) => state.category)
  const shuffle = useSettings((state) => state.shuffleAnswers)
  const [exam, setExam] = useState<ExamState | null>(null)
  const [saved, setSaved] = useState<ExamState | null | undefined>(undefined)
  const [clock, setClock] = useState(() => new Date())
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    void findOpenExam().then((open) => setSaved(open ?? null))
  }, [])

  const examId = exam?.id
  const examPhase = exam?.phase
  useEffect(() => {
    if (!examId || examPhase !== 'inProgress') return
    const timer = window.setInterval(() => {
      const now = new Date()
      setClock(now)
      setExam((current) => {
        if (!current || current.phase !== 'inProgress') return current
        const next = reduceExam(current, { type: 'Tick' }, now)
        if (next.phase !== current.phase) void saveExam(next)
        return next
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [examId, examPhase])

  function start(existing?: ExamState) {
    if (existing) {
      setExam(existing)
      setSaved(null)
      return
    }
    if (bank.status !== 'ready') return
    try {
      const questions = buildExamQuestions(
        bank.questions,
        category,
        defaultExamConfig.questionCount,
        Math.random,
      )
      const state = startExam({
        id: crypto.randomUUID(),
        questionIds: questions.map((question) => question.id),
        category,
        now: new Date(),
        config: defaultExamConfig,
      })
      setExam(state)
      void saveExam(state)
      setSaved(null)
      setBlocked(false)
    } catch (error) {
      if (error instanceof NotEnoughQuestionsError) setBlocked(true)
    }
  }

  if (bank.status !== 'ready' || saved === undefined) {
    return (
      <Screen>
        <p>{t('home.loading')}</p>
      </Screen>
    )
  }

  if (!exam && saved) {
    return (
      <Screen>
        <h1 className="text-3xl font-semibold tracking-tight">{t('exam.resumeTitle')}</h1>
        <div className="flex flex-col gap-2">
          <Button onClick={() => start(saved)}>{t('exam.resume')}</Button>
          <Button tone="secondary" onClick={() => start()}>
            {t('exam.restart')}
          </Button>
        </div>
      </Screen>
    )
  }

  if (!exam) {
    return (
      <Screen>
        <h1 className="text-3xl font-semibold tracking-tight">{t('home.exam')}</h1>
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {t('exam.category')}: {category}
        </p>
        {blocked ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-800" role="alert">
            {t('exam.notEnough')}
          </p>
        ) : null}
        <Button onClick={() => start()}>{t('exam.start')}</Button>
      </Screen>
    )
  }

  const stored = questionById(bank.questions, exam.questionIds[exam.index] ?? '')
  const question = stored && shuffle ? shuffleAnswers(stored, seededRng(`${exam.id}:${stored.id}`)) : stored
  const slot = exam.slots[exam.index]
  if (exam.phase !== 'inProgress') {
    return (
      <Screen>
        <h1 className="text-3xl font-semibold tracking-tight">
          {exam.phase === 'timedOut' ? t('exam.timeout') : examPassed(exam) ? t('exam.passed') : t('exam.failed')}
        </h1>
        <div className="grid grid-cols-2 gap-3">
          <p className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <span className="block text-sm text-slate-500">{t('exam.correctCount')}</span>
            <span className="text-2xl font-semibold">{correctCount(exam.slots)}</span>
          </p>
          <p className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <span className="block text-sm text-slate-500">{t('exam.mistakeCount')}</span>
            <span className="text-2xl font-semibold">{mistakeCount(exam.slots)}</span>
          </p>
        </div>
        <h2 className="text-lg font-semibold">{t('exam.review')}</h2>
        <ul className="flex flex-col gap-3">
          {exam.slots.map((item) => {
            const reviewed = questionById(bank.questions, item.questionId)
            const tone = item.correct === true ? 'border-emerald-600' : item.correct === false ? 'border-red-600' : 'border-slate-300'
            return (
              <li key={item.questionId} className={`rounded-2xl border-l-4 bg-white p-3 shadow-sm dark:bg-slate-900 ${tone}`}>
                <p>{reviewed?.text}</p>
                <p className="mt-1 text-sm font-medium">{slotLabel(item.status, item.correct, t)}</p>
              </li>
            )
          })}
        </ul>
      </Screen>
    )
  }

  const seconds = Math.max(0, Math.ceil(remainingMs(exam, clock) / 1000))
  const label = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  async function choose(answerId: string, current: Question) {
    if (!slot || slot.status === 'answered') return
    const correct = gradeAnswer(current, answerId)
    const next = reduceExam(
      exam as ExamState,
      { type: 'Answer', questionId: current.id, answerId, correct },
      new Date(),
    )
    setExam(next)
    await saveExam(next)
    await recordAnswer(current, correct, new Date())
    await bank.reloadProgress()
  }

  return (
    <Screen>
      <p className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-slate-900">
        {t('exam.time')}
        <span className="font-semibold tabular-nums">{label}</span>
      </p>
      {question && slot ? (
        <QuestionCard
          question={question}
          selectedAnswerId={slot.answerId}
          locked={slot.status === 'answered'}
          showVerdict={slot.status === 'answered'}
          onSelect={(answerId) => {
            void choose(answerId, question)
          }}
        />
      ) : null}
      <div className="flex gap-2">
        <Button
          tone="secondary"
          onClick={() => {
            if (!question) return
            const next = reduceExam(exam, { type: 'Skip', questionId: question.id }, new Date())
            setExam(next)
            void saveExam(next)
          }}
        >
          {t('exam.skipped')}
        </Button>
        <Button
          tone="secondary"
          onClick={() => {
            const next = reduceExam(exam, { type: 'Finish' }, new Date())
            setExam(next)
            void saveExam(next)
          }}
        >
          {t('exam.finish')}
        </Button>
      </div>
      <QuestionNavigator
        slots={exam.slots}
        currentIndex={exam.index}
        onGoTo={(index) => setExam(reduceExam(exam, { type: 'GoTo', index }, new Date()))}
      />
    </Screen>
  )
}

function seededRng(seed: string): () => number {
  let hash = 2166136261
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507)
    hash = (hash ^ (hash >>> 13)) >>> 0
    return hash / 4294967296
  }
}

function questionById(questions: Question[], id: string): Question | undefined {
  return questions.find((question) => question.id === id)
}

function slotLabel(
  status: string,
  correct: boolean | null,
  t: (key: string) => string,
): string {
  if (status === 'answered') return correct ? t('train.correct') : t('train.wrong')
  if (status === 'skipped') return t('exam.skipped')
  return t('exam.unanswered')
}
