import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 flex-1 items-center justify-center rounded-xl px-2 text-sm font-medium ${
    isActive
      ? 'bg-white text-teal-900 shadow-sm dark:bg-slate-800 dark:text-teal-100'
      : 'text-slate-600 dark:text-slate-300'
  }`

export function Screen({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="min-h-svh bg-slate-100 bg-[radial-gradient(circle_at_top,_#ccfbf1,_transparent_42%)] dark:bg-slate-950 dark:bg-[radial-gradient(circle_at_top,_#134e4a,_transparent_36%)]">
      <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col">
        <header className="sticky top-0 z-20 border-b border-white/60 bg-slate-100/80 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <NavLink className="text-lg font-semibold tracking-tight" to="/" end>
            {t('app.title')}
          </NavLink>
        </header>
        <main className="flex flex-1 flex-col gap-5 px-4 py-5">{children}</main>
        <p className="px-4 pb-24 text-xs leading-5 text-slate-500 dark:text-slate-400">{t('app.disclaimer')}</p>
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-slate-100/95 px-3 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
          <div className="mx-auto flex max-w-lg gap-1">
            <NavLink className={linkClass} to="/" end>
              {t('nav.home')}
            </NavLink>
            <NavLink className={linkClass} to="/stats">
              {t('nav.stats')}
            </NavLink>
            <NavLink className={linkClass} to="/settings">
              {t('nav.settings')}
            </NavLink>
          </div>
        </nav>
      </div>
    </div>
  )
}
