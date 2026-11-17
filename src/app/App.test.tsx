import { readFileSync } from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import uk from '../shared/i18n/locales/uk.json'
import App from './App'
import '../shared/i18n'

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', async (url: string) => {
      const name = String(url).split('/').pop() ?? ''
      const text = readFileSync(path.join(process.cwd(), 'public/data/v1', name), 'utf8')
      return new Response(text, { status: 200 })
    })
  })

  it('renders the question menu after the synthetic bank loads', async () => {
    render(<App />)

    expect(await screen.findByRole('link', { name: uk.home.random })).toBeInTheDocument()
    expect(screen.getByText(uk.app.disclaimer)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: uk.home.exam })).toBeInTheDocument()
  })
})
