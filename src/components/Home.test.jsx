import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Home from './Home.jsx'
import { toISODate } from '../lib/friends.js'

const state = vi.hoisted(() => ({ friends: [], loading: false, loadError: null }))
const addFriend = vi.hoisted(() => vi.fn())
const logMeetup = vi.hoisted(() => vi.fn())

vi.mock('../lib/useFriends.js', () => ({
  useFriends: () => ({ ...state, addFriend, logMeetup }),
}))

const session = { user: { id: 'user-1' } }
const todayISO = toISODate(new Date())

function person(overrides) {
  return {
    id: 'p1',
    name: 'Kim',
    depth_tier: 'adult',
    created_at: '2026-08-01T00:00:00Z',
    bindings: [],
    meetups: [],
    ...overrides,
  }
}

describe('Home', () => {
  beforeEach(() => {
    state.friends = []
    state.loading = false
    state.loadError = null
    addFriend.mockReset().mockResolvedValue({ error: null })
    logMeetup.mockReset().mockResolvedValue({ error: null })
  })

  it('admits the wall is empty', () => {
    render(<Home session={session} adding={false} onCloseAdd={() => {}} />)
    expect(screen.getByText(/nobody on the wall/i)).toBeInTheDocument()
  })

  it('shows each friend with a quiet label', () => {
    state.friends = [
      person({ meetups: [{ id: 'm1', binding_id: null, met_on: todayISO }] }),
      person({ id: 'p2', name: 'Tom' }),
    ]
    render(<Home session={session} adding={false} onCloseAdd={() => {}} />)

    expect(screen.getByText('Kim')).toBeInTheDocument()
    expect(screen.getByText('this wk')).toBeInTheDocument()
    expect(screen.getByText('Tom')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('adds someone from the cover and closes it', async () => {
    const onCloseAdd = vi.fn()
    render(<Home session={session} adding onCloseAdd={onCloseAdd} />)

    await userEvent.type(screen.getByLabelText(/name/i), 'Priya')
    await userEvent.click(screen.getByRole('button', { name: /university/i }))
    await userEvent.click(screen.getByRole('button', { name: /add to the wall/i }))

    expect(addFriend).toHaveBeenCalledWith('Priya', 'uni')
    expect(onCloseAdd).toHaveBeenCalled()
  })

  it('logs a default catch-up for today', async () => {
    state.friends = [person()]
    render(<Home session={session} adding={false} onCloseAdd={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: /kim/i }))
    expect(screen.getByText(/saw them — what was it/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /log it/i }))
    expect(logMeetup).toHaveBeenCalledWith('p1', {
      bindingId: null,
      newLabel: null,
      metOn: todayISO,
    })
  })

  it('logs against a new standing thing', async () => {
    state.friends = [person()]
    render(<Home session={session} adding={false} onCloseAdd={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: /kim/i }))
    await userEvent.click(screen.getByRole('button', { name: /new thing/i }))

    // Nothing named yet, so it can't be logged.
    expect(screen.getByRole('button', { name: /log it/i })).toBeDisabled()

    await userEvent.type(
      screen.getByLabelText(/name the standing thing/i),
      'Book club',
    )
    await userEvent.click(screen.getByRole('button', { name: /log it/i }))

    expect(logMeetup).toHaveBeenCalledWith('p1', {
      bindingId: null,
      newLabel: 'Book club',
      metOn: todayISO,
    })
  })

  it('offers existing bindings as chips', async () => {
    state.friends = [
      person({
        bindings: [{ id: 'b1', label: 'Pubby', active: true }],
        meetups: [{ id: 'm1', binding_id: 'b1', met_on: '2026-08-01' }],
      }),
    ]
    render(<Home session={session} adding={false} onCloseAdd={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: /kim/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Pubby' }))
    await userEvent.click(screen.getByRole('button', { name: /log it/i }))

    expect(logMeetup).toHaveBeenCalledWith('p1', {
      bindingId: 'b1',
      newLabel: null,
      metOn: todayISO,
    })
  })
})
