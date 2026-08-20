import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import NameForm from './NameForm.jsx'

describe('NameForm', () => {
  it('saves the normalized name', async () => {
    const onSave = vi.fn().mockResolvedValue({ error: null })
    render(<NameForm submitLabel="That's me" onSave={onSave} />)

    await userEvent.type(screen.getByLabelText(/name/i), '  Karl   Sims ')
    await userEvent.click(screen.getByRole('button', { name: /that's me/i }))

    expect(onSave).toHaveBeenCalledWith('Karl Sims')
    expect(await screen.findByText('Saved.')).toBeInTheDocument()
  })

  it('refuses an empty name', async () => {
    const onSave = vi.fn()
    render(<NameForm submitLabel="That's me" onSave={onSave} />)

    await userEvent.type(screen.getByLabelText(/name/i), '   ')
    expect(screen.getByRole('button', { name: /that's me/i })).toBeDisabled()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('will not re-save an unchanged name', () => {
    render(
      <NameForm initialName="Karl" submitLabel="Save" onSave={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('reports a failure instead of claiming success', async () => {
    const onSave = vi.fn().mockResolvedValue({ error: { code: '23514' } })
    render(<NameForm submitLabel="Save" onSave={onSave} />)

    await userEvent.type(screen.getByLabelText(/name/i), 'Karl')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText('Saved.')).not.toBeInTheDocument()
  })
})
