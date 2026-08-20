import { useState } from 'react'
import { TIERS, describeSaveError } from '../lib/friends.js'
import { normalizeName } from '../lib/profile.js'
import Chip from './Chip.jsx'
import './AddFriend.css'

export default function AddFriend({ onAdd }) {
  const [name, setName] = useState('')
  const [tier, setTier] = useState('adult')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const value = normalizeName(name)
  const savable = value.length > 0 && !saving

  async function handleSubmit(event) {
    event.preventDefault()
    if (!savable) return

    setSaving(true)
    setError(null)

    const { error: saveError } = await onAdd(value, tier)
    setSaving(false)
    if (saveError) setError(describeSaveError(saveError))
  }

  return (
    <form className="add-friend" onSubmit={handleSubmit}>
      <h2 className="add-friend-title">Add someone</h2>

      <label className="field-label" htmlFor="friend-name">
        Name
      </label>
      <input
        id="friend-name"
        className="field-input"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Their name, or what you call them"
        autoComplete="off"
        // The cover exists to collect this one field; focusing it is
        // the point.
        autoFocus
        disabled={saving}
      />

      <p className="field-label">Filed under</p>
      <div className="chip-row">
        {Object.entries(TIERS).map(([key, label]) => (
          <Chip key={key} on={tier === key} onClick={() => setTier(key)}>
            {label}
          </Chip>
        ))}
      </div>

      <button type="submit" className="cover-submit" disabled={!savable}>
        {saving ? 'Adding…' : 'Add to the wall'}
      </button>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
