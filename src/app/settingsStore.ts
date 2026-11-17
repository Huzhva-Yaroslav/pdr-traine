import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeChoice = 'system' | 'light' | 'dark'

type SettingsState = {
  language: 'uk' | 'ru'
  category: string
  shuffleAnswers: boolean
  instantFeedback: boolean
  theme: ThemeChoice
  setLanguage: (language: 'uk' | 'ru') => void
  setCategory: (category: string) => void
  setShuffleAnswers: (shuffleAnswers: boolean) => void
  setInstantFeedback: (instantFeedback: boolean) => void
  setTheme: (theme: ThemeChoice) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'uk',
      category: 'B',
      shuffleAnswers: false,
      instantFeedback: true,
      theme: 'system',
      setLanguage: (language) => set({ language }),
      setCategory: (category) => set({ category }),
      setShuffleAnswers: (shuffleAnswers) => set({ shuffleAnswers }),
      setInstantFeedback: (instantFeedback) => set({ instantFeedback }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'pdr-settings' },
  ),
)

export function applyTheme(theme: ThemeChoice): void {
  const media = window.matchMedia?.('(prefers-color-scheme: dark)')
  const dark = theme === 'dark' || (theme === 'system' && Boolean(media?.matches))
  document.documentElement.classList.toggle('dark', dark)
}
