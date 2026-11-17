import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useBank } from '../../app/BankProvider'
import { Screen } from '../../app/Screen'

export function HomePage() {
  const { t } = useTranslation()
  const bank = useBank()
  const tickets =
    bank.status === 'ready'
      ? [...new Set(bank.questions.map((question) => question.ticketId))].sort(
          (left, right) => Number(left) - Number(right),
        )
      : []

  return (
    <Screen>
      <h1 className="text-3xl font-semibold tracking-tight">{t('home.train')}</h1>
      {bank.status === 'loading' ? <p className="text-slate-500">{t('home.loading')}</p> : null}
      {bank.status === 'error' ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800" role="alert">
          {t('home.error')}
        </p>
      ) : null}
      {bank.status === 'ready' ? (
        <>
          <div className="grid gap-3">
            <Link className="flex min-h-14 items-center justify-center rounded-2xl bg-teal-800 px-4 text-center font-semibold text-white shadow-sm" to="/train/random">
              {t('home.random')}
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Link className="flex min-h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-center font-medium shadow-sm dark:border-slate-700 dark:bg-slate-900" to="/train/mistakes">
                {t('home.mistakes')}
              </Link>
              <Link className="flex min-h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-center font-medium shadow-sm dark:border-slate-700 dark:bg-slate-900" to="/train/due">
                {t('home.due')}
              </Link>
            </div>
            <Link className="flex min-h-14 items-center justify-center rounded-2xl bg-amber-700 px-4 text-center font-semibold text-white shadow-sm" to="/exam">
              {t('home.exam')}
            </Link>
          </div>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">{t('home.tickets')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {tickets.map((ticketId) => (
                <Link
                  key={ticketId}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-3 font-medium dark:bg-slate-800"
                  to={`/train/ticket/${ticketId}`}
                >
                  {t('home.ticket', { n: ticketId })}
                </Link>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-lg font-semibold">{t('home.topics')}</h2>
            <div className="flex flex-col">
              {bank.topics.map((topic) => (
                <Link
                  key={topic.id}
                  className="flex min-h-11 items-center border-b border-slate-100 text-teal-900 last:border-0 dark:border-slate-800 dark:text-teal-200"
                  to={`/train/topic/${topic.id}`}
                >
                  {topic.title}
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </Screen>
  )
}
