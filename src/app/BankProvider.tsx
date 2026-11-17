import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { reconcileProgress } from '../domain'
import type { Manifest, Question, Topic, UserProgress } from '../domain'
import { loadQuestionBank } from '../data/questionLoader'
import { listProgress, saveProgress } from '../data/repositories'

type ReadyBank = {
  status: 'ready'
  manifest: Manifest
  questions: Question[]
  topics: Topic[]
  progress: UserProgress[]
  reloadProgress: () => Promise<void>
}

type BankValue =
  | { status: 'loading' }
  | { status: 'error' }
  | ReadyBank

const BankContext = createContext<BankValue>({ status: 'loading' })

export function BankProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<BankValue>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const bank = await loadQuestionBank()
        const progress = reconcileProgress(bank.questions, await listProgress())
        await saveProgress(progress)
        if (cancelled) return
        const reloadProgress = async () => {
          const rows = await listProgress()
          setValue((current) => (current.status === 'ready' ? { ...current, progress: rows } : current))
        }
        setValue({ status: 'ready', ...bank, progress, reloadProgress })
      } catch {
        if (!cancelled) setValue({ status: 'error' })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const provided = useMemo(() => value, [value])
  return <BankContext.Provider value={provided}>{children}</BankContext.Provider>
}

// Hook lives next to the provider so pages share one bank cache.
// eslint-disable-next-line react-refresh/only-export-components
export function useBank(): BankValue {
  return useContext(BankContext)
}
