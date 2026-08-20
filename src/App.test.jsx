import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App.jsx'

const auth = vi.hoisted(() => ({ session: null }))

vi.mock('./lib/supabase.js', () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: auth.session } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signOut: vi.fn(),
    },
  },
}))

describe('App', () => {
  beforeEach(() => {
    auth.session = null
  })

  it('asks a signed-out visitor for an email', async () => {
    render(<App />)
    expect(
      await screen.findByRole('heading', { name: /top friends/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('lets a signed-in user back out', async () => {
    auth.session = { user: { email: 'karl@example.com' } }
    render(<App />)
    expect(await screen.findByText('karl@example.com')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /sign out/i }),
    ).toBeInTheDocument()
  })
})
