import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ExamPage } from '../features/exam/ExamPage'
import { HomePage } from '../features/home/HomePage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { StatsPage } from '../features/stats/StatsPage'
import { TrainingPage } from '../features/training/TrainingPage'
import i18n from '../shared/i18n'
import { BankProvider } from './BankProvider'
import { applyTheme, useSettings } from './settingsStore'

function App() {
  const theme = useSettings((state) => state.theme)
  const language = useSettings((state) => state.language)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    void i18n.changeLanguage(language)
  }, [language])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <BankProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/train/:mode" element={<TrainingPage />} />
          <Route path="/train/:mode/:id" element={<TrainingPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BankProvider>
    </BrowserRouter>
  )
}

export default App
