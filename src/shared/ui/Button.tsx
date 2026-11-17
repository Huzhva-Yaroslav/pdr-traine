import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'secondary' | 'ghost'
}

const tones: Record<NonNullable<Props['tone']>, string> = {
  primary: 'bg-teal-800 text-white shadow-sm hover:bg-teal-900 disabled:bg-slate-300 disabled:text-slate-500',
  secondary:
    'border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100',
  ghost: 'bg-transparent text-teal-800 underline dark:text-teal-300',
}

export function Button({ tone = 'primary', className = '', type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={`min-h-11 rounded-xl px-4 py-2 text-base font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed ${tones[tone]} ${className}`}
      {...props}
    />
  )
}
