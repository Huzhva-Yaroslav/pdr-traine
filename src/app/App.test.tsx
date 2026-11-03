import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'
import uk from '../shared/i18n/locales/uk.json'
import '../shared/i18n'

describe('App', () => {
  it('renders the Ukrainian title and disclaimer from i18n', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: uk.app.title }),
    ).toBeInTheDocument()
    expect(screen.getByText(uk.app.disclaimer)).toBeInTheDocument()
  })
})
