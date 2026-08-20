import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import SignIn from './SignIn.jsx'

const signInWithOtp = vi.hoisted(() => vi.fn())

vi.mock('../lib/supabase.js', () => ({
  supabase: { auth: { signInWithOtp } },
}))

describe('SignIn', () => {
  beforeEach(() => {
    signInWithOtp.mockReset()
  })

  it('sends a link to the normalized address', async () => {
    signInWithOtp.mockResolvedValue({ error: null })
    render(<SignIn />)

    await userEvent.type(screen.getByLabelText(/email/i), '  Karl@Example.COM ')
    await userEvent.click(screen.getByRole('button', { name: /send me/i }))

    expect(signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'karl@example.com' }),
    )
    expect(await screen.findByText(/link sent/i)).toBeInTheDocument()
  })

  it('never asks Supabase to create the account', async () => {
    signInWithOtp.mockResolvedValue({ error: null })
    render(<SignIn />)

    await userEvent.type(screen.getByLabelText(/email/i), 'karl@example.com')
    await userEvent.click(screen.getByRole('button', { name: /send me/i }))

    expect(signInWithOtp.mock.calls[0][0].options.shouldCreateUser).toBe(false)
  })

  it('stays put on a junk address', async () => {
    render(<SignIn />)
    await userEvent.type(screen.getByLabelText(/email/i), 'karl')
    expect(screen.getByRole('button', { name: /send me/i })).toBeDisabled()
    expect(signInWithOtp).not.toHaveBeenCalled()
  })

  it('reports a failure in plain english', async () => {
    signInWithOtp.mockResolvedValue({ error: { code: 'otp_disabled' } })
    render(<SignIn />)

    await userEvent.type(screen.getByLabelText(/email/i), 'nope@example.com')
    await userEvent.click(screen.getByRole('button', { name: /send me/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no account/i)
  })
})
