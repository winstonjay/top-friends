import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App.jsx'

describe('App', () => {
  it('renders', () => {
    render(<App />)
    expect(screen.getByText(/top friends/i)).toBeInTheDocument()
  })
})
