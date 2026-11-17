import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useBank } from '../../app/BankProvider'
import { Screen } from '../../app/Screen'
import { useSettings } from '../../app/settingsStore'
import { recordAnswer } from '../../data/repositories'
import {
  gradeAnswer,
  selectByTicket,
  selectByTopic,
  selectDue,
  selectMistakes,
  selectRandom,
  shuffleAnswers,
  trainingSessionSize,
} from '../../domain'
import type { Question } from '../../domain'
import { QuestionCard } from '../questions/ui/QuestionCard'
import { Button } from '../../shared/ui/Button'

export function TrainingPage() {
  const { t } = useTranslation()
  const params = useParams()
  const mode = params.mode ?? 'random'
  const bank = useBank()
  const settings = useSettings()
  const sessionKey = `${mode}:${params.id ?? ''}`
  const [activeKey, setActiveKey] = useState(sessionKey)
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [index, setIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  if (activeKey !== sessionKey) {
    setActiveKey(sessionKey)
    setQuestions(null)
    setIndex(0)
    setSelectedId(null)
    setRevealed(false)
  }

  useEffect(() => {
    if (bank.status !== 'ready' || questions) return
    const pool = pick(mode, params.id, bank.questions, bank.progress, settings.category)
    const next = settings.shuffleAnswers
      ? pool.map((question) => shuffleAnswers(question, Math.random))
      : pool
    setQuestions(next)
  }, [bank, mode, params.id, questions, settings.category, settings.shuffleAnswers])

  const question = questions?.[index]

  async function commit(answerId: string, current: Question) {
    const correct = gradeAnswer(current, answerId)
    setSelectedId(answerId)
    setRevealed(true)
    await recordAnswer(current, correct, new Date())
    if (bank.status === 'ready') await bank.reloadProgress()
  }

  if (bank.status === 'loading') {
    return (
      <Screen>
        <p>{t('home.loading')}</p>
      </Screen>
    )
  }
  if (bank.status === 'error') {
    return (
      <Screen>
        <p role="alert">{t('home.error')}</p>
      </Screen>
    )
  }
  if (!questions) {
    return (
      <Screen>
        <p>{t('home.loading')}</p>
      </Screen>
    )
  }
  if (!question) {
    return (
      <Screen>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-lg font-semibold">{index > 0 && questions.length > 0 ? t('train.done') : t('train.empty')}</p>
          <Link className="mt-4 inline-flex min-h-11 items-center text-teal-800 underline" to="/">
            {t('common.back')}
          </Link>
        </section>
      </Screen>
    )
  }

  const progress = Math.round((index / questions.length) * 100)

  return (
    <Screen>
      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-500">
          <span>
            {index + 1} / {questions.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" aria-hidden="true">
          <div className="h-full rounded-full bg-teal-700" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <QuestionCard
        question={question}
        selectedAnswerId={selectedId}
        locked={revealed}
        showVerdict={revealed && settings.instantFeedback}
        onSelect={(answerId) => {
          if (revealed) return
          if (settings.instantFeedback) {
            void commit(answerId, question)
            return
          }
          setSelectedId(answerId)
        }}
      />
      {!settings.instantFeedback && !revealed ? (
        <Button
          disabled={!selectedId}
          onClick={() => {
            if (selectedId) void commit(selectedId, question)
          }}
        >
          {t('train.confirm')}
        </Button>
      ) : null}
      <div className="flex gap-2">
        {revealed ? (
          <Button
            onClick={() => {
              setIndex((value) => value + 1)
              setSelectedId(null)
              setRevealed(false)
            }}
          >
            {t('train.next')}
          </Button>
        ) : (
          <Button
            tone="secondary"
            onClick={() => {
              setIndex((value) => value + 1)
              setSelectedId(null)
            }}
          >
            {t('train.skip')}
          </Button>
        )}
      </div>
    </Screen>
  )
}

function pick(
  mode: string,
  id: string | undefined,
  questions: Question[],
  progress: Parameters<typeof selectMistakes>[1],
  category: string,
): Question[] {
  if (mode === 'ticket' && id) return selectByTicket(questions, id)
  if (mode === 'topic' && id) return selectByTopic(questions, id)
  if (mode === 'mistakes') return selectMistakes(questions, progress)
  if (mode === 'due') return selectDue(questions, progress, new Date())
  return selectRandom(
    questions.filter((question) => question.categories.includes(category)),
    trainingSessionSize,
    Math.random,
  )
}
