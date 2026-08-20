import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Shell from './Shell.jsx'

const state = vi.hoisted(() => ({ profile: null, loading: false }))
const saveName = vi.hoisted(() => vi.fn())

vi.mock('../lib/useProfile.js', () => ({
  useProfile: () => ({ ...state, saveName }),
}))

vi.mock('../lib/supabase.js', () => ({
  supabase: { auth: { signOut: vi.fn() } },
}))

const session = { user: { email: 'karl@example.com' } }

describe('Shell', () => {
  beforeEach(() => {
    state.profile = null
    state.loading = false
    saveName.mockReset().mockResolvedValue({ error: null })
  })

  it('asks for a name when there is no profile yet', () => {
    render(<Shell session={session} />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  })

  it('greets by name once there is one', () => {
    state.profile = { display_name: 'Karl' }
    render(<Shell session={session} />)
    expect(screen.getByText('hello, Karl')).toBeInTheDocument()
  })

  it('keeps a way out while the name is still missing', async () => {
    render(<Shell session={session} />)
    await userEvent.click(screen.getByRole('button', { name: /settings/i }))
    expect(
      screen.getByRole('button', { name: /sign out/i }),
    ).toBeInTheDocument()
  })

  it('shows the email in settings and comes back', async () => {
    state.profile = { display_name: 'Karl' }
    render(<Shell session={session} />)

    await userEvent.click(screen.getByRole('button', { name: /settings/i }))
    expect(screen.getByText('karl@example.com')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText('hello, Karl')).toBeInTheDocument()
  })
})
