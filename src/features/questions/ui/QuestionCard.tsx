import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { Question } from '../../../domain'

type Props = {
  question: Question
  selectedAnswerId: string | null
  locked: boolean
  showVerdict: boolean
  onSelect: (answerId: string) => void
}

export function QuestionCard({ question, selectedAnswerId, locked, showVerdict, onSelect }: Props) {
  const { t } = useTranslation()
  const correct = selectedAnswerId === question.correctAnswerId

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Enter') return
      const index = Number(event.key) - 1
      const answer = question.answers[index]
      if (!answer || locked) return
      event.preventDefault()
      onSelect(answer.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [locked, onSelect, question.answers])

  return (
    <article className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold leading-snug tracking-tight">{question.text}</h2>
      {question.images?.map((src) => (
        <img
          key={src}
          src={`/data/v1/${src}`}
          alt={t('train.situation')}
          className="aspect-[3/2] w-full rounded-2xl border border-slate-200 bg-white object-contain shadow-sm dark:border-slate-700"
        />
      ))}
      <ul className="flex flex-col gap-2">
        {question.answers.map((answer, index) => {
          const selected = answer.id === selectedAnswerId
          const isCorrect = answer.id === question.correctAnswerId
          let tone = 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
          if (selected && !showVerdict) tone = 'border-teal-700 bg-teal-50 dark:bg-teal-950'
          if (showVerdict && selected && correct) tone = 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950'
          if (showVerdict && selected && !correct) tone = 'border-red-700 bg-red-50 dark:bg-red-950'
          if (showVerdict && !selected && isCorrect && !correct) tone = 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950'
          return (
            <li key={answer.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => onSelect(answer.id)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-default ${tone}`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold dark:bg-slate-800">
                  {index + 1}
                </span>
                <span>{answer.text}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {showVerdict ? (
        <p
          role="status"
          aria-live="polite"
          className={`rounded-2xl px-4 py-3 font-semibold ${correct ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}
        >
          {correct ? t('train.correct') : t('train.wrong')}
        </p>
      ) : null}
      {showVerdict && question.explanation ? (
        <p className="rounded-2xl bg-white px-4 py-3 leading-6 shadow-sm dark:bg-slate-900">
          <span className="font-semibold">{t('train.explanation')}: </span>
          {question.explanation}
        </p>
      ) : null}
      {showVerdict && question.rulesRef ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-semibold">{t('train.rules')}: </span>
          {question.rulesRef}
        </p>
      ) : null}
    </article>
  )
}
