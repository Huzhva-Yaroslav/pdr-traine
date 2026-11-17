import { useTranslation } from 'react-i18next'

import type { ExamSlot } from '../../domain'

type Props = {
  slots: ExamSlot[]
  currentIndex: number
  onGoTo: (index: number) => void
}

export function QuestionNavigator({ slots, currentIndex, onGoTo }: Props) {
  const { t } = useTranslation()
  return (
    <nav aria-label={t('exam.navigator')} className="sticky bottom-20 z-10 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      {slots.map((slot, index) => {
        const label =
          slot.status === 'answered'
            ? slot.correct
              ? t('train.correct')
              : t('train.wrong')
            : slot.status === 'skipped'
              ? t('exam.skipped')
              : t('exam.unanswered')
        const color =
          slot.status === 'answered' && slot.correct
            ? 'bg-emerald-700 text-white'
            : slot.status === 'answered'
              ? 'bg-red-700 text-white'
              : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
        return (
          <button
            key={slot.questionId}
            type="button"
            aria-current={index === currentIndex ? 'true' : undefined}
            aria-label={`${index + 1}: ${label}`}
            className={`min-h-11 min-w-11 rounded-md px-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${color} ${index === currentIndex ? 'ring-2 ring-slate-900 dark:ring-white' : ''}`}
            onClick={() => onGoTo(index)}
          >
            {index + 1}
            <span className="sr-only">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
