import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useBank } from '../../app/BankProvider'
import { Screen } from '../../app/Screen'
import { useSettings } from '../../app/settingsStore'
import { exportProgressJson, importProgressJson } from '../../data/repositories'
import { Button } from '../../shared/ui/Button'

export function SettingsPage() {
  const { t } = useTranslation()
  const bank = useBank()
  const settings = useSettings()
  const [message, setMessage] = useState('')
  const categories =
    bank.status === 'ready'
      ? [...new Set(bank.questions.flatMap((question) => question.categories))]
      : [settings.category]

  return (
    <Screen>
      <h1 className="text-3xl font-semibold tracking-tight">{t('settings.title')}</h1>
      <label className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {t('settings.language')}
        <select
          className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800"
          value={settings.language}
          onChange={(event) => settings.setLanguage(event.target.value === 'ru' ? 'ru' : 'uk')}
        >
          <option value="uk">{t('common.uk')}</option>
          <option value="ru">{t('common.ru')}</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {t('settings.category')}
        <select
          className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800"
          value={settings.category}
          onChange={(event) => settings.setCategory(event.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <input
          className="h-5 w-5 accent-teal-800"
          type="checkbox"
          checked={settings.shuffleAnswers}
          onChange={(event) => settings.setShuffleAnswers(event.target.checked)}
        />
        {t('settings.shuffle')}
      </label>
      <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <input
          className="h-5 w-5 accent-teal-800"
          type="checkbox"
          checked={settings.instantFeedback}
          onChange={(event) => settings.setInstantFeedback(event.target.checked)}
        />
        {t('settings.feedback')}
      </label>
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <legend className="px-1 font-medium">{t('settings.theme')}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button tone={settings.theme === 'system' ? 'primary' : 'secondary'} onClick={() => settings.setTheme('system')}>
            {t('settings.themeSystem')}
          </Button>
          <Button tone={settings.theme === 'light' ? 'primary' : 'secondary'} onClick={() => settings.setTheme('light')}>
            {t('settings.themeLight')}
          </Button>
          <Button tone={settings.theme === 'dark' ? 'primary' : 'secondary'} onClick={() => settings.setTheme('dark')}>
            {t('settings.themeDark')}
          </Button>
        </div>
      </fieldset>
      <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-950">{t('settings.installHint')}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            void exportProgressJson().then((json) => {
              const blob = new Blob([json], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = 'pdr-progress.json'
              link.click()
              URL.revokeObjectURL(url)
            })
          }}
        >
          {t('settings.export')}
        </Button>
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {t('settings.import')}
          <input
            className="sr-only"
            type="file"
            accept="application/json"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              void file.text().then(async (raw) => {
                try {
                  await importProgressJson(raw)
                  if (bank.status === 'ready') await bank.reloadProgress()
                  setMessage(t('settings.imported'))
                } catch {
                  setMessage(t('settings.importError'))
                }
              })
            }}
          />
        </label>
      </div>
      {message ? <p role="status">{message}</p> : null}
    </Screen>
  )
}
