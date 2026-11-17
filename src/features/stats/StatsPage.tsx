import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useBank } from '../../app/BankProvider'
import { Screen } from '../../app/Screen'
import { listAttempts } from '../../data/repositories'
import type { StoredAttempt } from '../../data/db'
import { selectDue, topicStats, weakTopics } from '../../domain'

export function StatsPage() {
  const { t } = useTranslation()
  const bank = useBank()
  const [attempts, setAttempts] = useState<StoredAttempt[]>([])

  useEffect(() => {
    void listAttempts().then(setAttempts)
  }, [bank])

  if (bank.status !== 'ready') {
    return (
      <Screen>
        <p>{bank.status === 'error' ? t('home.error') : t('home.loading')}</p>
      </Screen>
    )
  }

  const stats = topicStats(bank.questions, bank.topics, bank.progress)
  const weak = weakTopics(stats)
  const due = selectDue(bank.questions, bank.progress, new Date())
  const exams = attempts.filter((attempt) => attempt.mode === 'exam' && attempt.status !== 'inProgress')

  return (
    <Screen>
      <h1 className="text-3xl font-semibold tracking-tight">{t('stats.title')}</h1>
      {bank.progress.length === 0 ? <p className="text-slate-500">{t('stats.empty')}</p> : null}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">{t('stats.weak')}</h2>
        {weak.length === 0 ? <p className="mt-2 text-slate-500">{t('stats.noWeak')}</p> : null}
        <ul className="mt-2">
          {weak.map((topic) => (
            <li key={topic.topicId}>
              <Link className="flex min-h-11 items-center justify-between" to={`/train/topic/${topic.topicId}`}>
                <span>{topic.title}</span>
                <span className="font-semibold">{Math.round(topic.accuracy * 100)}%</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-lg font-semibold">{t('stats.accuracy')}</h2>
        <ul className="flex flex-col gap-3">
          {stats.map((topic) => (
            <li key={topic.topicId}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{topic.title}</span>
                <span>{topic.seen === 0 ? '—' : `${Math.round(topic.accuracy * 100)}%`}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-2 rounded-full bg-teal-700" style={{ width: `${topic.accuracy * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <Link className="flex min-h-14 items-center justify-between rounded-2xl bg-teal-800 px-4 font-semibold text-white" to="/train/due">
        <span>{t('stats.due')}</span>
        <span>{due.length}</span>
      </Link>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-lg font-semibold">{t('stats.history')}</h2>
        <ul className="flex flex-col gap-2">
          {exams.map((attempt) => (
            <li key={attempt.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
              {new Date(attempt.startedAt).toLocaleString()} — {attempt.score ?? 0} / 20 —{' '}
              {attempt.passed ? t('exam.passed') : t('exam.failed')}
            </li>
          ))}
        </ul>
      </section>
    </Screen>
  )
}
