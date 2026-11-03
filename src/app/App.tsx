import { useTranslation } from 'react-i18next'

function App() {
  const { t } = useTranslation()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-white px-4 py-8 text-center dark:bg-slate-900">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {t('app.title')}
      </h1>
      <p className="max-w-prose text-sm text-slate-600 dark:text-slate-400">
        {t('app.disclaimer')}
      </p>
    </main>
  )
}

export default App
